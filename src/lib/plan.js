/* The group plan state machine (interactions spec 8). Pure: times come in as arguments, so every row is tested.

   draft → voting → closed → booking → booked, plus cancelled.
   The plan (S.gp) keeps its shape: { name, opts, votes: { nightId: [names] }, members, stage, booked, … }.
   Your own vote lives in S.vote (as before); `me` is passed in where it counts. */
import { addDays, istDay } from './clock.js';

const IST = 330 * 60000,
  HOUR = 3600000,
  MIN = 60000;
export const UNDO_FOR = 5000; // cancelling and leaving can be undone for 5 s
export const ME = 'You'; // you, in the plan's lists (votes and members are first names; yours is "You")

export const PLAN = {
  draft: { SHARE: 'voting', CANCEL: 'cancelled' },
  voting: { VOTE: 'voting', REMOTE: 'voting', CLOSE: 'closed', CANCEL: 'cancelled', LEAVE: 'voting', UNDO_LEAVE: 'voting' },
  // a tie: the planner picks from the tied nights (PICK); then "Book {n} passes"
  closed: { PICK: 'closed', BOOK: 'booking', REMOTE: 'closed', CANCEL: 'cancelled', LEAVE: 'closed', UNDO_LEAVE: 'closed' },
  // the booking machine runs (lib/booking.js); closing its sheet without paying goes back to closed
  booking: { SUCCESS: 'booked', BACK: 'closed', LEAVE: 'booking', UNDO_LEAVE: 'booking' },
  booked: { LEAVE: 'booked', UNDO_LEAVE: 'booked' },
  cancelled: { UNDO: 'voting' }
};

/* everyone's votes, yours included: { nightId: [names] } */
export function tally(gp, me) {
  var t = {};
  (gp.opts || []).forEach((k) => (t[k] = (gp.votes[k] || []).filter((n) => n !== ME)));
  if (me && t[me]) t[me] = t[me].concat(ME);
  return t;
}

/* the nights with the most votes (more than one = a tie); none while nobody has voted */
export function leaders(gp, me) {
  var t = tally(gp, me),
    best = 0;
  Object.keys(t).forEach((k) => (best = Math.max(best, t[k].length)));
  return best ? (gp.opts || []).filter((k) => t[k].length === best) : [];
}

/* when the vote closes by default: 8 pm (India time) today, or 2 h before the earliest night if that's sooner;
   never less than 30 min from now. nights: start times in ms */
export function defaultDeadline(nights, now) {
  var day = istDay(now),
    eight = Date.parse(day + 'T20:00:00+05:30');
  if (eight <= now) eight = Date.parse(addDays(day, 1) + 'T20:00:00+05:30');
  var earliest = Math.min.apply(null, nights.length ? nights : [Infinity]),
    at = Math.min(eight, earliest - 2 * HOUR);
  return Math.max(at, now + 30 * MIN);
}

/* "closes 8 pm", "closes Thu 8 pm", then "closes in 20 min" in the last hour, "closed" after. No seconds */
export function closesText(gp, now) {
  if (!gp.deadlineAt) return 'closes ' + (gp.deadline || 'soon');
  var left = gp.deadlineAt - now;
  if (left <= 0) return 'closed';
  if (left <= HOUR) return 'closes in ' + Math.max(1, Math.ceil(left / MIN)) + ' min';
  return 'closes ' + clockText(gp.deadlineAt, now);
}

const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
/* "8 pm", "8:30 pm", or "Thu 8 pm" when it isn't today (India time) */
export function clockText(at, now) {
  var d = new Date(at + IST),
    h = d.getUTCHours(),
    m = d.getUTCMinutes(),
    t = (h % 12 || 12) + (m ? ':' + String(m).padStart(2, '0') : '') + (h < 12 ? ' am' : ' pm');
  return istDay(at) === istDay(now) ? t : WD[d.getUTCDay()] + ' ' + t;
}

/* the plan after an event, or null when this stage doesn't accept it. d: the event's details; now: ms */
export function planStep(gp, ev, d, now) {
  if (!gp) return null;
  d = d || {};
  var to = (PLAN[gp.stage] || {})[ev];
  if (!to) return null;
  var x = Object.assign({}, gp, { stage: to });
  if (ev === 'SHARE') {
    x.deadlineAt = d.deadlineAt || defaultDeadline(d.nights || [], now);
    x.sharedAt = now;
  } else if (ev === 'VOTE') {
    if ((gp.opts || []).indexOf(d.id) < 0) return null;
  } else if (ev === 'REMOTE') {
    // what the others did since the last look (votes, who joined); your own vote stays yours
    if (d.votes) x.votes = Object.assign({}, gp.votes, d.votes);
    if (d.members) x.members = d.members;
  } else if (ev === 'CLOSE') {
    var top = leaders(gp, d.me);
    x.closedAt = now;
    x.tied = top.length > 1 ? top : null;
    x.winner = top.length === 1 ? top[0] : top.length ? null : (gp.opts || [])[0] || null;
  } else if (ev === 'PICK') {
    if (!gp.tied || gp.tied.indexOf(d.id) < 0) return null;
    x.winner = d.id;
    x.tied = null;
  } else if (ev === 'BOOK') {
    if (!gp.winner) return null;
  } else if (ev === 'SUCCESS') {
    x.booked = gp.winner;
  } else if (ev === 'CANCEL') {
    x.cancelledAt = now;
    x.before = gp.stage;
  } else if (ev === 'UNDO') {
    if (now - gp.cancelledAt > UNDO_FOR) return null;
    x.stage = gp.before || 'voting';
    x.cancelledAt = null;
  } else if (ev === 'LEAVE') {
    if (gp.members.indexOf(d.who) < 0) return null;
    var votes = {},
      had = null;
    Object.keys(gp.votes).forEach((k) => {
      if (gp.votes[k].indexOf(d.who) >= 0) had = k;
      votes[k] = gp.votes[k].filter((n) => n !== d.who);
    });
    x.members = gp.members.filter((n) => n !== d.who);
    x.votes = votes;
    x.left = Object.assign({}, gp.left, { [d.who]: { at: now, vote: had } });
  } else if (ev === 'UNDO_LEAVE') {
    var l = (gp.left || {})[d.who];
    if (!l || now - l.at > UNDO_FOR) return null;
    x.members = gp.members.concat(d.who);
    if (l.vote) x.votes = Object.assign({}, gp.votes, { [l.vote]: (gp.votes[l.vote] || []).concat(d.who) });
    x.left = Object.assign({}, gp.left);
    delete x.left[d.who];
  }
  return x;
}

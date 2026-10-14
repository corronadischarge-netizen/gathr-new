import { ME } from '../lib/plan';
import { APP_URL } from '../config';
import { demoRecord } from './demo';

/* the record of past nights: SAMPLE data, used for status, the record and Wrapped. [venue, night, date, with].
   Only the demo account has one (its four past nights, data/demo.js); empty for everyone else */
export const REC = [];
export function setDemoRecord(on) {
  if (on === REC.length > 0) return;
  REC.length = 0;
  if (on) demoRecord().forEach((r) => REC.push(r));
}

const LEVELS = [
  ['Newbie', 0, 'Your first nights out with gathr'],
  ['Regular', 3, 'Early ticket access · priority lane at door-confirmed venues'],
  ['Insider', 10, 'Everything Regular gets · reserved seating at partner venues · first look at new nights']
];

/* venues whose door gathr has confirmed (sample): the pass says "Door confirmed" */
export const DOOR_OK = { palacio: 1, dimora: 1, epitome: 1, themillers: 1 };

export const FRIEND_SHAPE = {
  Dev: ['flower', 'pink'],
  Arjun: ['arch', 'yellow'],
  Meera: ['circle', 'green'],
  Kabir: ['pill', 'blue'],
  Riya: ['flower', 'violet'],
  Tanvi: ['arch', 'pink']
};

export function nightsCount(S) {
  return REC.length + (S.checkedIn ? 1 : 0);
}

export function levelOf(n) {
  var l = LEVELS[0];
  LEVELS.forEach((x) => {
    if (n >= x[1]) l = x;
  });
  return l;
}

export function nextLevel(n) {
  for (var i = 0; i < LEVELS.length; i++) if (n < LEVELS[i][1]) return LEVELS[i];
  return null;
}

export function gpVoted(gp, vote) {
  var who = {};
  Object.keys(gp.votes).forEach((k) => {
    gp.votes[k].forEach((n) => {
      who[n] = k;
    });
  });
  if (vote) who[ME] = vote;
  return who;
}

export function gpWinner(gp, vote) {
  var best = gp.opts[0],
    bn = -1;
  gp.opts.forEach((k) => {
    var n = (gp.votes[k] || []).length + (vote === k ? 1 : 0);
    if (n > bn) {
      bn = n;
      best = k;
    }
  });
  return best;
}

export function passCode(S, e) {
  // a booking saved in Supabase has its own code, made by the database
  if (S.myBookings && S.myBookings[e.id]) return S.myBookings[e.id].code;
  var x = S.payId || e.id + (S.email || 'guest'),
    n = 0;
  for (var i = 0; i < x.length; i++) n = (n * 31 + x.charCodeAt(i)) >>> 0;
  return 'G-' + n.toString(36).toUpperCase().slice(0, 6).padStart(6, '7');
}

export function planLink(gp, by) {
  return (
    APP_URL +
    '#plan=' +
    encodeURIComponent(gp.opts.join(',')) +
    '&n=' +
    encodeURIComponent(gp.name || 'Night out') +
    '&d=' +
    encodeURIComponent(gp.deadline || '') +
    '&by=' +
    encodeURIComponent((by || '').split(' ')[0] || 'A friend')
  );
}

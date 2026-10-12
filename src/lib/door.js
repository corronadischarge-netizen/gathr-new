/* Will they let us in? One verdict for every night, card, tile and the event page (home spec 5.3, 5.4).
   door = { minAge, stag: 'allowed' | 'fee' | 'couples_only' | 'not_allowed' | null, stagFee, mixedOnly, dress, dressStrict,
            arriveBy: 'HH:MM', source: 'host' | 'gathr' | 'guests' | null, checkedAt, guestAnswers }
   Pure: no app imports beyond the group helpers, so it can be tested on its own. */
import { groupLabel, isSet, stags, under21, under25 } from '../data/group.js';

const DAY = 86400000;

/* rules we can trust: a gathr check older than 30 days, or fewer than 5 guest answers, count as not known.
   The age limit comes from the listing itself, so it stays. */
function trusted(door, t) {
  var d = Object.assign({}, door || {}),
    stale =
      (d.source === 'gathr' && (!d.checkedAt || t - Date.parse(d.checkedAt) > 30 * DAY)) ||
      (d.source === 'guests' && (d.guestAnswers || 0) < 5);
  if (stale)
    Object.assign(d, {
      stag: null,
      stagFee: null,
      mixedOnly: null,
      dress: null,
      dressStrict: false,
      arriveBy: null,
      source: null
    });
  return d;
}

/* "22:30" → "10:30" */
function clock12(hhmm) {
  var m = /^(\d{1,2}):(\d{2})$/.exec(hhmm || '');
  if (!m) return hhmm;
  return (+m[1] % 12 || 12) + ':' + m[2];
}

function rupees(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

/* the house rule in plain words, for when no group is set (never "Lets you in") */
function plainRule(d) {
  if (d.stag === 'couples_only') return 'Couples only';
  if (d.mixedOnly) return 'Mixed groups only';
  if (d.stag === 'not_allowed') return 'No stag entry';
  if (d.stag === 'fee') return 'Stags ' + rupees(d.stagFee || 0);
  if (d.stag === 'allowed') return 'Stags OK';
  return 'Stag rules unknown';
}

/* → { state: 'yes' | 'if' | 'unknown' | 'no', reasons: [text], kinds: [kind], plain, minAge, source } */
export function getDoorVerdict(door, group, profileAge, t) {
  var d = trusted(door, t),
    set = isSet(group),
    st = stags(group),
    u21 = under21(group, profileAge),
    u25 = under25(group, profileAge),
    base = { minAge: d.minAge == null ? null : d.minAge, source: d.source ? d : null, plain: false };
  function out(state, reasons, kinds) {
    return Object.assign({}, base, { state: state, reasons: reasons, kinds: kinds || [] });
  }
  // 1. no: the age limit applies whether or not a group is set (your own age is known)
  if (d.minAge != null && ((u21 && d.minAge >= 21) || (u25 && d.minAge === 25)))
    return out('no', [d.minAge + '+ only'], ['age']);
  // no group set: say the rule plainly, styled as unknown
  if (!set) {
    if (d.minAge == null && u21) return out('unknown', ['Age limit unknown'], ['age']);
    return Object.assign(out('unknown', [plainRule(d)], ['stag']), { plain: true });
  }
  if (d.stag === 'not_allowed' && st > 0) return out('no', ['No stag entry'], ['stag']);
  if (d.stag === 'couples_only' && st > 0) return out('no', ['Couples only tonight'], ['stag']);
  if (d.mixedOnly && group.type === 'guys') return out('no', ['Mixed groups only'], ['stag']);
  // 2. unknown: a rule that matters for this group is missing
  if (st > 0 && d.stag == null) return out('unknown', ['Stag rules unknown'], ['stag']);
  if (d.minAge == null && u21) return out('unknown', ['Age limit unknown'], ['age']);
  // 3. if: the group fits, but something is on them (two at most, most important first)
  var r = [],
    k = [];
  if (d.dressStrict && d.dress) {
    r.push(d.dress.toLowerCase() + ' only');
    k.push('dress');
  }
  if (d.arriveBy) {
    r.push('before ' + clock12(d.arriveBy));
    k.push('arrive');
  }
  if (d.stag === 'fee' && st > 0) {
    r.push('stags ' + rupees(d.stagFee || 0));
    k.push('fee');
  }
  if (r.length) return out('if', r.slice(0, 2), k.slice(0, 2));
  // 4. yes, and what to bring (government ID is required in Pune)
  return out('yes', [d.minAge >= 21 ? '21+ with ID' : 'ID needed'], ['id']);
}

const ICON = { yes: 'check', unknown: 'info', no: 'x' };
const IF_ICON = { dress: 'shirt', arrive: 'clock', fee: 'indian-rupee' };

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* the words and icon for a verdict. look 'pill' (hero card, event page) or 'line' (tiles and rows) */
export function verdictText(v, group, look) {
  var who = groupLabel(isSet(group) ? group : null),
    pill = look !== 'line',
    text;
  if (v.state === 'yes')
    text = pill ? 'Lets ' + who + ' in · ' + v.reasons[0] : 'Lets you in' + (v.minAge === 18 ? ' · 18+' : '');
  else if (v.state === 'if') text = pill ? 'Lets ' + who + ' in · ' + v.reasons.join(', ') : cap(v.reasons[0]);
  else text = v.reasons[0];
  return { state: v.state, text: text, icon: v.state === 'if' ? IF_ICON[v.kinds[0]] : ICON[v.state] };
}

/* where the rule came from, next to the pill: "Set by the host", "Checked by gathr · 3 days ago", "From 12 guests" */
export function sourceLine(v, t, tight) {
  var s = v && v.source;
  if (!s) return null;
  if (s.source === 'host') return 'Set by the host';
  if (s.source === 'guests') return 'From ' + s.guestAnswers + ' guests';
  if (tight) return 'Checked by gathr';
  var days = Math.max(0, Math.floor((t - Date.parse(s.checkedAt)) / DAY));
  return 'Checked by gathr · ' + (days === 0 ? 'today' : days === 1 ? '1 day ago' : days + ' days ago');
}

/* Will they let us in? One verdict for every night, card, tile and the event page (home spec 5.3, 5.4).
   door = { minAge, stag: 'allowed' | 'fee' | 'couples_only' | 'not_allowed' | null, stagFee, mixedOnly, dress, dressStrict,
            arriveBy: 'HH:MM', source: 'host' | 'gathr' | 'guests' | null, checkedAt, guestAnswers }
   Pure: no app imports beyond the group helpers, so it can be tested on its own. */
import { isSet, stags, under21, under25 } from '../data/group.js';

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
  if (d.stag === 'not_allowed') return 'No stags';
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
  if (d.stag === 'not_allowed' && st > 0) return out('no', ['No stags'], ['stag']);
  if (d.stag === 'couples_only' && st > 0) return out('no', ['Couples only'], ['stag']);
  if (d.mixedOnly && group.type === 'guys') return out('no', ['Mixed groups only'], ['stag']);
  // 2. unknown: a rule that matters for this group is missing
  if (st > 0 && d.stag == null) return out('unknown', ['Stag rules unknown'], ['stag']);
  if (d.minAge == null && u21) return out('unknown', ['Age limit unknown'], ['age']);
  // 3. if: the group fits, but something is on them (two at most, most important first)
  var r = [],
    k = [];
  if (d.dressStrict && d.dress) {
    r.push(cap(d.dress.toLowerCase()) + ' only');
    k.push('dress');
  }
  if (d.arriveBy) {
    r.push('Before ' + clock12(d.arriveBy));
    k.push('arrive');
  }
  if (d.stag === 'fee' && st > 0) {
    r.push('Stags ' + rupees(d.stagFee || 0));
    k.push('fee');
  }
  if (r.length) return out('if', r.slice(0, 2), k.slice(0, 2));
  // 4. yes, and what to bring (government ID is required in Pune)
  return out('yes', [d.minAge >= 21 ? '21+ with ID' : 'ID needed'], ['id']);
}

/* the event page's "Who gets in" rows (section 7): [icon, words], from the rules we trust */
export function doorRows(door, t) {
  var d = trusted(door, t),
    group =
      d.stag === 'couples_only'
        ? 'Couples only'
        : d.mixedOnly
          ? 'Mixed groups only'
          : d.stag === 'not_allowed'
            ? 'No stag entry'
            : d.stag === 'fee'
              ? 'Stags pay ' + rupees(d.stagFee || 0)
              : d.stag === 'allowed'
                ? 'Stag groups OK'
                : 'Stag rules not listed';
  var rows = [
    ['users', group],
    ['id-card', d.minAge != null ? d.minAge + '+, bring a government ID' : 'Age limit not listed'],
    ['shirt', d.dress ? 'Dress code: ' + d.dress.toLowerCase() : 'Dress code: not listed']
  ];
  if (d.arriveBy) rows.push(['clock', 'Get in before ' + clock12(d.arriveBy)]);
  return rows;
}

const ICON = { yes: 'check', unknown: 'info', no: 'x' };
const IF_ICON = { dress: 'shirt', arrive: 'clock', fee: 'indian-rupee' };

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* the words and icon for a verdict (r25: 20 characters at most, the group never repeated: the GroupPill says who).
   The pill (hero card, event page) and the line (tiles and rows) use the same words; group and look stay for callers.
   The ID reminder and a second condition live in doorRows, where there's room */
export function verdictText(v, group, look) {
  var text;
  // the age only when it narrows things (21+, 25+): 18+ is every night's floor, so it goes unsaid (Shubh, 14 Oct)
  if (v.state === 'yes') text = 'Lets you in' + (v.minAge >= 21 ? ' · ' + v.minAge + '+' : '');
  else text = v.reasons[0];
  return { state: v.state, text: text, icon: v.state === 'if' ? IF_ICON[v.kinds[0]] : ICON[v.state] };
}

/* where the rule came from, under the pill (r25, short): "Set by host", "Checked 3d ago", "From 12 guests".
   src = { kind: 'host' | 'gathr' | 'guests', checkedAt, count } (DoorVerdict's source prop) */
export function formatSource(src, t, tight) {
  if (!src || !src.kind) return null;
  if (src.kind === 'host') return 'Set by host';
  if (src.kind === 'guests') return 'From ' + src.count + ' guests';
  if (tight || !src.checkedAt) return 'Checked by gathr';
  var days = Math.max(0, Math.floor((t - Date.parse(src.checkedAt)) / DAY));
  return days === 0 ? 'Checked today' : 'Checked ' + days + 'd ago';
}

/* a verdict's source, in DoorVerdict's shape */
export function verdictSource(v) {
  var s = v && v.source;
  return s ? { kind: s.source, checkedAt: s.checkedAt, count: s.guestAnswers } : null;
}

export function sourceLine(v, t, tight) {
  return formatSource(verdictSource(v), t, tight);
}

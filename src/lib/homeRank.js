/* Home v3: which night is the hero, and what goes in each day's rail, in what order (home spec 5.5, 5.6).
   Pure: works on prepared items, so it can be tested on its own. An item:
   { id, start (ms), day ('YYYY-MM-DD'), verdict: { state }, friends (booked), crowd (level | null), soldOut, over,
     soundMatch, mins (travel | null), price (number | null), promoted } */
import { addDays } from './clock.js';

const ORDER = { yes: 0, if: 1, unknown: 2 };

export function heroScore(it) {
  var s = 3 * Math.min(it.friends || 0, 3);
  if (it.verdict.state === 'yes') s += 2;
  if (it.crowd === 'buzzing' || it.crowd === 'packed') s += 1;
  else if (it.crowd === 'warming') s += 0.5;
  if (it.soundMatch) s += 1;
  if (it.mins != null && it.mins > 40) s -= 1;
  return s;
}

function price(it) {
  return it.price == null ? Infinity : it.price;
}

/* the one night we're most confident about for this group on that day: not over, not sold out, lets them in,
   never a promoted night. Ties: soonest start, then lower price. → { id, score } or null */
export function heroPick(items, day) {
  var c = items.filter(
    (it) =>
      it.day === day &&
      !it.over &&
      !it.soldOut &&
      !it.promoted &&
      // no group set: the house rule is shown plainly and doesn't rule a night out (age still does)
      (it.verdict.state === 'yes' || it.verdict.state === 'if' || it.verdict.plain)
  );
  if (!c.length) return null;
  c = c
    .map((it) => ({ it: it, score: heroScore(it) }))
    .sort((a, b) => b.score - a.score || a.it.start - b.it.start || price(a.it) - price(b.it));
  return { id: c[0].it.id, score: c[0].score };
}

/* a day's rail: no 'no' verdicts (those live in All nights), yes → if → unknown, then friends booked, then soonest.
   One promoted night at most, where it falls. At most 10 tiles; `more` is the day's total when there are more. */
export function railItems(items, day, heroId, max) {
  max = max || 10;
  var seenPromo = false;
  var list = items
    .filter((it) => it.day === day && !it.over && it.id !== heroId && it.verdict.state !== 'no')
    .sort(
      (a, b) =>
        ORDER[a.verdict.state] - ORDER[b.verdict.state] ||
        (b.friends > 0) - (a.friends > 0) ||
        a.start - b.start
    )
    .filter((it) => {
      if (!it.promoted) return true;
      if (seenPromo) return false;
      seenPromo = true;
      return true;
    });
  return { tiles: list.slice(0, max), more: list.length > max ? list.length : 0, total: list.length };
}

/* the nights that don't fit the group, for All nights' collapsed row */
export function notForYou(items, day) {
  return items.filter((it) => it.day === day && !it.over && it.verdict.state === 'no').sort((a, b) => a.start - b.start);
}

/* the home's rails: the window's day, the next day, each remaining day of the next 7 (at most 5), then next week.
   → [{ key, offset, days: ['YYYY-MM-DD', …] }]. Labels ("Tonight · 4 more", "Sunday") are the screen's job */
export function weekRails(windowDay) {
  var rails = [
    { key: 'd0', offset: 0, days: [windowDay] },
    { key: 'd1', offset: 1, days: [addDays(windowDay, 1)] }
  ];
  for (var i = 2; i <= 6; i++) rails.push({ key: 'd' + i, offset: i, days: [addDays(windowDay, i)] });
  var later = [];
  for (var j = 7; j <= 13; j++) later.push(addDays(windowDay, j));
  rails.push({ key: 'next', offset: 7, days: later });
  return rails;
}

/* what a rail holds: one day, or (next week) several days in date order */
export function railFor(items, rail, heroId, max) {
  if (rail.days.length === 1) return railItems(items, rail.days[0], heroId, max);
  var merged = rail.days
    .map((d) => railItems(items, d, heroId, 1000).tiles)
    .reduce((a, b) => a.concat(b), []);
  max = max || 10;
  return { tiles: merged.slice(0, max), more: merged.length > max ? merged.length : 0, total: merged.length };
}

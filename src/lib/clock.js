/* The app's clock, in India time (UTC+5:30, no daylight saving).
   ?now=2026-10-16T19:00 in the URL sets "now" for the whole app (the demo clock); a time without a zone is read as India time. */

const IST = 330 * 60000;
const DAY = 86400000;

export function parseNow(search) {
  var m = /[?&]now=([^&]+)/.exec(search || '');
  if (!m) return null;
  var s = decodeURIComponent(m[1]);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) s += 'T19:00';
  if (!/(Z|[+-]\d{2}:?\d{2})$/i.test(s)) s += (/T\d{2}:\d{2}$/.test(s) ? ':00' : '') + '+05:30';
  var t = Date.parse(s);
  return isNaN(t) ? null : t;
}

const DEMO = typeof location === 'undefined' ? null : parseNow(location.search);
const LOADED = Date.now();

/* the demo clock starts at ?now= and runs on from there, so countdowns (a plan's vote) move like real ones */
export function now() {
  return DEMO != null ? DEMO + (Date.now() - LOADED) : Date.now();
}

export function isDemoClock() {
  return DEMO != null;
}

/* the India calendar day, as 'YYYY-MM-DD' */
export function istDay(t) {
  return new Date(t + IST).toISOString().slice(0, 10);
}

export function istHour(t) {
  return new Date(t + IST).getUTCHours();
}

export function addDays(day, n) {
  return new Date(Date.parse(day + 'T00:00:00Z') + n * DAY).toISOString().slice(0, 10);
}

/* 0 = Sunday … 6 = Saturday */
export function weekdayOf(day) {
  return new Date(day + 'T00:00:00Z').getUTCDay();
}

/* the day a night belongs to: one starting after midnight (before 6 am) is the previous evening's night */
export function nightDay(startMs) {
  return istDay(startMs - 6 * 3600000);
}

/* which evening the home is about.
   Before 2 am, tonight is still yesterday's evening. From 2 am to 6 am, the home looks at the coming evening and calls it tomorrow. */
export function homeWindow(t) {
  var h = istHour(t),
    today = istDay(t);
  if (h < 2) return { day: addDays(today, -1), when: 'tonight' };
  if (h < 6) return { day: today, when: 'tomorrow' };
  return { day: today, when: 'tonight' };
}

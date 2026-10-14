/* The app's clock, in India time (UTC+5:30, no daylight saving). Switches in the URL set "now" for the whole app:
   - ?now=2026-10-16T19:00 sets the exact moment; a time without a zone is read as India time. It wins over the rest.
   - ?demo: tonight at 10:30 pm, so tonight's 9 pm nights are on (the demo data, data/demo.js).
   - ?date=2026-10-20 or ?date=+1 (days from today) and ?time=21:00 pick the day and the time. Each fills in the
     other: the day is today; the time is 10:30 pm with ?demo, 7 pm with a date, otherwise the real time of day. */

const IST = 330 * 60000;
const DAY = 86400000;

export function parseNow(search, real) {
  var m = /[?&]now=([^&]+)/.exec(search || '');
  if (!m) return parseDemo(search, real == null ? Date.now() : real);
  var s = decodeURIComponent(m[1]);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) s += 'T19:00';
  if (!/(Z|[+-]\d{2}:?\d{2})$/i.test(s)) s += (/T\d{2}:\d{2}$/.test(s) ? ':00' : '') + '+05:30';
  var t = Date.parse(s);
  return isNaN(t) ? null : t;
}

/* ?demo, ?date=, ?time= → a moment, or null when none is set. real: the real time (ms) */
function parseDemo(search, real) {
  search = search || '';
  var demo = /[?&]demo\b/.test(search),
    dm = /[?&]date=([^&]+)/.exec(search),
    tm = /[?&]time=([^&]+)/.exec(search);
  if (!demo && !dm && !tm) return null;
  var today = demoToday(real),
    day = today,
    time = tm ? decodeURIComponent(tm[1]).trim() : demo ? '22:30' : dm ? '19:00' : null;
  if (dm) {
    var d = decodeURIComponent(dm[1]).trim();
    if (/^[+-]?\d{1,3}$/.test(d)) day = addDays(today, +d);
    else if (/^\d{4}-\d{2}-\d{2}$/.test(d)) day = d;
    else return null;
  }
  if (time == null) time = new Date(real + IST).toISOString().slice(11, 16);
  if (!/^\d{1,2}:\d{2}$/.test(time)) return null;
  var t = Date.parse(day + 'T' + time.padStart(5, '0') + ':00+05:30');
  return isNaN(t) ? null : t;
}

/* the evening the demo data counts its days from (day 0): tonight by the real clock, with the 2 am rule */
export function demoToday(real) {
  return homeWindow(real == null ? Date.now() : real).day;
}

const DEMO = typeof location === 'undefined' ? null : parseNow(location.search);
const LOADED = Date.now();

/* the demo clock starts at ?now= (or ?demo, ?date=, ?time=) and runs on from there, so countdowns (a plan's vote)
   move like real ones */
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

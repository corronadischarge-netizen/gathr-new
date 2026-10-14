/* The app's venues and listed nights: the demo set (data/demo.js, specs/demo-data.md), dated from tonight so it never
   goes stale. The 20 District / Sort My Scene listings from 29 Sep and 4 Oct 2026 are gone.
   Bookings (booked so far against a cap), friends and group votes are SAMPLE data: no live booking feed exists yet.
   Nights hosted on gathr (the demo's and Supabase's) join EVENTS through data/organisers.js. */
import { crowdLevel } from '../design-system/utils';
import { now } from '../lib/clock';
import { buildDemo, DEMO_VENUES } from './demo';

/* the demo, built once for tonight (the real tonight: ?demo, ?date= and ?time= move the clock, not the nights) */
export const DEMO = buildDemo();

/* lat/lng are area-level venue locations, for the map (null: area not confirmed yet, so no pin) */
export const VENUES = {};
Object.keys(DEMO_VENUES).forEach((k) => {
  var v = Object.assign({}, DEMO_VENUES[k]);
  v.crowd = crowdLevel(v.booked, v.cap);
  VENUES[k] = v;
});

export const EVENTS = Object.assign({}, DEMO.events);

export const ORDER = Object.keys(EVENTS);

ORDER.sort((a, b) => new Date(EVENTS[a].iso) - new Date(EVENTS[b].iso));

/* a night's own Booked so far (sample): the demo sets it per night, otherwise its venue's */
export function nightCrowd(e) {
  var x = e && DEMO.crowd[e.id],
    v = (e && VENUES[e.venue]) || {};
  var booked = x ? x[0] : v.booked,
    cap = x ? x[1] : v.cap;
  return { booked: booked, cap: cap, level: crowdLevel(booked, cap) || v.crowd };
}

/* when a night ends: its end time ("1:30 am", "11 pm") on the night it started, or 5 hours after the start */
export function endsAt(e) {
  var start = new Date(e.iso).getTime(),
    m = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i.exec((e.end || '').trim());
  if (!m) return start + 5 * 3600000;
  var IST = 330 * 60000,
    h = (+m[1] % 12) + (/pm/i.test(m[3]) ? 12 : 0),
    day = new Date(start + IST).toISOString().slice(0, 10),
    t = Date.parse(day + 'T' + String(h).padStart(2, '0') + ':' + (m[2] || '00') + ':00+05:30');
  return t <= start ? t + 86400000 : t;
}

/* on right now: started and not yet over (the home's Live badge, Get ready's "on now") */
export function onNow(e, t) {
  t = t == null ? now() : t;
  return !!e && t >= new Date(e.iso).getTime() && t < endsAt(e);
}

export function isPast(e) {
  return now() > new Date(e.iso).getTime() + 6 * 3600000;
}

export function upcoming() {
  return ORDER.filter((k) => !isPast(EVENTS[k]));
}

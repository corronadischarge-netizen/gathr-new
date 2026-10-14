/* The demo account (specs/demo-data.md section 5): when the signed-in profile has demo = true in Supabase, the app
   fills in the demo friends, the guest's plans, bookings, saves and past nights, and the host (Afterhours
   Collective). Any other account, or nobody signed in, sees only the feed.
   The demo is laid out again whenever the day changes (its plan's vote closes on a real date), so it shows the same
   states every day; within a day, what you tap in it (a vote, a friend request) stays. */
import { now } from '../lib/clock';
import { store } from '../lib/utils';
import { demoGuest } from './demo';
import { DEMO, EVENTS } from './listings';
import { ORG_KEY, demoOrg, syncOrg } from './organisers';

/* the 20 listings this demo replaced (29 Sep and 4 Oct 2026): saved on phones before the demo, they're dropped */
const OLD = 'illegal gossip dearwed twilight lavish bollywood scandalous yellow twin resign ladiesnight offmenu drexo basstapri chuckberry jamming dandiyaunited royalraas punedandiya jasmin'.split(' ');

function without(obj) {
  var x = Object.assign({}, obj);
  OLD.forEach((k) => delete x[k]);
  return x;
}

/* a phone's saved state, with the old listings taken out of saves, bookings, past nights, plans and votes */
export function dropOldNights(s) {
  var gone = (k) => OLD.indexOf(k) >= 0;
  s.saved = without(s.saved);
  s.myBookings = without(s.myBookings);
  s.dayAfter = without(s.dayAfter);
  s.pastNights = (s.pastNights || []).filter((k) => !gone(k));
  s.pastHidden = (s.pastHidden || []).filter((k) => !gone(k));
  if (gone(s.planned)) Object.assign(s, { planned: null, onList: false });
  if (gone(s.cur) || !EVENTS[s.cur]) s.cur = 'bollywoodbash';
  if (gone(s.vote)) s.vote = null;
  if (s.gp && ((s.gp.opts || []).some(gone) || gone(s.gp.booked) || gone(s.gp.winner))) Object.assign(s, { gp: null, vote: null });
  if (s.bk && gone(s.bk.ev)) s.bk = null;
  return s;
}

/* the demo account's state, laid out for today if it isn't yet (or always, with force) */
export function withDemo(s, force) {
  var org = demoOrg(s.org && s.org.demo ? s.org : null);
  store(ORG_KEY, org);
  syncOrg(org);
  var next = Object.assign({}, s, { demo: true, org: org });
  if (force || s.demoDay !== DEMO.today)
    Object.assign(next, demoGuest(DEMO.today, now()), { demoDay: DEMO.today, friendReq: null, pastHidden: [] });
  return next;
}

/* a non-demo account (or the demo flag turned off): the demo's plans, friends and host come off this phone */
export function withoutDemo(s) {
  if (!s.demo && !(s.org && s.org.demo)) return s;
  var org = s.org && s.org.demo ? { profile: null, events: [], checkins: {} } : s.org;
  store(ORG_KEY, org);
  syncOrg(org);
  return Object.assign({}, s, {
    demo: false,
    demoDay: null,
    org: org,
    planned: null,
    onList: false,
    guests: 2,
    myBookings: {},
    pastNights: [],
    saved: {},
    gp: null,
    vote: null,
    dayAfter: {},
    friendReq: null,
    mode: 'guest'
  });
}

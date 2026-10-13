/* Home v3: the app's nights, prepared for the door verdict and the ranking (lib/door.js, lib/homeRank.js) */
import { crowdLevel } from '../design-system/utils';
import { getDoorVerdict } from '../lib/door';
import { heroPick } from '../lib/homeRank';
import { addDays, homeWindow, nightDay } from '../lib/clock';
import { travelMins } from '../lib/distance';
import { currentGroup, groupFromPlan } from './group';
import { doorOf } from './doorRules';
import { EVENTS, ORDER, VENUES, isPast } from './listings';
import { AREA_LIST } from './options';
import { FAMILY_TAG } from './taxonomy';

/* Your plan and its day (Shubh, 13 Oct): the night it booked, or its soonest option still to come.
   A plan for tonight or tomorrow is live: the home shows it, and its group is who's going.
   A plan for a later day doesn't change tonight's verdicts. → { gp, day, live } or null */
export function planInfo(S, t) {
  var gp = S.groupOff ? null : S.gp;
  if (!gp || ['voting', 'closed', 'booking', 'booked'].indexOf(gp.stage) < 0) return null;
  var ids = gp.stage === 'booked' ? [gp.booked] : gp.winner ? [gp.winner] : gp.opts || [],
    days = ids
      .map((k) => EVENTS[k])
      .filter((e) => e && !isPast(e))
      .map((e) => nightDay(new Date(e.iso).getTime()))
      .sort();
  if (!days.length) return null;
  var w = homeWindow(t),
    live = days[0] <= addDays(w.day, 1);
  return { gp: gp, day: days[0], live: live };
}

/* who the door is checked for: a live plan's group, otherwise what you chose in Going as */
export function groupFor(S, t) {
  var pl = planInfo(S, t);
  return pl && pl.live ? groupFromPlan(pl.gp) : currentGroup(S);
}

/* the areas and sounds you picked (both live in S.nights) */
export function pickedAreas(S) {
  return AREA_LIST.filter((a) => S.nights && S.nights[a]);
}

function pickedTags(S) {
  var keys = Object.keys(S.nights || {}).filter((k) => S.nights[k]);
  return keys.map((k) => FAMILY_TAG[k] || k);
}

/* one item per upcoming night: its day, door verdict for the current group, crowd, travel time and price */
export function homeItems(S, t) {
  var group = groupFor(S, t),
    areas = pickedAreas(S),
    tags = pickedTags(S);
  return ORDER.map((k) => EVENTS[k])
    .filter(Boolean)
    .map((e) => {
      var v = VENUES[e.venue] || {},
        start = new Date(e.iso).getTime(),
        crowd = crowdLevel(v.booked, v.cap), // sample: venue bookings against its cap
        door = doorOf(e);
      return {
        id: e.id,
        start: start,
        day: nightDay(start),
        door: door,
        verdict: getDoorVerdict(door, group, S.age, t),
        friends: e.nFriends || 0,
        crowd: crowd,
        soldOut: crowd === 'full',
        over: isPast(e),
        soundMatch: (e.tags || []).some((x) => tags.indexOf(x) >= 0),
        // road minutes from the routing service; the straight-line estimate until it answers (or offline)
        mins: S.travel && S.travel[e.venue] != null ? S.travel[e.venue] : travelMins(v, areas),
        minsFromRoads: !!(S.travel && S.travel[e.venue] != null),
        price: e.rsvp ? 0 : e.price == null ? null : e.price,
        promoted: !!e.promoted,
        sample: door.sample
      };
    });
}

/* not for this group: the best night that lets them in, that day or the next (event page and booking sheet) */
export function tryInstead(S, e, t) {
  var all = homeItems(S, t),
    it = all.filter((x) => x.id === e.id)[0],
    items = all.filter((x) => x.id !== e.id && x.verdict.state === 'yes'),
    day = it ? it.day : homeWindow(t).day,
    pick = heroPick(items, day) || heroPick(items, addDays(day, 1));
  return pick ? EVENTS[pick.id] : null;
}

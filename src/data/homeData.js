/* Home v3: the app's nights, prepared for the door verdict and the ranking (lib/door.js, lib/homeRank.js) */
import { crowdLevel } from '../design-system/utils';
import { getDoorVerdict } from '../lib/door';
import { nightDay } from '../lib/clock';
import { travelMins } from '../lib/distance';
import { currentGroup } from './group';
import { doorOf } from './doorRules';
import { EVENTS, ORDER, VENUES, isPast } from './listings';
import { AREA_LIST } from './options';
import { FAMILY_TAG } from './taxonomy';

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
  var group = currentGroup(S),
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

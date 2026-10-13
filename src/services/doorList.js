import { store } from '../lib/utils';

/* The door's downloaded guest list (interactions spec 6.14). Each time the app fetches a hosted night's guests and
   check-ins, a copy is kept on this phone, so the door still works with no signal, even after a restart: scans are
   checked against this copy, and check-ins wait in the outbox (services/door.js) until the phone is back online. */
const KEY = 'gathr.door.lists';

export function savedLists() {
  return store(KEY) || {};
}

/* keep the latest copy of each night's list; only nights still in S are kept */
export function saveLists(guests, checkins) {
  var all = {},
    at = Date.now(),
    was = savedLists();
  Object.keys(guests || {}).forEach((id) => {
    var same = was[id] && JSON.stringify(was[id].guests) === JSON.stringify(guests[id]);
    all[id] = {
      guests: guests[id],
      checkins: (checkins || {})[id] || (was[id] && was[id].checkins) || [],
      // when the guests last came from the server (unchanged lists keep their time)
      at: same ? was[id].at : at
    };
  });
  store(KEY, all);
}

/* when this night's list was last downloaded, or null */
export function listTime(id) {
  var x = savedLists()[id];
  return x ? x.at : null;
}

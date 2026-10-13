import { log } from '../lib/log';
import { store } from '../lib/utils';

/* The day-after answers (interactions spec 6.12): "Did they let your group in?", the sound and the crowd.
   They count toward a night's door source "From {n} guests". Kept on this phone for now: sharing them with every
   phone needs a backend table (door_reports: night, group type, let in yes/no, reason, sound, crowd), read as counts */
const KEY = 'gathr.guestReports';

export function saveReport(nightId, answer) {
  var all = store(KEY) || {};
  all[nightId] = Object.assign({}, all[nightId], answer, { at: Date.now() });
  store(KEY, all);
  log('day_after', Object.assign({ nightId: nightId }, answer));
}

/* how many guests on this phone answered for a night: 0 or 1 (it becomes a real count with the backend) */
export function reportCount(nightId) {
  var r = (store(KEY) || {})[nightId];
  return r && r.in ? 1 : 0;
}

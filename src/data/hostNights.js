import { EVENTS, isPast, upcoming } from './listings';

/* the host's nights that are on or coming up, soonest first */
export function hostNights(S) {
  var org = S.org,
    pr = org.profile;
  if (!pr) return [];
  var own = (org.events || [])
    .filter((o) => o.status === 'live')
    .map((o) => o.id)
    .filter((k) => EVENTS[k] && !isPast(EVENTS[k]));
  var listed = pr.newVenue ? [] : upcoming().filter((k) => EVENTS[k].venue === pr.venueId && !EVENTS[k].org);
  return own.concat(listed).sort((a, b) => new Date(EVENTS[a].iso) - new Date(EVENTS[b].iso));
}

export function hostCur(S) {
  var list = hostNights(S);
  return list.indexOf(S.hostNight) >= 0 ? S.hostNight : list[0] || null;
}

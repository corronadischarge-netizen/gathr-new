/* Road travel times from the areas you picked to every venue, from a routing service (config: routing.url).
   One request covers all venues; the answer is kept on the phone for a week per set of areas.
   Only area centre points are sent, never your location. */
import { CFG } from '../config';
import { AREA_POINTS } from '../lib/distance';
import { store } from '../lib/utils';

const KEY = 'gathr.travel';
const WEEK = 7 * 86400000;

/* → Promise<{ venueId: minutes }>; {} when there's nothing to ask or the service can't be reached */
export function loadTravel(areas, venues) {
  var url = CFG.routing && CFG.routing.url,
    from = (areas || []).filter((a) => AREA_POINTS[a]).sort(),
    to = Object.keys(venues || {}).filter((k) => venues[k].lat != null);
  if (!url || !from.length || !to.length) return Promise.resolve({});
  var key = from.join('|') + '>' + to.join(','),
    kept = store(KEY);
  if (kept && kept.key === key && Date.now() - kept.at < WEEK) return Promise.resolve(kept.mins);
  // OSRM wants lng,lat; sources are the areas, destinations the venues
  var pts = from
    .map((a) => AREA_POINTS[a][1] + ',' + AREA_POINTS[a][0])
    .concat(to.map((k) => venues[k].lng + ',' + venues[k].lat));
  var src = from.map((_, i) => i).join(';'),
    dst = to.map((_, i) => i + from.length).join(';');
  var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null,
    timer = ctl ? setTimeout(() => ctl.abort(), 8000) : null;
  return fetch(
    url.replace(/\/$/, '') +
      '/table/v1/driving/' +
      pts.join(';') +
      '?sources=' +
      src +
      '&destinations=' +
      dst +
      '&annotations=duration',
    ctl ? { signal: ctl.signal } : undefined
  )
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error('routing ' + r.status))))
    .then((d) => {
      if (d.code !== 'Ok' || !d.durations) throw new Error('routing ' + d.code);
      var mins = {};
      to.forEach((k, j) => {
        // the nearest of your areas, in road minutes, rounded to 5
        var s = Math.min.apply(
          null,
          d.durations.map((row) => (row[j] == null ? Infinity : row[j]))
        );
        if (isFinite(s)) mins[k] = Math.max(5, Math.round(s / 300) * 5);
      });
      store(KEY, { key: key, at: Date.now(), mins: mins });
      return mins;
    })
    .catch(() => ({}))
    .finally(() => timer && clearTimeout(timer));
}

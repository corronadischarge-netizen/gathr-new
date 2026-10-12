/* Rough travel time from the areas you picked to a venue (approximate: area centres and a city driving speed,
   not live traffic). No area picked → null: no distance shown and no ranking penalty. */

/* approximate centre points of the areas offered in onboarding (options.js AREA_LIST) */
export const AREA_POINTS = {
  'The Mills': [18.5362, 73.8764],
  'Koregaon Park': [18.5362, 73.8939],
  'Shivaji Nagar': [18.5308, 73.8475],
  'Kalyani Nagar': [18.5463, 73.9033],
  Baner: [18.559, 73.7868],
  'Viman Nagar': [18.5679, 73.9143],
  'FC Road': [18.5236, 73.841]
};

function km(a, b) {
  var R = 6371,
    rad = Math.PI / 180,
    dLat = (b[0] - a[0]) * rad,
    dLng = (b[1] - a[1]) * rad,
    h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/* straight line × 1.4 for roads, at about 20 km/h through Pune, plus 5 minutes to get going; rounded to 5 */
export function travelMins(venue, areas) {
  if (!venue || venue.lat == null) return null;
  var from = (areas || []).map((n) => AREA_POINTS[n]).filter(Boolean);
  if (!from.length) return null;
  var best = Math.min.apply(
    null,
    from.map((p) => km(p, [venue.lat, venue.lng]))
  );
  return Math.max(5, Math.round(((best * 1.4) / 20) * 60 / 5 + 1) * 5);
}

export function minsTxt(m) {
  return m == null ? null : m + ' min';
}

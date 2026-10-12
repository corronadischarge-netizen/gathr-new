export function cx() {
  return Array.prototype.filter.call(arguments, Boolean).join(' ');
}

export function rest(p, keys) {
  var o = {};
  for (var k in p) if (keys.indexOf(k) < 0) o[k] = p[k];
  return o;
}

/* hue helpers: -300 fills take dark text; violet and blue fills use -500 with white text */
const DARK_ON = { yellow: 1, green: 1, pink: 1, red: 1 };

export function fillOf(hue) {
  return DARK_ON[hue] ? 'var(--' + hue + '-300)' : 'var(--' + hue + '-500)';
}

export function textOn(hue) {
  return DARK_ON[hue] ? 'var(--night-900)' : 'var(--white)';
}

/* Booked so far: bookings on gathr against a cap verified by gathr. About people, never the vibe */
export const CROWD = {
  quiet: { n: 1, label: 'Early', line: 'Few booked yet. Plenty of room' },
  warming: { n: 2, label: 'Filling up', line: 'Easy to get in' },
  buzzing: { n: 3, label: 'Buzzing', line: 'Good crowd. Short wait at the door' },
  packed: { n: 4, label: 'Packed', line: 'Peak night. Expect a queue' },
  full: { n: 5, label: 'Full', line: 'Sold out. Only list and pass holders get in' }
};

export const LEVELS = ['quiet', 'warming', 'buzzing', 'packed', 'full'];

/* the level from the share of the cap booked; null when there's no cap (walk-in venues) */
export function crowdLevel(booked, cap) {
  if (!cap) return null;
  var r = (booked || 0) / cap;
  return r >= 1 ? 'full' : r >= 0.85 ? 'packed' : r >= 0.6 ? 'buzzing' : r >= 0.25 ? 'warming' : 'quiet';
}

export function fmtNum(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

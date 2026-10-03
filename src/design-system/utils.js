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

export const CROWD = {
  quiet: { n: 1, label: 'Quiet', line: 'Easy to get a table' },
  warming: { n: 2, label: 'Warming up', line: 'Filling up nicely' },
  buzzing: { n: 3, label: 'Buzzing', line: 'Good energy, short wait' },
  packed: { n: 4, label: 'Packed', line: 'Shoulder to shoulder' },
  full: { n: 5, label: 'At capacity', line: 'Door is holding' }
};

export const LEVELS = ['quiet', 'warming', 'buzzing', 'packed', 'full'];

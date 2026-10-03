/* what kind of night it is, and an icon per sound, so the page says what the night is about at a glance */
export function kindOf(e) {
  var t = e.tags || [];
  if (t.indexOf('live') >= 0) return ['Live gig', 'speaker'];
  if (t.indexOf('ladies') >= 0) return ['Girls’ night', 'cocktail'];
  if (t.indexOf('themed') >= 0) return ['Themed party', 'sunglasses'];
  return ['Club night', 'discoball'];
}

function soundIcon(g) {
  g = g.toLowerCase();
  if (/bolly(?!tech)/.test(g)) return 'mic';
  if (/hip/.test(g)) return 'headphones';
  if (/edm|tech/.test(g)) return 'spotlight';
  if (/afro/.test(g)) return 'wristband';
  if (/live|indie|rock|pop|band/.test(g)) return 'speaker';
  if (/dj/.test(g)) return 'vinyl';
  if (/girl/.test(g)) return 'cocktail';
  if (/theme/.test(g)) return 'sunglasses';
  return 'discoball';
}

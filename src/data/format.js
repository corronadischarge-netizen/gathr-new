export function priceTxt(e) {
  return e.rsvp
    ? 'Free · RSVP'
    : e.door
      ? e.price
        ? '₹' + e.price.toLocaleString('en-IN') + ' at the door'
        : 'Pay at the door'
      : e.price == null
        ? 'Price not listed'
        : '₹' + e.price.toLocaleString('en-IN');
}

/* where a night was listed: the two ticket sites, or an organiser on gathr itself */
export function srcName(e) {
  return e.src === 'sms' ? 'Sort My Scene' : e.src === 'district' ? 'District' : 'gathr';
}

function ageTxt(e) {
  return e.age ? e.age + '+' : null;
}

/* nights you can't get into at your age: 21+ if you're 18 to 20, 25+ if you're 21 to 24 */
export function blockedFor(e, age) {
  return (age === '18 to 20' && e.age >= 21) || (age === '21 to 24' && e.age >= 25);
}

export function rupees(n) {
  return '₹' + n.toLocaleString('en-IN');
}

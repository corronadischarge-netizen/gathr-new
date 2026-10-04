/* Motion helpers for the few animations that run from code (the poster growing from its card).
   Durations and curves come from the tokens in styles/motion.css, so code and CSS stay in step. */
export function reducedMotion() {
  return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
}

export function token(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function ms(name) {
  return parseFloat(token(name)) || 0;
}

/* Restart a CSS animation class on an element (e.g. the wrong-code shake), even if it just ran. */
export function replay(el, cls) {
  if (!el) return;
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}

/* How much the phone frame is scaled on a desktop screen (1 on a real phone). */
export function phoneScale() {
  var ph = document.querySelector('.phone');
  return ph ? ph.getBoundingClientRect().width / ph.offsetWidth || 1 : 1;
}

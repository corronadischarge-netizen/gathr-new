/* The app's one motion helper (interactions spec 2.1). Durations and curves come from the tokens in
   styles/motion.css (which point at the design system's tempo tokens), so code and CSS stay in step.
   Rules it enforces: only transform and opacity animate; reduced motion turns movement into nothing or a
   120 ms fade; nothing here ever blocks a tap. */
import { useLayoutEffect, useRef } from 'react';

export function reducedMotion() {
  return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
}

export function token(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/* a duration token in milliseconds, following var() references and "calc(x * n)" (e.g. --motion-back) */
export function ms(name) {
  var v = token(name),
    depth = 0;
  while (/^var\(/.test(v) && depth++ < 5) v = token(v.slice(4, -1).split(',')[0].trim());
  var calc = /^calc\(\s*(.+?)\s*\*\s*([\d.]+)\s*\)$/.exec(v);
  if (calc) return ms2(calc[1]) * parseFloat(calc[2]);
  return parseFloat(v) || 0;
}
function ms2(v) {
  return /^var\(/.test(v) ? ms(v.slice(4, -1)) : parseFloat(v) || 0;
}

export const EASE = {
  standard: 'cubic-bezier(0.2, 0, 0, 1)',
  enter: 'cubic-bezier(0, 0, 0, 1)',
  exit: 'cubic-bezier(0.3, 0, 1, 1)'
};
const SPEED = { fast: '--dur-fast', base: '--dur-base', slow: '--dur-slow', screen: '--dur-screen' };
const ALLOWED = { transform: 1, opacity: 1, translate: 1, scale: 1, rotate: 1, offset: 1, easing: 1 };

/* Animate an element with the Web Animations API, transform and opacity only.
   opts: { speed: fast | base | slow | screen, ease: standard | enter | exit, delay, exit (0.8 x duration),
           fade: under reduced motion, still fade in over 120 ms instead of jumping } → a promise when done */
export function animate(el, frames, opts) {
  opts = opts || {};
  if (!el || !el.animate) return Promise.resolve();
  frames.forEach((f) =>
    Object.keys(f).forEach((k) => {
      if (!ALLOWED[k]) throw new Error('motion: only transform and opacity animate, not ' + k);
    })
  );
  if (reducedMotion())
    return opts.fade
      ? el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: ms('--dur-fast') }).finished.catch(() => {})
      : Promise.resolve();
  var d = ms(SPEED[opts.speed || 'base']) * (opts.exit ? 0.8 : 1);
  return el
    .animate(frames, { duration: d, delay: opts.delay || 0, easing: EASE[opts.ease || 'standard'] })
    .finished.catch(() => {});
}

/* Restart a CSS animation class on an element (e.g. the wrong-code shake), even if it just ran. */
export function replay(el, cls) {
  if (!el) return;
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}

/* Fade an image in once it has loaded (dur-base); the placeholder behind it holds the space */
export function fadeInImage(img) {
  if (!img) return;
  if (img.complete) return;
  img.addEventListener('load', () => animate(img, [{ opacity: 0 }, { opacity: 1 }], { speed: 'base', fade: true }), {
    once: true
  });
}

/* FLIP: when items in a list move to new places (a re-sort), they glide there instead of jumping.
   Give each item data-flip="<its id>"; pass a value that changes when the order should animate */
export function useFlip(ref, sig) {
  var last = useRef(null);
  useLayoutEffect(() => {
    var root = ref.current;
    if (!root) return;
    var now = {};
    root.querySelectorAll('[data-flip]').forEach((el) => {
      now[el.getAttribute('data-flip')] = el.getBoundingClientRect();
    });
    var before = last.current;
    last.current = { sig: sig, rects: now };
    if (!before || before.sig === sig || reducedMotion()) return;
    root.querySelectorAll('[data-flip]').forEach((el) => {
      var a = before.rects[el.getAttribute('data-flip')],
        b = now[el.getAttribute('data-flip')];
      if (a && b && (a.left !== b.left || a.top !== b.top))
        animate(el, [{ transform: 'translate(' + (a.left - b.left) + 'px, ' + (a.top - b.top) + 'px)' }, { transform: 'none' }], {
          speed: 'slow'
        });
      else if (!a) animate(el, [{ opacity: 0 }, { opacity: 1 }], { speed: 'slow' });
    });
  });
}

/* How much the phone frame is scaled on a desktop screen (1 on a real phone). */
export function phoneScale() {
  var ph = document.querySelector('.phone');
  return ph ? ph.getBoundingClientRect().width / ph.offsetWidth || 1 : 1;
}

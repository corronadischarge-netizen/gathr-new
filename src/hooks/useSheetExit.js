import { useLayoutEffect, useRef } from 'react';
import { ms, phoneScale, reducedMotion } from '../lib/motion';

/* When a sheet closes, a frozen copy of it slides down (and the scrim fades) in 200ms, so you see where it
   went. The copy can't be tapped, so the screen underneath works straight away.
   The full poster shrinks back into its place on the event page instead. */
export function useSheetExit(sheet, hostRef, layerRef) {
  var last = useRef({ sheet: sheet, node: null });
  if (last.current.sheet !== sheet) {
    var el = hostRef.current,
      closing = !sheet && el;
    last.current = {
      sheet: sheet,
      node: closing ? copyOf(el) : null,
      poster: closing && last.current.sheet === 'poster'
    };
  }
  useLayoutEffect(() => {
    var layer = layerRef.current,
      g = last.current.node;
    if (!layer) return;
    layer.textContent = '';
    if (!g) return;
    last.current.node = null;
    g.classList.add('sheet-leaving');
    layer.appendChild(g);
    if (last.current.poster) shrinkPoster(g);
    var done = () => {
      if (g.parentNode) g.parentNode.removeChild(g);
    };
    var t = setTimeout(done, ms('--motion-normal') + 80);
    return () => clearTimeout(t);
  }, [sheet]);
}

function copyOf(el) {
  var g = el.cloneNode(true);
  g.setAttribute('aria-hidden', 'true');
  g.setAttribute('inert', '');
  g.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
  var slots = [g].concat([].slice.call(g.querySelectorAll('.sheet-slot'))); // the copy may itself be the slot
  slots.forEach((n) => n.classList.remove('rise', 'settling'));
  // typed text lives on the live inputs, not in the markup: carry it over so the copy looks the same
  var from = el.querySelectorAll('input, textarea'),
    to = g.querySelectorAll('input, textarea');
  from.forEach((n, i) => {
    if (to[i]) to[i].value = n.value;
  });
  return g;
}

/* The poster goes back to where it came from: the hero image on the event page. */
function shrinkPoster(g) {
  var img = g.querySelector('.poster-img'),
    origin = document.querySelector('.phone > .screen:not(.ghost):not(.under) .ev-hero-img');
  if (!img || !origin || reducedMotion() || !img.animate) return;
  img.animate([{ transform: 'none' }, { transform: flipTo(img, origin), opacity: 0.4 }], {
    duration: ms('--motion-normal'),
    easing: 'cubic-bezier(0.4, 0, 1, 1)',
    fill: 'forwards'
  });
}

/* The transform that lays `el` over `target` (same centre, same width), in the phone's own pixels. */
export function flipTo(el, target) {
  var a = el.getBoundingClientRect(),
    b = target.getBoundingClientRect(),
    k = phoneScale();
  if (!a.width) return 'none';
  var dx = (b.left + b.width / 2 - (a.left + a.width / 2)) / k,
    dy = (b.top + b.height / 2 - (a.top + a.height / 2)) / k;
  return 'translate(' + dx + 'px, ' + dy + 'px) scale(' + b.width / a.width + ')';
}

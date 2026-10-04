import { useLayoutEffect, useRef } from 'react';

/* Screen changes show where you came from: the new screen animates in (CSS on .screen.nav-*), and a frozen
   copy of the old screen animates out in the ghost layer: shifting left and dimming underneath (forward),
   sliding off to the right on top (back), or fading (tabs). The copy can't be tapped or focused, so the new
   screen works from the first frame. */
export function useScreenTransition(key, dir, screenRef, layerRef) {
  var last = useRef({ key: key, node: null, top: 0, dir: dir });
  // Copy the outgoing screen while rendering, before React swaps it out.
  if (last.current.key !== key) {
    var el = screenRef.current;
    var animated = dir === 'fwd' || dir === 'back' || dir === 'tab';
    last.current = { key: key, node: el && animated ? el.cloneNode(true) : null, top: el ? el.scrollTop : 0, dir: dir };
  }
  useLayoutEffect(() => {
    var layer = layerRef.current,
      g = last.current.node;
    if (!layer) return;
    layer.textContent = ''; // drop a copy that's still leaving from a quick earlier tap
    if (!g) return;
    last.current.node = null;
    g.removeAttribute('tabindex');
    g.setAttribute('aria-hidden', 'true');
    g.setAttribute('inert', '');
    g.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
    g.className = g.className.replace(/\bnav-\w+/g, '') + ' ghost ghost-' + last.current.dir;
    layer.className = 'ghost-layer ghost-layer-' + last.current.dir;
    layer.appendChild(g);
    g.scrollTop = last.current.top;
    var done = () => {
      if (g.parentNode) g.parentNode.removeChild(g);
    };
    g.addEventListener('animationend', (e) => {
      if (e.target === g) done(); // not a child's own animation finishing
    });
    var t = setTimeout(done, 700); // in case the animation never runs
    return () => clearTimeout(t);
  }, [key]);
}

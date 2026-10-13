import { useLayoutEffect, useRef } from 'react';

/* Remember, don't re-ask (interactions spec 3): every screen keeps its scroll position. Leaving a screen saves
   where it was (read while rendering, before React swaps it out, like useScreenTransition); coming back by Back,
   swipe or a tab change puts it back exactly. A newly opened screen starts at the top.
   pathKey names the screen and how you got there (the stack, plus the night or venue) */
export function useScrollMemory(pathKey, dir, screenRef) {
  var mem = useRef({}),
    last = useRef(pathKey);
  if (last.current !== pathKey) {
    if (screenRef.current) mem.current[last.current] = screenRef.current.scrollTop;
    last.current = pathKey;
  }
  useLayoutEffect(() => {
    var el = screenRef.current;
    if (!el) return;
    var back = dir === 'back' || dir === 'swipe' || dir === 'tab';
    el.scrollTop = back ? mem.current[pathKey] || 0 : 0;
  }, [pathKey]);
}

/* Scroll a screen to the top over dur-slow (instant with reduced motion). Scrolling isn't an animated style,
   so this moves the scroll position frame by frame, and a touch stops it at once */
export function scrollToTop(el, durMs, reduced) {
  if (!el) return;
  if (reduced || !durMs) {
    el.scrollTop = 0;
    return;
  }
  var from = el.scrollTop,
    start = null,
    stop = false,
    halt = () => (stop = true);
  el.addEventListener('touchstart', halt, { once: true, passive: true });
  el.addEventListener('wheel', halt, { once: true, passive: true });
  function step(ts) {
    if (stop) return;
    if (start === null) start = ts;
    var k = Math.min(1, (ts - start) / durMs),
      e = 1 - Math.pow(1 - k, 3); // ease out: quick to start, settles at the top
    el.scrollTop = from * (1 - e);
    if (k < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

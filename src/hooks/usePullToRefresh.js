import { useEffect, useRef } from 'react';
import { haptic } from '../lib/haptics';
import { reducedMotion } from '../lib/motion';

/* Pull to refresh (interactions spec 6.2): with the screen at its top, pulling down brings a small spinner in under
   the header; past the threshold the phone ticks once; letting go there refreshes, and the spinner stays until the
   new nights are in. The content itself never moves, so nothing jumps. Tapping the active tab also refreshes.
   rootRef: any element inside the screen; indRef: the spinner; onRefresh() returns a promise */
const PULL = 72; // how far to pull, in app pixels, before it refreshes

export function usePullToRefresh(rootRef, indRef, onRefresh) {
  var go = useRef(onRefresh);
  go.current = onRefresh;
  useEffect(() => {
    var scr = rootRef.current && rootRef.current.closest('.screen'),
      ind = indRef.current;
    if (!scr || !ind) return;
    var s = null,
      busy = false;
    function show(d, spin) {
      var k = Math.min(1, d / PULL);
      ind.style.opacity = String(k);
      ind.style.translate = '0 ' + Math.round(Math.min(d * 0.4, 28)) + 'px';
      ind.style.rotate = Math.round(k * 270) + 'deg';
      ind.classList.toggle('is-spinning', !!spin && !reducedMotion());
    }
    function hide() {
      ind.style.opacity = '0';
      ind.style.translate = '';
      ind.style.rotate = '';
      ind.classList.remove('is-spinning');
    }
    function start(e) {
      if (busy || e.touches.length !== 1 || scr.scrollTop > 0) return;
      s = { y: e.touches[0].clientY, x: e.touches[0].clientX, on: false, off: false, d: 0, ticked: false };
    }
    function move(e) {
      if (!s || s.off) return;
      var dy = e.touches[0].clientY - s.y,
        dx = e.touches[0].clientX - s.x;
      if (!s.on) {
        if (Math.abs(dy) < 10 && Math.abs(dx) < 10) return;
        // only a downward pull at the very top; sideways or upward is ordinary scrolling
        if (dy > 0 && Math.abs(dy) > Math.abs(dx) && scr.scrollTop <= 0) s.on = true;
        else {
          s.off = true;
          return;
        }
      }
      e.preventDefault();
      s.d = Math.min(PULL * 1.6, dy * 0.6);
      if (s.d >= PULL && !s.ticked) {
        s.ticked = true;
        haptic.tap();
      }
      if (s.d < PULL) s.ticked = false;
      show(s.d, false);
    }
    function end() {
      if (!s || !s.on) {
        s = null;
        return;
      }
      var past = s.d >= PULL;
      s = null;
      if (!past) {
        hide();
        return;
      }
      busy = true;
      show(PULL, true);
      Promise.resolve(go.current && go.current()).finally(() => {
        busy = false;
        hide();
      });
    }
    scr.addEventListener('touchstart', start, { passive: true });
    scr.addEventListener('touchmove', move, { passive: false });
    scr.addEventListener('touchend', end);
    scr.addEventListener('touchcancel', end);
    return () => {
      scr.removeEventListener('touchstart', start);
      scr.removeEventListener('touchmove', move);
      scr.removeEventListener('touchend', end);
      scr.removeEventListener('touchcancel', end);
    };
  }, []);
}

import { useEffect, useRef } from 'react';
import { haptic } from '../lib/haptics';

/* Long-press a night tile in a rail (interactions spec 6.7: "Add to plan"). Held still for 500 ms, the phone ticks and
   onLong(nightId) runs; the tap that would follow is swallowed. Moving the finger (scrolling) cancels it. The same
   action is always a button too ("Plan it with friends" on the event page). */
const HOLD = 500;

export function useLongPress(rootRef, onLong) {
  var cb = useRef(onLong);
  cb.current = onLong;
  useEffect(() => {
    // listened for on the document, so it works whatever the home shows first (skeletons, then tiles)
    var root = document,
      t = null,
      start = null,
      fired = false;
    function tileOf(e) {
      var el = e.target.closest && e.target.closest('.g-rail-scroll [data-flip]');
      return el && rootRef.current && rootRef.current.contains(el) ? el : null;
    }
    function cancel() {
      clearTimeout(t);
      t = null;
    }
    function down(e) {
      var el = tileOf(e);
      if (!el || (e.pointerType === 'mouse' && e.button !== 0)) return;
      fired = false;
      start = { x: e.clientX, y: e.clientY };
      cancel();
      t = setTimeout(() => {
        t = null;
        fired = true;
        haptic.tap();
        // the rail names each tile by its React key (".$twilight"): the night id is after the "$"
        cb.current(el.getAttribute('data-flip').replace(/^.*\$/, ''));
      }, HOLD);
    }
    function move(e) {
      if (t && start && (Math.abs(e.clientX - start.x) > 10 || Math.abs(e.clientY - start.y) > 10)) cancel();
    }
    function click(e) {
      if (fired && tileOf(e)) {
        e.stopPropagation();
        e.preventDefault();
        fired = false;
      }
    }
    function menu(e) {
      // Android's own long-press menu (copy image, open link) would cover ours
      if (tileOf(e)) e.preventDefault();
    }
    root.addEventListener('pointerdown', down);
    root.addEventListener('pointermove', move);
    root.addEventListener('pointerup', cancel);
    root.addEventListener('pointercancel', cancel);
    root.addEventListener('scroll', cancel, true);
    root.addEventListener('click', click, true);
    root.addEventListener('contextmenu', menu);
    return () => {
      cancel();
      root.removeEventListener('pointerdown', down);
      root.removeEventListener('pointermove', move);
      root.removeEventListener('pointerup', cancel);
      root.removeEventListener('pointercancel', cancel);
      root.removeEventListener('scroll', cancel, true);
      root.removeEventListener('click', click, true);
      root.removeEventListener('contextmenu', menu);
    };
  }, []);
}

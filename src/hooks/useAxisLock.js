import { useEffect } from 'react';

/* Sideways rows lock their direction after 10px (interactions spec 6.2): once a swipe is clearly sideways the page
   stops scrolling up and down; once it's clearly up or down the row stops sliding sideways. The lock lasts until the
   finger lifts. (Horizontal overscroll is also contained in CSS, so a row never triggers the browser's back.) */
export function useAxisLock(ref) {
  useEffect(() => {
    var row = ref.current;
    if (!row) return;
    var s = null;
    function start(e) {
      if (e.touches.length === 1) s = { x: e.touches[0].clientX, y: e.touches[0].clientY, set: false };
    }
    function move(e) {
      if (!s || s.set) return;
      var dx = Math.abs(e.touches[0].clientX - s.x),
        dy = Math.abs(e.touches[0].clientY - s.y);
      if (dx < 10 && dy < 10) return;
      s.set = true;
      var scr = row.closest('.screen');
      if (dx > dy) {
        if (scr) scr.style.overflowY = 'hidden';
      } else row.style.overflowX = 'hidden';
    }
    function end() {
      s = null;
      var scr = row.closest('.screen');
      if (scr) scr.style.overflowY = '';
      row.style.overflowX = '';
    }
    row.addEventListener('touchstart', start, { passive: true });
    row.addEventListener('touchmove', move, { passive: true });
    row.addEventListener('touchend', end);
    row.addEventListener('touchcancel', end);
    return () => {
      row.removeEventListener('touchstart', start);
      row.removeEventListener('touchmove', move);
      row.removeEventListener('touchend', end);
      row.removeEventListener('touchcancel', end);
    };
  }, []);
}

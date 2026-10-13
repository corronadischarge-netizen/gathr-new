import { useRef } from 'react';
import { animate } from '../lib/motion';
import { icon } from './helpers';

/* A row you can swipe left to remove (interactions spec 6.10). It follows the finger; let go past 35% of its width (or
   flick) and it slides away, then onRemove() runs (the screen shows the Undo toast); otherwise it springs back.
   Up-and-down stays ordinary scrolling (touch-action: pan-y). The same action always exists as a button too. */
const RELEASE = 0.35;

export function SwipeRow(p) {
  var row = useRef(null),
    st = useRef(null),
    swiped = useRef(false);
  function down(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    st.current = { x: e.clientX, y: e.clientY, d: 0, v: 0, t: e.timeStamp, on: false, off: false, id: e.pointerId };
  }
  function move(e) {
    var s = st.current,
      el = row.current;
    if (!s || s.off || !el) return;
    var dx = e.clientX - s.x,
      dy = e.clientY - s.y;
    if (!s.on) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      // only a leftward, mostly sideways swipe; anything else is a scroll or a tap
      if (dx < 0 && Math.abs(dx) > Math.abs(dy)) {
        s.on = true;
        el.setPointerCapture(s.id);
        el.classList.add('is-dragging');
      } else {
        s.off = true;
        return;
      }
    }
    var k = el.getBoundingClientRect().width / el.offsetWidth || 1,
      d = Math.min(0, dx / k),
      dt = e.timeStamp - s.t;
    if (dt > 0) s.v = (d - s.d) / dt;
    s.d = d;
    s.t = e.timeStamp;
    el.style.transform = 'translateX(' + d + 'px)';
  }
  function up() {
    var s = st.current,
      el = row.current;
    st.current = null;
    if (!s || !s.on || !el) return;
    swiped.current = true;
    setTimeout(() => (swiped.current = false), 0);
    el.classList.remove('is-dragging');
    if (-s.d > el.offsetWidth * RELEASE || (s.v < -0.5 && s.d < -24)) {
      animate(el, [{ transform: 'translateX(' + s.d + 'px)', opacity: 1 }, { transform: 'translateX(-100%)', opacity: 0 }], {
        speed: 'slow',
        ease: 'exit',
        exit: true
      }).then(() => {
        el.style.opacity = '0';
        el.style.transform = 'translateX(-100%)';
        p.onRemove();
      });
    } else {
      el.style.transform = '';
      animate(el, [{ transform: 'translateX(' + s.d + 'px)' }, { transform: 'none' }], { speed: 'base' });
    }
  }
  return (
    <div className="swipe-row" data-flip={p.flip}>
      <div className="swipe-under" aria-hidden="true">
        {icon('x', 20)}
        <span>Remove</span>
      </div>
      <div
        ref={row}
        className="swipe-top"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onClickCapture={(e) => {
          // the end of a swipe isn't a tap
          if (swiped.current) {
            e.stopPropagation();
            e.preventDefault();
          }
        }}
      >
        {p.children}
      </div>
    </div>
  );
}

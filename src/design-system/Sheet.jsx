import { useEffect, useRef } from 'react';
import { ms } from '../lib/motion';
import { IconButton } from './IconButton';
import { cx } from './utils';

/* Dragging a sheet down to close it (interactions spec 4). It follows the finger; let go past 30% of its height
   (or flick down) and it closes, otherwise it springs back. It drags from the grabber or the header, and from
   its content once that's scrolled to the top (until then a downward swipe just scrolls). ✕ always works too. */
const RELEASE = 0.3;

function begin(slot) {
  slot.classList.remove('rise', 'settling');
  slot.classList.add('dragging');
}
function move(slot, d) {
  slot.style.transform = 'translateY(' + d + 'px)';
}
function settle(slot) {
  slot.classList.remove('dragging');
  slot.classList.add('settling');
  slot.style.transform = '';
  setTimeout(() => slot.classList.remove('settling'), ms('--motion-normal') + 20);
}
function finish(slot, d, v, onClose) {
  if (d > slot.offsetHeight * RELEASE || (v > 0.5 && d > 24)) {
    onClose();
    // a sheet that can't close right now (a payment is open) springs back instead
    setTimeout(() => {
      if (slot.isConnected) settle(slot);
    }, 0);
  } else settle(slot);
}
/* the phone frame may be scaled on a desktop screen; drag distances are in the sheet's own pixels */
function scaleOf(slot) {
  return slot.getBoundingClientRect().height / slot.offsetHeight || 1;
}

/* the grabber and header: pointer events (mouse and touch) */
function useHandleDrag(onClose) {
  var st = useRef(null);
  var slotOf = (e) => e.currentTarget.closest('.sheet-slot');
  return {
    onPointerDown: (e) => {
      if (e.target.closest('button') || (e.pointerType === 'mouse' && e.button !== 0)) return;
      var slot = slotOf(e);
      if (!slot) return;
      st.current = { y: e.clientY, k: scaleOf(slot), d: 0, v: 0, t: e.timeStamp, on: false };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove: (e) => {
      var s = st.current,
        slot = slotOf(e);
      if (!s || !slot) return;
      var d = Math.max(0, (e.clientY - s.y) / s.k);
      if (!s.on && d < 6) return;
      if (!s.on) {
        s.on = true;
        begin(slot);
      }
      var dt = e.timeStamp - s.t;
      if (dt > 0) s.v = (d - s.d) / dt;
      s.d = d;
      s.t = e.timeStamp;
      move(slot, d);
    },
    onPointerUp: (e) => {
      var s = st.current,
        slot = slotOf(e);
      st.current = null;
      if (s && s.on && slot) finish(slot, s.d, s.v, onClose);
    },
    onPointerCancel: (e) => {
      var slot = slotOf(e);
      if (st.current && st.current.on && slot) settle(slot);
      st.current = null;
    }
  };
}

export function Sheet(p) {
  var drag = useHandleDrag(p.onClose),
    box = useRef(null),
    close = useRef(p.onClose);
  close.current = p.onClose;
  useEffect(() => {
    var sheet = box.current;
    if (!sheet) return;
    var s = null;
    /* the content: touch events, so a drag that starts at the top can stop the page from scrolling */
    function start(e) {
      if (e.touches.length !== 1 || e.target.closest('.g-sheet-head, .g-grabber')) return;
      s = { x: e.touches[0].clientX, y: e.touches[0].clientY, on: false, off: false, d: 0, v: 0, t: e.timeStamp };
    }
    function moveT(e) {
      if (!s || s.off) return;
      var slot = sheet.closest('.sheet-slot');
      if (!slot) return;
      var k = scaleOf(slot),
        dx = (e.touches[0].clientX - s.x) / k,
        dy = (e.touches[0].clientY - s.y) / k;
      if (!s.on) {
        if (Math.abs(dy) < 6 && Math.abs(dx) < 6) return;
        // only a downward drag with the content at its top moves the sheet; anything else scrolls as usual
        if (dy > 0 && Math.abs(dy) > Math.abs(dx) && sheet.scrollTop <= 0) {
          s.on = true;
          s.y = e.touches[0].clientY; // start from here, so the sheet doesn't jump
          begin(slot);
        } else {
          s.off = true;
          return;
        }
      }
      e.preventDefault();
      var d = Math.max(0, (e.touches[0].clientY - s.y) / k),
        dt = e.timeStamp - s.t;
      if (dt > 0) s.v = (d - s.d) / dt;
      s.d = d;
      s.t = e.timeStamp;
      move(slot, d);
    }
    function end() {
      var slot = sheet.closest('.sheet-slot');
      if (s && s.on && slot) finish(slot, s.d, s.v, () => close.current && close.current());
      s = null;
    }
    /* typing: keep the field in view above the keyboard */
    function focusIn(e) {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))
        setTimeout(() => {
          try {
            e.target.scrollIntoView({ block: 'nearest' });
          } catch (er) {}
        }, 350);
    }
    sheet.addEventListener('touchstart', start, { passive: true });
    sheet.addEventListener('touchmove', moveT, { passive: false });
    sheet.addEventListener('touchend', end);
    sheet.addEventListener('touchcancel', end);
    sheet.addEventListener('focusin', focusIn);
    return () => {
      sheet.removeEventListener('touchstart', start);
      sheet.removeEventListener('touchmove', moveT);
      sheet.removeEventListener('touchend', end);
      sheet.removeEventListener('touchcancel', end);
      sheet.removeEventListener('focusin', focusIn);
    };
  }, []);
  return (
    <section ref={box} className={cx('g-sheet', p.className)} role="dialog" aria-modal="true" aria-label={p.title}>
      <span className="g-grabber" aria-hidden="true" {...drag} />
      <header className="g-sheet-head" {...drag}>
        <div>
          {/* focus lands here when the sheet opens, so a screen reader starts at its title */}
          <h2 className="g-sheet-title" tabIndex={-1}>
            {p.title}
          </h2>
          {p.subtitle ? <p className="g-sheet-sub">{p.subtitle}</p> : null}
        </div>
        <IconButton icon="x" label="Close" variant="solid" onClick={p.onClose} />
      </header>
      <div className="g-sheet-body">{p.children}</div>
    </section>
  );
}

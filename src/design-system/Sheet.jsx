import { useRef } from 'react';
import { IconButton } from './IconButton';
import { cx } from './utils';

/* Pull the handle or header down to close the sheet. It follows the finger; let go past a quarter of its
   height (or flick down) and it closes, otherwise it settles back. The Close button always works too. */
function useDragToClose(onClose) {
  var st = useRef(null);
  function slotOf(e) {
    return e.currentTarget.closest('.sheet-slot');
  }
  function settle(slot) {
    slot.classList.remove('dragging');
    slot.classList.add('settling');
    slot.style.transform = '';
    setTimeout(() => slot.classList.remove('settling'), 220);
  }
  return {
    onPointerDown: (e) => {
      if (e.target.closest('button') || (e.pointerType === 'mouse' && e.button !== 0)) return;
      var slot = slotOf(e);
      if (!slot) return;
      st.current = { y: e.clientY, k: slot.getBoundingClientRect().height / slot.offsetHeight || 1, d: 0, v: 0, t: e.timeStamp, on: false };
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
        slot.classList.remove('rise', 'settling');
        slot.classList.add('dragging');
      }
      var dt = e.timeStamp - s.t;
      if (dt > 0) s.v = (d - s.d) / dt;
      s.d = d;
      s.t = e.timeStamp;
      slot.style.transform = 'translateY(' + d + 'px)';
    },
    onPointerUp: (e) => {
      var s = st.current,
        slot = slotOf(e);
      st.current = null;
      if (!s || !s.on || !slot) return;
      if (s.d > slot.offsetHeight * 0.25 || (s.v > 0.5 && s.d > 24)) {
        onClose();
        // a sheet that can't close right now (a payment is open) settles back instead
        setTimeout(() => {
          if (slot.isConnected) settle(slot);
        }, 0);
      } else settle(slot);
    },
    onPointerCancel: (e) => {
      var slot = slotOf(e);
      if (st.current && slot) settle(slot);
      st.current = null;
    }
  };
}

export function Sheet(p) {
  var drag = useDragToClose(p.onClose);
  return (
    <section className={cx('g-sheet', p.className)} role="dialog" aria-modal="true" aria-label={p.title}>
      <span className="g-grabber" aria-hidden="true" {...drag} />
      <header className="g-sheet-head" {...drag}>
        <div>
          <h2 className="g-sheet-title">{p.title}</h2>
          {p.subtitle ? <p className="g-sheet-sub">{p.subtitle}</p> : null}
        </div>
        <IconButton icon="x" label="Close" onClick={p.onClose} />
      </header>
      <div className="g-sheet-body">{p.children}</div>
    </section>
  );
}

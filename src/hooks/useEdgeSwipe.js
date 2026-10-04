import { useRef } from 'react';

/* Swipe from the left edge to go back. The screen follows the finger, with the previous screen waiting
   underneath. Let go past about a third of the width (or flick) and you go back; otherwise it snaps back.
   Used on iPhone and the web: on Android the system back gesture does this job.
   Returns handlers for a thin strip along the left edge; a plain tap on the strip goes to whatever is under it. */
const W = 390; // the phone frame's width in app pixels

export function useEdgeSwipe(o) {
  var st = useRef(null),
    opt = useRef(o);
  opt.current = o;

  function scaleOf() {
    var ph = o.phoneRef.current;
    return ph ? ph.getBoundingClientRect().width / W || 1 : 1;
  }
  function place(d, animate) {
    var s = opt.current.screenRef.current,
      u = opt.current.underRef.current,
      tr = animate ? 'transform var(--motion-back) var(--ease-standard), opacity var(--motion-back) var(--ease-standard)' : 'none';
    if (s) {
      s.style.transition = tr;
      s.style.transform = d ? 'translateX(' + d + 'px)' : '';
    }
    if (u) {
      u.style.transition = tr;
      u.style.transform = 'translateX(' + -0.2 * (W - d) + 'px)';
      u.style.opacity = String(0.4 + 0.6 * (d / W));
    }
  }
  function reset() {
    var s = opt.current.screenRef.current;
    if (s) {
      s.style.transition = '';
      s.style.transform = '';
    }
  }
  function tapThrough(e) {
    var strip = e.currentTarget;
    strip.style.pointerEvents = 'none';
    var el = document.elementFromPoint(e.clientX, e.clientY);
    strip.style.pointerEvents = '';
    if (el && el.click) el.click();
  }

  return {
    onPointerDown: (e) => {
      if (!opt.current.enabled || (e.pointerType === 'mouse' && e.button !== 0)) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      st.current = { x: e.clientX, y: e.clientY, k: scaleOf(), on: false, d: 0, v: 0, t: e.timeStamp };
    },
    onPointerMove: (e) => {
      var s = st.current;
      if (!s) return;
      var dx = (e.clientX - s.x) / s.k,
        dy = (e.clientY - s.y) / s.k;
      if (!s.on) {
        if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
          s.on = true;
          opt.current.onStart();
        } else if (Math.abs(dy) > 8) st.current = null; // a scroll, not a swipe
        return;
      }
      var d = Math.max(0, Math.min(W, dx)),
        dt = e.timeStamp - s.t;
      if (dt > 0) s.v = (d - s.d) / dt;
      s.d = d;
      s.t = e.timeStamp;
      place(d, false);
    },
    onPointerUp: (e) => {
      var s = st.current;
      st.current = null;
      if (!s) return;
      if (!s.on) {
        tapThrough(e);
        return;
      }
      var go = s.d > W * 0.35 || (s.v > 0.5 && s.d > 24);
      place(go ? W : 0, true);
      setTimeout(() => {
        if (go) opt.current.onBack();
        else {
          reset();
          opt.current.onCancel();
        }
      }, 250);
    },
    onPointerCancel: () => {
      var s = st.current;
      st.current = null;
      if (s && s.on) {
        place(0, true);
        setTimeout(() => {
          reset();
          opt.current.onCancel();
        }, 250);
      }
    }
  };
}

import { useEffect, useRef } from 'react';
import { cx } from './utils';

const DURATION = { plain: 2400, action: 5000 };

/* The app's only toast: every short message and Undo. Docked 32px up, or 12px above the tab bar;
   2.4 s, or 5 s with an action, then onClose */
export function Toast(p) {
  var ms = p.duration || (p.action ? DURATION.action : DURATION.plain),
    close = useRef(p.onClose);
  close.current = p.onClose;
  // the clock starts once per toast; a new onClose from a redraw doesn't restart it
  useEffect(() => {
    var t = setTimeout(() => typeof close.current === 'function' && close.current(), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return (
    <div
      className={cx('g-toast', p.docked && 'g-toast-dock', p.docked && p.aboveTabBar && 'is-above-tabbar', p.className)}
      role="status"
    >
      <span>{p.children}</span>
      {p.action ? (
        <button type="button" onClick={p.onAction}>
          {p.action}
        </button>
      ) : null}
    </div>
  );
}

Toast.duration = DURATION;

import { useEffect, useRef } from 'react';

/* dialogs: focus moves in, Tab stays inside, Esc closes, focus goes back to what opened it */
export function useDialog(ref, open, close) {
  var cl = useRef(close);
  cl.current = close;
  useEffect(() => {
    if (!open) return;
    var prev = document.activeElement,
      root = ref.current;
    function items() {
      return root
        ? Array.prototype.filter.call(
            root.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), [tabindex="0"]'),
            (x) => x.offsetParent !== null || x === document.activeElement
          )
        : [];
    }
    var t = setTimeout(() => {
      if (!root || root.contains(document.activeElement)) return;
      // a sheet's title first (spec 4: a screen reader starts at the title, and no keyboard pops up unasked);
      // a field marked data-autofocus wins; other dialogs fall back to their first field or control
      var f =
        root.querySelector('[data-autofocus]') ||
        root.querySelector('.g-sheet-title') ||
        root.querySelector('input:not([disabled])') ||
        items()[0];
      if (f) f.focus({ preventScroll: true });
    }, 60);
    function key(ev) {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        cl.current();
        return;
      }
      if (ev.key !== 'Tab') return;
      var list = items();
      if (!list.length) return;
      var first = list[0],
        last = list[list.length - 1];
      if (ev.shiftKey && document.activeElement === first) {
        ev.preventDefault();
        last.focus();
      } else if (!ev.shiftKey && document.activeElement === last) {
        ev.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', key);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', key);
      if (prev && prev.focus && document.body.contains(prev))
        try {
          prev.focus({ preventScroll: true });
        } catch (e) {}
    };
  }, [open]);
}

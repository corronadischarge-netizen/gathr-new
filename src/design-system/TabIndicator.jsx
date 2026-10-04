import { useLayoutEffect, useRef } from 'react';

/* The active-tab disc. It sits behind the tab buttons and slides to whichever one is active,
   so you see where you went. On first show it appears in place, without sliding. */
export function TabIndicator(p) {
  var ref = useRef(null),
    shown = useRef(false);
  useLayoutEffect(() => {
    var ind = ref.current,
      on = ind && ind.parentNode.querySelector('.g-tab.is-active');
    if (!ind) return;
    if (!on) {
      ind.style.opacity = '0';
      return;
    }
    if (!shown.current) ind.style.transition = 'none';
    ind.style.opacity = '';
    ind.style.width = on.offsetWidth + 'px';
    ind.style.height = on.offsetHeight + 'px';
    ind.style.transform = 'translate(' + on.offsetLeft + 'px, ' + on.offsetTop + 'px)';
    if (!shown.current) {
      void ind.offsetWidth; // apply the starting place before transitions switch back on
      ind.style.transition = '';
      shown.current = true;
    }
  }, [p.active]);
  return <span ref={ref} className="g-tab-ind" aria-hidden="true" />;
}

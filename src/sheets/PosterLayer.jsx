import { useLayoutEffect, useRef } from 'react';
import { flipTo } from '../hooks/useSheetExit';
import { ms, reducedMotion } from '../lib/motion';
import { svgIcon } from '../ui/helpers';

/* The organiser's full poster, full screen. Tap anywhere or press Esc to close.
   It grows out of the poster on the event page, and shrinks back into it when it closes (useSheetExit). */
export function PosterLayer(p) {
  var e = p.ctx.ev,
    img = useRef(null);
  useLayoutEffect(() => {
    var el = img.current,
      origin = document.querySelector('.phone > .screen:not(.ghost):not(.under) .ev-hero-img');
    if (!el || !origin || reducedMotion() || !el.animate) return;
    function grow() {
      el.animate(
        [
          { transform: flipTo(el, origin), opacity: 0.4 },
          { transform: 'none', opacity: 1 }
        ],
        {
          duration: ms('--motion-slow'),
          easing: 'cubic-bezier(0, 0, 0.2, 1)'
        }
      );
    }
    if (el.complete && el.naturalWidth) grow();
    else el.addEventListener('load', grow, { once: true });
  }, []);
  return (
    <div
      className="sheet-layer poster-layer"
      ref={p.layerRef}
      onClick={p.close}
      role="dialog"
      aria-modal="true"
      aria-label="Full poster"
    >
      <button
        type="button"
        className="g-ibtn g-ibtn-solid poster-x"
        aria-label="Close poster"
        onClick={p.close}
      >
        {svgIcon(['M6 6l12 12', 'M18 6L6 18'])}
      </button>
      <img ref={img} src={e.img} alt={'Poster for ' + e.title} className="poster-img" />
      <p className="meta" style={{ textAlign: 'center', margin: '16px 24px 0', color: 'var(--night-300)' }}>
        The organiser’s full poster · tap or press Esc to close
      </p>
    </div>
  );
}

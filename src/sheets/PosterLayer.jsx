import { svgIcon } from '../ui/helpers';

/* The organiser's full poster, full screen. Tap anywhere or press Esc to close. */
export function PosterLayer(p) {
  var e = p.ctx.ev;
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
      <img src={e.img} alt={'Poster for ' + e.title} className="poster-img" />
      <p className="meta" style={{ textAlign: 'center', margin: '16px 24px 0', color: 'var(--night-300)' }}>
        The organiser’s full poster · tap or press Esc to close
      </p>
    </div>
  );
}

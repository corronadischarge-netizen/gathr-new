import { cx, fillOf, textOn } from './utils';

let uid = 0;

const SHAPES = {
  circle: <circle cx={0.5} cy={0.5} r={0.5} />,
  arch: <path d="M0,1 V0.5 A0.5,0.5 0 0 1 1,0.5 V1 Z" />,
  pill: <rect x={0} y={0} width={1} height={1} rx={0.5} ry={0.3} />,
  flower: [
    <circle key={1} cx={0.28} cy={0.28} r={0.28} />,
    <circle key={2} cx={0.72} cy={0.28} r={0.28} />,
    <circle key={3} cx={0.28} cy={0.72} r={0.28} />,
    <circle key={4} cx={0.72} cy={0.72} r={0.28} />,
    <rect key={5} x={0.2} y={0.2} width={0.6} height={0.6} />
  ]
};

export function ShapeAvatar(p) {
  var id = 'g-clip-' + ++uid,
    size = p.size || 112,
    hue = p.hue || 'pink';
  return (
    <figure className={cx('g-shape', p.className)} style={{ width: size + 'px' }}>
      <svg width={size} height={size} viewBox="0 0 1 1" aria-hidden="true">
        <defs>
          <clipPath id={id} clipPathUnits="objectBoundingBox">
            {SHAPES[p.shape || 'circle']}
          </clipPath>
        </defs>
        <g clipPath={'url(#' + id + ')'}>
          <rect width={1} height={1} fill={fillOf(hue)} />
          {p.image ? <image href={p.image} width={1} height={1} preserveAspectRatio="xMidYMid slice" /> : null}
        </g>
      </svg>
      {/* the initial is HTML laid over the shape, so it's centred by layout rather than a guessed baseline */}
      {p.image ? null : (
        <span
          className="g-shape-ini"
          aria-hidden="true"
          style={{ width: size + 'px', height: size + 'px', fontSize: Math.round(size * 0.4) + 'px', color: textOn(hue) }}
        >
          {(p.name || '?').trim().charAt(0).toUpperCase()}
        </span>
      )}
      {p.name ? (
        <figcaption>
          <b>{p.name}</b>
          {p.handle ? <span style={{ color: 'var(--' + hue + '-300)' }}>{p.handle}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}

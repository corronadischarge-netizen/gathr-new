import { LOGO_DOT, LOGO_PATHS, LOGO_VB } from './logo';
import { cx } from './utils';

export function Wordmark(p) {
  var size = p.size || 32,
    tone = p.tone || 'auto';
  var vb = LOGO_VB.split(' ').map(Number),
    w = (size * vb[2]) / vb[3];
  return (
    <svg
      className={cx('g-logo', 'g-logo-' + tone, p.className)}
      style={p.style}
      width={w}
      height={size}
      viewBox={LOGO_VB}
      role="img"
      aria-label="gathr"
    >
      <g className="g-logo-word" dangerouslySetInnerHTML={{ __html: LOGO_PATHS }} />
      <circle className="g-logo-dot" cx={LOGO_DOT.cx} cy={LOGO_DOT.cy} r={LOGO_DOT.r} />
    </svg>
  );
}

import { useRef } from 'react';
import { LOGO_DOT, LOGO_PATHS, LOGO_VB } from './logo';
import { cx } from './utils';

/* EchoPattern: gathr's brand pattern. The vibe-tag bubble echoes outward from the wordmark, each echo with a sharp
   outer edge and an inner edge that glows in a Bloom recipe, fading into a deep ground of the same family.
   A brand moment: end slides, share cards, splash. logo={false} is a plain backdrop with children on top */
const ECHO = {
  peak: { ground: 'color-mix(in srgb, var(--violet-500) 42%, var(--night-950))', glow: ['var(--yellow-300)', 'var(--red-300)', 'var(--pink-300)', 'var(--blue-500)'] },
  uv: { ground: 'color-mix(in srgb, var(--violet-500) 30%, var(--night-950))', glow: ['var(--pink-300)', 'var(--violet-300)', 'var(--violet-300)', 'var(--pink-300)'] },
  sundowner: { ground: 'color-mix(in srgb, var(--pink-500) 34%, var(--night-950))', glow: ['var(--yellow-300)', 'var(--red-300)', 'var(--pink-300)', 'var(--yellow-300)'] },
  comedown: { ground: 'color-mix(in srgb, var(--blue-500) 32%, var(--night-950))', glow: ['var(--green-300)', 'var(--blue-300)', 'var(--violet-300)', 'var(--blue-300)'] }
};

/* a speech bubble with its tail, centred on x0, y0 */
function bubblePath(x0, y0, w, hh) {
  var r = hh / 2,
    L = x0 - w / 2,
    R = x0 + w / 2,
    T = y0 - r,
    Bo = y0 + r;
  var t1 = L + r + w * 0.06,
    t2 = t1 + hh * 0.34,
    ax = t1 - hh * 0.06,
    ay = Bo + hh * 0.3;
  return (
    'M' + (L + r) + ' ' + T + 'H' + (R - r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (R - r) + ' ' + Bo + 'H' + t2 + 'L' + ax + ' ' + ay +
    'L' + t1 + ' ' + Bo + 'H' + (L + r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (L + r) + ' ' + T + 'Z'
  );
}

var uid = 0;

export function EchoPattern(p) {
  var idRef = useRef(null);
  if (!idRef.current) idRef.current = 'gecho' + ++uid;
  var id = idRef.current,
    rec = ECHO[p.recipe] || ECHO.peak,
    n = p.rings || 4;
  var W = 400,
    H = 500,
    x0 = 200,
    y0 = 236,
    w0 = 236,
    h0 = 118,
    scales = [];
  for (var k = n - 1; k >= 0; k--) scales.push(1 + k * 0.62);
  var lw = w0 * 0.66,
    lh = (lw * 977) / 2505.4;
  return (
    <div
      className={cx('g-echo', p.className)}
      style={Object.assign({ background: rec.ground }, p.style)}
      role={p.logo === false ? undefined : 'img'}
      aria-label={p.logo === false ? undefined : 'gathr'}
    >
      <svg className="g-echo-svg" viewBox={'0 0 ' + W + ' ' + H} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id={id + 'g'} x1="0" y1="1" x2="1" y2="0">
            {rec.glow.map((c, i) => (
              <stop key={i} offset={i / (rec.glow.length - 1)} style={{ stopColor: c }} />
            ))}
          </linearGradient>
          <filter id={id + 'b'} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={7} />
          </filter>
        </defs>
        {scales.map((sc, i) => {
          var d = bubblePath(x0, y0, w0 * sc, h0 * sc);
          return (
            <g key={i} clipPath={'url(#' + id + 'c' + i + ')'}>
              <clipPath id={id + 'c' + i}>
                <path d={d} />
              </clipPath>
              <path d={d} style={{ fill: rec.ground }} />
              <path d={d} fill="none" stroke={'url(#' + id + 'g)'} strokeWidth={h0 * sc * 0.2} filter={'url(#' + id + 'b)'} />
            </g>
          );
        })}
        {p.logo === false ? null : (
          <svg x={x0 - lw / 2} y={y0 - lh / 2 - h0 * 0.02} width={lw} height={lh} viewBox={LOGO_VB}>
            <g style={{ fill: 'var(--night-50)' }} dangerouslySetInnerHTML={{ __html: LOGO_PATHS }} />
            <circle cx={LOGO_DOT.cx} cy={LOGO_DOT.cy} r={LOGO_DOT.r} style={{ fill: 'var(--yellow-300)' }} />
          </svg>
        )}
      </svg>
      <span className="g-grain" aria-hidden="true" />
      {p.children ? <div className="g-echo-content">{p.children}</div> : null}
    </div>
  );
}

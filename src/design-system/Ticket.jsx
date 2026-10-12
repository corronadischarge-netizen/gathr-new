import qrcode from 'qrcode-generator';
import { Bloom } from './Bloom';
import { Wordmark } from './Wordmark';
import { cx, fillOf, textOn } from './utils';

const DARK_ON = { yellow: 1, green: 1, pink: 1, red: 1 };
/* each hue's pop partner, for the vibe tag and the arrow */
const POP = { violet: 'yellow', blue: 'yellow', red: 'yellow', pink: 'violet', green: 'violet', yellow: 'violet' };

function popVal(hue) {
  return hue === 'violet' || hue === 'blue' ? 'var(--' + hue + '-500)' : 'var(--' + hue + '-300)';
}

/* the real entry code, printed straight on the ground in the ticket's ink; the ground around it is its quiet zone */
function TicketCode(p) {
  var q;
  try {
    q = qrcode(0, 'M');
    q.addData(p.code);
    q.make();
  } catch (err) {
    return null;
  }
  var n = q.getModuleCount(),
    d = '';
  for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) d += 'M' + c + ' ' + r + 'h1v1h-1z';
  return (
    <svg className="g-tk-code" viewBox={'0 0 ' + n + ' ' + n} shapeRendering="crispEdges" role="img" aria-label={p.label}>
      <path d={d} fill="currentColor" />
    </svg>
  );
}

/* A collectible ticket: wordmark and vibe tag, the name, a "day date → time" pill row, the venue, and a stub with the code */
export function Ticket(p) {
  var hue = p.hue || 'violet',
    night = p.ground === 'night' || (p.hosted && p.ground !== 'hue'),
    pop = p.popHue || (night ? hue : POP[hue]),
    when = [p.day, p.date].filter(Boolean).join(' ');
  var st = Object.assign(
    {
      fontSize: 16 * (p.scale || 1) + 'px',
      '--tk-fill': night ? 'var(--night-950)' : fillOf(hue),
      '--tk-shine': night ? 'none' : 'var(--shine-' + hue + ')',
      '--tk-ink': night ? 'var(--night-50)' : textOn(hue),
      '--tk-pop': popVal(pop),
      '--tk-pop-shine': 'var(--shine-' + pop + ')',
      '--tk-on-pop': textOn(pop),
      transform: p.tilt ? 'rotate(' + p.tilt + 'deg)' : undefined
    },
    p.style
  );
  return (
    <div className={cx('g-ticket-wrap', p.className)} style={st}>
      <article
        className={cx('g-ticket', 'g-ticket-' + hue, night && 'is-night', !night && !DARK_ON[hue] && 'is-light-ink')}
        aria-label={'Ticket: ' + p.name + (when ? ', ' + when : '') + (p.time ? ', ' + p.time : '') + (p.venue ? ', ' + p.venue : '')}
      >
        {night ? (
          <Bloom recipe={p.recipe || 'sundowner'} at="bottom" still className="g-tk-bloom" />
        ) : (
          <span className="g-grain g-tk-grain" aria-hidden="true" />
        )}
        <div className="g-tk-head">
          <Wordmark size={20} tone="auto" className="g-tk-logo" />
          {p.kicker ? <span className="g-tk-tag">{p.kicker}</span> : null}
        </div>
        <div className="g-tk-main">
          <h3 className="g-tk-name">
            {p.name}
            {p.hosted ? <span className="g-tk-stop">.</span> : null}
          </h3>
          <div className="g-tk-facts">
            {when ? <span className="g-tk-pill is-solid">{when}</span> : null}
            {when && p.time ? (
              <span className="g-tk-arrow" aria-hidden="true">
                →
              </span>
            ) : null}
            {p.time ? <span className="g-tk-pill is-solid">{p.time}</span> : null}
          </div>
          {p.venue ? (
            <div className="g-tk-facts">
              <span className="g-tk-pill">{p.venue}</span>
            </div>
          ) : null}
        </div>
        <div className="g-tk-stub">
          <TicketCode code={p.code || p.number || p.name} label={'Entry code for ' + p.name} />
          <div className="g-tk-stub-meta">
            <span className="g-tk-admit">{p.admit || 'Admit one'}</span>
            <span className="g-tk-no">{'#' + (p.number || '0001')}</span>
          </div>
        </div>
      </article>
    </div>
  );
}

import { CROWD, LEVELS, cx } from './utils';

export function CrowdMeter(p) {
  var c = CROWD[p.level] || CROWD.quiet;
  return (
    <div
      className={cx(
        'g-crowd',
        'g-crowd-' + p.level,
        p.glass && 'g-crowd-glass',
        p.compact && 'g-crowd-compact',
        p.className
      )}
      role="img"
      aria-label={'Crowd: ' + c.label + '. ' + (p.line || c.line)}
    >
      <span className="g-crowd-bar" aria-hidden="true">
        {LEVELS.map((lv, i) => (
          <span
            key={lv}
            className={cx('g-seg', i < c.n && 'is-on')}
            style={i < c.n ? { background: 'var(--crowd-' + p.level + ')' } : null}
          />
        ))}
      </span>
      <span className="g-crowd-words" aria-hidden="true">
        <b>{c.label}</b>
        {p.compact ? null : <span>{p.line || c.line}</span>}
      </span>
    </div>
  );
}

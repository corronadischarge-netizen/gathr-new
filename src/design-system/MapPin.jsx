import { CROWD, cx } from './utils';

export function MapPin(p) {
  var c = CROWD[p.level] || CROWD.quiet;
  return (
    <div
      className={cx('g-pin', p.selected && 'is-selected', p.className)}
      role="img"
      aria-label={(p.label || '') + ', ' + c.label}
    >
      <span className="g-pin-head">
        <span className="g-pin-dot" style={{ background: 'var(--crowd-' + p.level + ')' }} />
        <span className="g-pin-text">
          {p.label ? <b>{p.label}</b> : null}
          <span>{c.label}</span>
        </span>
      </span>
      <span className="g-pin-tail" />
    </div>
  );
}

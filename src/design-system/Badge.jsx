import { cx } from './utils';

export function Badge(p) {
  return (
    <span className={cx('g-badge', 'g-badge-' + (p.tone || 'neutral'), p.className)}>
      {p.live ? <span className="g-live-dot" aria-hidden="true" /> : null}
      <span className="g-label">{p.children}</span>
    </span>
  );
}

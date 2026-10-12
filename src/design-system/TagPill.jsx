import { Icon } from './Icon';
import { cx } from './utils';

/* A short label on a photo or collage: a fact, a status or a tag. tone: light, glass (on photos), dark, go, brand */
export function TagPill(p) {
  return (
    <span className={cx('g-tag', 'g-tag-' + (p.tone || 'light'), p.className)} style={p.style}>
      {p.icon ? <Icon name={p.icon} size={15} /> : null}
      <span>{p.children}</span>
    </span>
  );
}

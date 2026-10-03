import { Icon } from './Icon';
import { cx } from './utils';

/* Avatar: the person's display picture; agnostic silhouette when they have none */
export function Avatar(p) {
  var size = p.size || 28;
  return (
    <span
      className={cx('g-avatar', !p.image && 'g-avatar-empty', p.className)}
      style={{ width: size + 'px', height: size + 'px' }}
      title={p.name}
    >
      {p.image ? (
        <img src={p.image} alt={p.name || ''} loading="lazy" />
      ) : (
        <Icon name="user" size={Math.round(size * 0.55)} />
      )}
    </span>
  );
}

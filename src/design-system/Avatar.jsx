import { cx } from './utils';

function initials(n) {
  var w = String(n || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return w.length ? (w[0][0] + (w.length > 1 ? w[w.length - 1][0] : '')).toUpperCase() : '';
}

/* Avatar: the person's photo, or their initials centred; never a silhouette */
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
        <span className="g-avatar-initials" style={{ fontSize: Math.round(size * 0.4) + 'px' }}>
          {initials(p.name)}
        </span>
      )}
    </span>
  );
}

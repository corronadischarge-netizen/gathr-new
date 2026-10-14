import { useState } from 'react';
import { cx } from './utils';

function initials(n) {
  var w = String(n || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return w.length ? (w[0][0] + (w.length > 1 ? w[w.length - 1][0] : '')).toUpperCase() : '';
}

/* Avatar: the person's photo, or their initials centred; never a silhouette.
   A picture that doesn't load (missing file, offline) shows the initials instead */
export function Avatar(p) {
  var size = p.size || 28;
  const [broken, setBroken] = useState(null);
  var image = p.image && p.image !== broken ? p.image : null;
  return (
    <span
      className={cx('g-avatar', !image && 'g-avatar-empty', p.className)}
      style={{ width: size + 'px', height: size + 'px' }}
      title={p.name}
    >
      {image ? (
        <img src={image} alt={p.name || ''} loading="lazy" onError={() => setBroken(image)} />
      ) : (
        <span className="g-avatar-initials" style={{ fontSize: Math.round(size * 0.4) + 'px' }}>
          {initials(p.name)}
        </span>
      )}
    </span>
  );
}

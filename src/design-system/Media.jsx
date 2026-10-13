import { useEffect, useState } from 'react';
import { Icon } from './Icon';
import { cx } from './utils';

/* images already loaded in this session show at once; new ones fade in when they arrive (interactions spec 2.6) */
const loaded = new Set();

export function Media(p) {
  var ph = !p.image && (p.neutral ? 'g-media-empty' : 'g-media-ph');
  const [ready, setReady] = useState(() => !p.image || loaded.has(p.image));
  useEffect(() => {
    if (!p.image || loaded.has(p.image)) {
      setReady(true);
      return;
    }
    setReady(false);
    var img = new Image(),
      live = true;
    img.onload = img.onerror = () => {
      loaded.add(p.image);
      if (live) setReady(true);
    };
    img.src = p.image;
    return () => {
      live = false;
    };
  }, [p.image]);
  return (
    <div
      className={cx('g-media', ph, p.className)}
      style={Object.assign({ '--ph': 'var(--' + (p.hue || 'violet') + '-500)' }, p.style)}
    >
      {/* the photo is its own layer behind everything in the frame, so it can fade in (opacity only) while the
          placeholder holds the space, and badges or the crowd chip on top never move */}
      {p.image ? (
        <span
          className={cx('g-media-photo', ready && 'is-ready')}
          style={{ backgroundImage: 'url(' + p.image + ')' }}
          aria-hidden="true"
        />
      ) : null}
      {!p.image && p.neutral ? (
        <span className="g-media-icon" aria-hidden="true">
          <Icon name="image" size={24} />
          {p.label ? <span className="g-media-label">{p.label}</span> : null}
        </span>
      ) : null}
      {p.children}
    </div>
  );
}

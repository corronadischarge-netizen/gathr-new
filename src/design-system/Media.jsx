import { Icon } from './Icon';
import { cx } from './utils';

export function Media(p) {
  var ph = !p.image && (p.neutral ? 'g-media-empty' : 'g-media-ph');
  return (
    <div
      className={cx('g-media', ph, p.className)}
      style={Object.assign(
        { '--ph': 'var(--' + (p.hue || 'violet') + '-500)' },
        p.image ? { backgroundImage: 'url(' + p.image + ')' } : null,
        p.style
      )}
    >
      {!p.image && p.neutral ? (
        <span className="g-media-icon" aria-hidden="true">
          <Icon name="image" size={28} />
          {p.label ? <span className="g-media-label">{p.label}</span> : null}
        </span>
      ) : null}
      {p.children}
    </div>
  );
}

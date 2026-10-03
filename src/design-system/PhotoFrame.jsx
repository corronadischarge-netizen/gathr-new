import { Media } from './Media';
import { cx } from './utils';

export function PhotoFrame(p) {
  return (
    <Media
      image={p.image}
      hue={p.hue || 'pink'}
      className={cx('g-photo', p.className)}
      style={Object.assign(
        {
          width: (p.width || 150) + 'px',
          height: (p.height || 120) + 'px',
          transform: 'rotate(' + (p.tilt || 0) + 'deg)'
        },
        p.style
      )}
    />
  );
}

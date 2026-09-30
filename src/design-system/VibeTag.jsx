import { cx, fillOf, textOn } from './utils';

export function VibeTag(p) {
  var hue = p.hue || 'yellow';
  return (
    <span
      className={cx('g-vibe', 'g-vibe-' + (p.tail || 'left'), p.className)}
      style={{
        backgroundColor: fillOf(hue),
        color: textOn(hue),
        transform: p.tilt ? 'rotate(' + p.tilt + 'deg)' : undefined,
        '--vibe': fillOf(hue)
      }}
    >
      {p.children}
    </span>
  );
}

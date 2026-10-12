import { cx } from './utils';

/* A 3D object from the design system's assets/Stickers. Still by default; `bob` makes it the one floating
   sticker on a screen. With no src a neutral placeholder shows */
export function Sticker(p) {
  var size = p.size || 96;
  var st = Object.assign({ width: size + 'px', height: size + 'px', '--tilt': (p.tilt || 0) + 'deg' }, p.style);
  if (!p.src)
    return (
      <span className={cx('g-sticker-ph', p.className)} style={st} aria-hidden="true">
        <span>{p.label || '3D'}</span>
      </span>
    );
  return (
    <img
      className={cx('g-sticker', p.bob && !p.still && 'is-bob', p.className)}
      src={p.src}
      alt={p.alt || ''}
      draggable={false}
      style={st}
    />
  );
}

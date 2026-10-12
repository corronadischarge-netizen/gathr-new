import { Sticker } from './Sticker';
import { cx } from './utils';

/* A dark tile with a 3D object breaking out of the top, for picking a vibe or category.
   Selected turns violet and its sticker bobs (the screen's one floating sticker) */
export function MoodTile(p) {
  return (
    <button
      type="button"
      className={cx('g-mood', p.selected && 'is-selected', p.className)}
      aria-pressed={p.selected ? 'true' : 'false'}
      style={p.style}
      onClick={p.onClick}
    >
      <Sticker
        src={p.sticker}
        size={p.stickerSize || 88}
        tilt={p.tilt == null ? -8 : p.tilt}
        bob={!!p.selected}
        className="g-mood-sticker"
      />
      <span className="g-mood-copy">
        {p.kicker ? <span className="g-mood-kicker">{p.kicker}</span> : null}
        <span className="g-mood-title">{p.title}</span>
      </span>
      {p.action ? <span className="g-mood-go">{p.action}</span> : null}
    </button>
  );
}

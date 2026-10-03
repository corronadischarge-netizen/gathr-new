import { cx } from './utils';

const RECIPES = { peak: 1, uv: 1, sundowner: 1, comedown: 1 };

export function Bloom(p) {
  var r = RECIPES[p.recipe] ? p.recipe : 'uv';
  return (
    <div
      className={cx(
        'g-bloom',
        'g-bloom-' + r,
        'g-bloom-at-' + (p.at || 'bottom'),
        p.still && 'is-still',
        p.className
      )}
      aria-hidden="true"
      style={p.style}
    >
      <span className="g-bloom-body" />
      {p.orb === false ? null : <span className="g-bloom-orb" />}
      <span className="g-grain" />
    </div>
  );
}

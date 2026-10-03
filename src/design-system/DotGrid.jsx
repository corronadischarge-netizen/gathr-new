import { cx, fillOf } from './utils';

export function DotGrid(p) {
  var v = Math.round(p.value || 0),
    dots = [];
  for (var i = 0; i < 100; i++)
    dots.push(
      <span key={i} style={{ background: i < 100 - v ? 'var(--night-700)' : fillOf(p.hue || 'blue') }} />
    );
  return (
    <figure className={cx('g-dotgrid', p.className)}>
      <div className="g-dots" aria-hidden="true">
        {dots}
      </div>
      <figcaption>
        <span className="g-dot-num">{v + '%'}</span>
        <span>{p.label}</span>
      </figcaption>
    </figure>
  );
}

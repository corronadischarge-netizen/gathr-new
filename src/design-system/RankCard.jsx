import { Media } from './Media';
import { cx, fillOf, textOn } from './utils';

export function RankCard(p) {
  var hue = p.hue || 'violet';
  return (
    <article
      className={cx('g-rank', p.className)}
      style={{ backgroundColor: fillOf(hue), color: textOn(hue) }}
    >
      <span className="g-rank-num" aria-hidden="true">
        {p.rank}
      </span>
      <Media image={p.image} hue={hue === 'violet' ? 'pink' : 'violet'} className="g-rank-media" />
      <div className="g-rank-copy">
        <h3 className="g-rank-title">
          <span className="g-sr">{'#' + p.rank + ' '}</span>
          {p.title}
        </h3>
        <p className="g-rank-sub">{p.subtitle}</p>
        <button type="button" className="g-rank-btn">
          {p.action || 'View'}
        </button>
      </div>
    </article>
  );
}

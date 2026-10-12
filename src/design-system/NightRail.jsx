import { Children } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';
import { cx } from './utils';

/* A titled horizontal row of NightTiles for one day. The next tile peeks from the right; tiles snap to their start.
   When the day has more nights than tiles (total), a "See all {n}" end tile closes the row */
export function NightRail(p) {
  var tiles = Children.toArray(p.children).filter(Boolean);
  if (!tiles.length) return null;
  var more = p.total && p.total > tiles.length;
  return (
    <section className={cx('g-rail', p.className)}>
      <div className="g-rail-head">
        <h2 className="g-rail-title">{p.title}</h2>
        {p.seeAllLabel && p.onSeeAll ? (
          <Button variant="subtle" size="sm" onClick={p.onSeeAll}>
            {p.seeAllLabel}
          </Button>
        ) : null}
      </div>
      <div className="g-rail-scroll" role="list" aria-label={p.title + ', ' + (p.total || tiles.length) + ' nights'} tabIndex={0}>
        {tiles.map((t, i) => (
          <div key={t.key || i} role="listitem" className="g-rail-item">
            {t}
          </div>
        ))}
        {more ? (
          <div role="listitem" className="g-rail-item">
            <div
              role="link"
              tabIndex={0}
              className="g-rail-end"
              onClick={p.onSeeAll}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && p.onSeeAll) {
                  e.preventDefault();
                  p.onSeeAll();
                }
              }}
            >
              <span>{'See all ' + p.total}</span>
              <Icon name="arrow-right" size={20} />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

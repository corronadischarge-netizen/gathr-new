import { Children, useEffect, useRef } from 'react';
import { useAxisLock } from '../hooks/useAxisLock';
import { Button } from './Button';
import { Icon } from './Icon';
import { cx } from './utils';

/* A titled horizontal row of NightTiles for one day. The next tile peeks from the right; tiles snap to their start.
   When the day has more nights than tiles (total), a "See all {n}" end tile closes the row.
   App additions for logging: onView (first time half of it is on screen), onScroll(maxIndex) (the furthest tile seen) */
export function NightRail(p) {
  var tiles = Children.toArray(p.children).filter(Boolean),
    box = useRef(null),
    far = useRef(-1),
    row = useRef(null);
  useAxisLock(row); // a sideways swipe never scrolls the page, and vice versa (locks after 10px)
  useEffect(() => {
    if (!p.onView || !box.current || typeof IntersectionObserver === 'undefined') return;
    var io = new IntersectionObserver(
      (es) => {
        if (es.some((x) => x.isIntersecting)) {
          io.disconnect();
          p.onView();
        }
      },
      { threshold: 0.5 }
    );
    io.observe(box.current);
    return () => io.disconnect();
  }, []);
  if (!tiles.length) return null;
  var more = p.total && p.total > tiles.length;
  function scrolled(e) {
    if (!p.onScroll) return;
    var el = e.currentTarget,
      first = el.firstElementChild,
      step = first ? first.getBoundingClientRect().width + 12 : 168,
      i = Math.min(tiles.length - 1, Math.floor((el.scrollLeft + el.clientWidth - 16) / step));
    if (i > far.current) {
      far.current = i;
      p.onScroll(i);
    }
  }
  return (
    <section className={cx('g-rail', p.className)} ref={box}>
      <div className="g-rail-head">
        <h2 className="g-rail-title">{p.title}</h2>
        {p.seeAllLabel && p.onSeeAll ? (
          <Button variant="subtle" size="sm" onClick={p.onSeeAll}>
            {p.seeAllLabel}
          </Button>
        ) : null}
      </div>
      <div
        ref={row}
        className="g-rail-scroll"
        role="list"
        aria-label={p.title + ', ' + (p.total || tiles.length) + ' nights'}
        tabIndex={0}
        onScroll={scrolled}
      >
        {tiles.map((t, i) => (
          <div key={t.key || i} role="listitem" className="g-rail-item" data-flip={t.key || i}>
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

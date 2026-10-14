import { Badge } from './Badge';
import { CrowdMeter } from './CrowdMeter';
import { DoorVerdict } from './DoorVerdict';
import { Media } from './Media';
import { CROWD, cx } from './utils';

/* A small poster tile for browsing many nights (rails), or a row in the full list (layout="row").
   The whole tile is one link: no buttons inside. Answers the five questions at a glance.
   r25 tile order: what (name) → where and when + cost → the door line only when it asks something of you (if, unknown);
   a yes shows nothing on a tile, but every verdict stays in the link's name. Rows always show the door line */
export function NightTile(p) {
  var row = p.layout === 'row',
    soldOut = p.crowd === 'full',
    price = p.price || null,
    label = [
      p.verdict && p.verdict.text,
      [p.name, p.venue, p.time, price || 'Price not listed', p.crowd && CROWD[p.crowd] ? CROWD[p.crowd].label : null]
        .filter(Boolean)
        .join(', ')
    ]
      .filter(Boolean)
      .join('. ');
  if (p.loading)
    return (
      <div className={cx('g-nt', row ? 'g-nt-row' : 'g-nt-tile', 'is-loading', p.className)} aria-hidden="true">
        <span className="g-nt-img g-nt-skel" />
        <span className="g-nt-body">
          <span className="g-nt-skel g-nt-bar" />
          <span className="g-nt-skel g-nt-bar" />
          <span className="g-nt-skel g-nt-bar is-short" />
        </span>
      </div>
    );
  function go(e) {
    if (p.onClick) p.onClick(e);
  }
  var Tag = p.href ? 'a' : 'div';
  var link = p.href
    ? { href: p.href, onClick: p.onClick }
    : {
        role: 'link',
        tabIndex: 0,
        onClick: go,
        onKeyDown: (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            go(e);
          }
        }
      };
  var badge =
    p.badge === 'Live' ? (
      <Badge tone="now" live>
        Live
      </Badge>
    ) : p.badge === 'Promoted' ? (
      <Badge tone="glass">Promoted</Badge>
    ) : null;
  var verdict = p.verdict ? (
    <DoorVerdict look="line" state={p.verdict.state} text={p.verdict.text} icon={p.verdict.icon} />
  ) : null;
  var priceEl = price ? <b className="g-nt-price">{price}</b> : <span className="g-nt-noprice">Price not listed</span>;
  return (
    <Tag
      {...link}
      className={cx('g-nt', row ? 'g-nt-row' : 'g-nt-tile', soldOut && 'is-soldout', p.className)}
      aria-label={label}
    >
      <Media image={p.image} neutral label={row ? null : 'Organiser image'} className="g-nt-img">
        {p.image ? <span className="g-grain g-nt-grain" aria-hidden="true" /> : null}
        {!row && badge ? <span className="g-nt-badge">{badge}</span> : null}
        {!row && p.crowd ? (
          <span className="g-nt-crowd">
            <CrowdMeter level={p.crowd} compact glass />
          </span>
        ) : null}
      </Media>
      {row ? (
        <>
          <span className="g-nt-body" aria-hidden="true">
            {verdict}
            <span className="g-nt-name">{p.name}</span>
            <span className="g-nt-meta">{[p.venue, p.distance, p.time].filter(Boolean).join(' · ')}</span>
          </span>
          <span className="g-nt-end" aria-hidden="true">
            {priceEl}
            {p.crowd ? <CrowdMeter level={p.crowd} compact /> : null}
          </span>
        </>
      ) : (
        <span className="g-nt-body" aria-hidden="true">
          <span className="g-nt-name">{p.name}</span>
          <span className="g-nt-foot">
            <span className="g-nt-meta">{[p.venue, p.time].filter(Boolean).join(' · ')}</span>
            {priceEl}
          </span>
          {p.verdict && p.verdict.state !== 'yes' ? verdict : null}
        </span>
      )}
    </Tag>
  );
}

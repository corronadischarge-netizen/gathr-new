import { Badge } from './Badge';
import { CrowdMeter } from './CrowdMeter';
import { FriendsGoing } from './FriendsGoing';
import { IconButton } from './IconButton';
import { Media } from './Media';
import { cx } from './utils';

export function VenueCard(p) {
  return (
    <article className={cx('g-card', 'g-venue', p.className)}>
      <Media image={p.image} neutral className="g-venue-media">
        <div className="g-venue-top">
          <div className="g-venue-badges">
            {p.live ? (
              <Badge tone="now" live>
                Live
              </Badge>
            ) : null}
            {p.badge ? <Badge tone="glass">{p.badge}</Badge> : null}
          </div>
          <IconButton icon="heart" label={p.saved ? 'Saved' : 'Save'} active={p.saved} className="g-save" />
        </div>
        {p.crowd ? <CrowdMeter level={p.crowd} glass compact /> : null}
      </Media>
      <div className="g-venue-body">
        <div className="g-venue-head">
          <h3 className="g-venue-name">{p.name}</h3>
          <span className="g-num g-muted">{p.distance}</span>
        </div>
        <p className="g-venue-meta">{[p.area, (p.vibes || []).join(', ')].filter(Boolean).join(' · ')}</p>
        <div className="g-venue-foot">
          {p.friends ? <FriendsGoing names={p.friends} total={p.friendsTotal} /> : <span />}
          <span className="g-num g-muted">{[p.doorTime, p.cover].filter(Boolean).join(' · ')}</span>
        </div>
      </div>
    </article>
  );
}

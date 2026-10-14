import { Badge } from './Badge';
import { CrowdMeter } from './CrowdMeter';
import { FriendsGoing } from './FriendsGoing';
import { Icon } from './Icon';
import { IconButton } from './IconButton';
import { Media } from './Media';
import { cx } from './utils';

export function VenueCard(p) {
  return (
    <article className={cx('g-card', 'g-venue', p.className)}>
      <Media image={p.image} neutral className="g-venue-media">
        {/* the gathr touch on organiser art: grain, and a fade into the card over the bottom 60% (imagery guide) */}
        {p.image ? <span className="g-grain" aria-hidden="true" /> : null}
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
      {/* three rows, each a left/right pair at one size: what + how much, where, who + when */}
      <div className="g-venue-body">
        <div className="g-venue-head">
          <h3 className="g-venue-name">{p.name}</h3>
          {p.cover ? <b className="g-price g-venue-cost">{p.cover}</b> : null}
        </div>
        <p className="g-venue-meta">{[p.area, p.distance, (p.vibes || []).join(', ')].filter(Boolean).join(' · ')}</p>
        <div className="g-venue-foot">
          {p.friends || p.friendsPeople ? (
            <FriendsGoing names={p.friends} people={p.friendsPeople} total={p.friendsTotal} />
          ) : (
            <span />
          )}
          {p.doorTime ? (
            <span className="g-venue-door">
              <Icon name="clock" size={16} />
              {p.doorTime}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

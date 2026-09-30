import { Bloom } from './Bloom';
import { Button } from './Button';
import { CrowdMeter } from './CrowdMeter';
import { Icon } from './Icon';
import { IconButton } from './IconButton';
import { Media } from './Media';
import { cx } from './utils';

export function VenueHero(p) {
  return (
    <section className={cx('g-vhero', p.occasion ? 'is-occasion' : 'is-image', p.className)}>
      {p.occasion ? (
        <Bloom recipe={p.recipe || 'peak'} at="center" />
      ) : (
        <Media image={p.image} neutral label="Venue photo" className="g-vhero-media" />
      )}
      {p.occasion ? null : <span className="g-vhero-fade" aria-hidden="true" />}
      <div className="g-vhero-top">
        <IconButton icon="arrow-left" label="Back" />
        <IconButton icon="heart" label="Save" active={p.saved} />
      </div>
      <div className="g-vhero-copy">
        <h1 className="g-vhero-name">
          {p.name}
          <span className="g-stop">.</span>
        </h1>
        <span className="g-vhero-chip">
          <Icon name="music-2" size={16} />
          {p.vibe || 'Hard techno'}
        </span>
        {p.crowd ? <CrowdMeter level={p.crowd} glass /> : null}
      </div>
      <div className="g-vhero-foot">
        <div className="g-vhero-meta">{[p.area, p.distance, p.doorTime].filter(Boolean).join(' · ')}</div>
        <Button variant="primary" size="lg" block icon="ticket">
          {p.action || 'Get on the list'}
        </Button>
      </div>
    </section>
  );
}

import { Bloom } from './Bloom';
import { Button } from './Button';
import { CrowdBlock } from './CrowdBlock';
import { TrustLine } from './CrowdMeter';
import { FactList } from './FactList';
import { IconButton } from './IconButton';
import { Media } from './Media';
import { cx } from './utils';

/* The venue screen's first view: photo (or an occasion bloom), the name, then one card with Booked so far on the
   left, up to four facts on the right and the trust line, and the one booking button at the bottom */
export function VenueHero(p) {
  var rows = [
    p.cover
      ? {
          icon: 'ticket',
          label: p.coverNote ? p.coverNote.charAt(0).toUpperCase() + p.coverNote.slice(1) : 'Cover',
          value: p.cover,
          strong: true
        }
      : null,
    p.doorTime
      ? {
          icon: 'clock',
          label: /^till\s/i.test(p.doorTime) ? 'Open till' : 'Open',
          value: p.doorTime.replace(/^till\s+/i, '')
        }
      : null,
    p.music ? { icon: 'music-2', label: 'Music', value: p.music } : null,
    p.distance ? { icon: 'map-pin', label: 'Distance', value: p.distance } : null
  ]
    .filter(Boolean)
    .slice(0, 4);
  return (
    <section className={cx('g-vh2', p.occasion ? 'is-occasion' : 'is-image', p.className)}>
      <div className="g-vh2-media">
        {p.occasion ? (
          <Bloom recipe={p.recipe || 'peak'} at="center" />
        ) : (
          <Media image={p.image} neutral label="Venue photo" />
        )}
        <span className="g-vh2-fade" aria-hidden="true" />
      </div>
      <div className="g-vh2-top">
        <IconButton icon="arrow-left" label="Back" />
        <IconButton icon="heart" label={p.saved ? 'Saved' : 'Save'} active={p.saved} />
      </div>
      <div className={cx('g-vh2-head', p.when && 'has-when')}>
        {/* app addition: when the night is on, the first thing read ("Tonight · Wed 14 Oct · 9 pm") */}
        {p.when ? <p className="g-vh2-when">{p.when}</p> : null}
        {/* venue names keep their own spelling; the yellow full stop is only for gathr's own occasions */}
        <h1 className="g-vh2-name">
          {p.name}
          {p.occasion ? <span className="g-stop">.</span> : null}
        </h1>
        <p className="g-vh2-sub">{[p.area, p.vibe].filter(Boolean).join(' · ')}</p>
      </div>
      <div className="g-vh2-card">
        <CrowdBlock booked={p.booked} cap={p.cap} level={p.crowd} />
        <FactList rows={rows} bare />
        <TrustLine cap={p.cap} updated={p.updated} />
      </div>
      <div className="g-vh2-cta">
        {/* when someone can't book, the button says why, with the lock icon (home v3 section 7) */}
        <Button
          variant={p.actionVariant || 'brand'}
          size="lg"
          block
          icon={p.actionDisabled ? 'lock' : 'ticket'}
          disabled={p.actionDisabled}
        >
          {p.action || 'Get passes'}
        </Button>
      </div>
    </section>
  );
}

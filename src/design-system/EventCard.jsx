import { Badge } from './Badge';
import { Media } from './Media';
import { cx } from './utils';

/* EventCard: an image-first card for carousels. The photo fades into black at the bottom (a scrim, not a bloom); copy and one light CTA sit inside. */
export function EventCard(p) {
  /* ctaSpan: the whole card is already tappable, so the CTA is a plain label rather than a nested button */
  var Cta = p.ctaSpan ? 'span' : 'button';
  return (
    <article className={cx('g-ecard', p.className)} style={p.style}>
      <Media image={p.image} neutral label="Organiser image · 4:5" className="g-ecard-media" />
      {/* the gathr touch: brand grain film + fade into night + a 1px light edge, over any organiser image */}
      {p.image ? <span className="g-grain g-ecard-grain" aria-hidden="true" /> : null}
      <span className="g-ecard-fade" aria-hidden="true" />
      {p.badge ? (
        <div className="g-ecard-top">
          <Badge tone={p.badgeTone || 'now'} live={p.live} className={p.badgeClass}>
            {p.badge}
          </Badge>
        </div>
      ) : null}
      <div className="g-ecard-copy">
        {p.kicker ? <span className="g-ecard-kicker">{p.kicker}</span> : null}
        <h3 className="g-ecard-title">{p.title}</h3>
        {p.meta ? <p className="g-ecard-meta">{p.meta}</p> : null}
        <Cta
          type={p.ctaSpan ? undefined : 'button'}
          className="g-ecard-cta"
          aria-hidden={p.ctaSpan ? 'true' : undefined}
        >
          {p.action || 'Get on the list'}
        </Cta>
      </div>
    </article>
  );
}

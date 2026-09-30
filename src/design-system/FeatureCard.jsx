import { Bloom } from './Bloom';
import { Icon } from './Icon';
import { Media } from './Media';
import { cx } from './utils';

export function FeatureCard(p) {
  /* Gradients are for occasions only: without occasion the card is image-led (the collection's lead image). */
  /* ctaSpan: the whole card is already tappable, so the CTA is a plain label rather than a nested button */
  var Cta = p.ctaSpan ? 'span' : 'button';
  return (
    <article
      className={cx('g-feature', p.occasion ? 'is-occasion' : 'is-image', p.className)}
      style={p.style}
    >
      {p.occasion ? (
        <Bloom recipe={p.recipe || 'sundowner'} at="center" />
      ) : (
        <Media image={p.image} neutral label="Collection image" className="g-feature-media" />
      )}
      <div className="g-feature-copy">
        {p.kicker ? (
          <span className="g-feature-kicker">
            <Icon name={p.kickerIcon || 'sparkles'} size={16} />
            {p.kicker}
          </span>
        ) : null}
        <h3 className="g-feature-title">{p.title}</h3>
        {p.body ? <p className="g-feature-body">{p.body}</p> : null}
        <Cta
          type={p.ctaSpan ? undefined : 'button'}
          className="g-feature-go"
          aria-hidden={p.ctaSpan ? 'true' : undefined}
        >
          <Icon name={p.actionIcon || 'arrow-right'} size={16} />
          {p.action || 'Open'}
        </Cta>
      </div>
    </article>
  );
}

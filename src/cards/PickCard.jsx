import { EVENTS } from '../data/listings';
import { FeatureCard } from '../design-system';
import { i3 } from '../ui/helpers';
import { Tap } from '../ui/Tap';

/* This week: the promoted pick of the fortnight */
export function PickCard(p) {
  var c = p.ctx;
  return (
    <div className="rel feature-wrap">
      <Tap onClick={() => c.openEvent('twin')} className="tap" aria-label="This week's pick">
        <FeatureCard
          image={EVENTS.twin.img}
          kicker="Pick of the fortnight · Fri 9 Oct"
          kickerIcon="sparkles"
          title="Twin Strings live at Epitome"
          action="See the night"
          ctaSpan
        />
      </Tap>
      {i3('vinyl', 92, 'feature-ic bob')}
      <span className="promo-tag on-feature">Promoted</span>
    </div>
  );
}

import { priceTxt } from '../data/format';
import { VENUES } from '../data/listings';
import { EventCard } from '../design-system';
import { i3 } from '../ui/helpers';
import { Tap } from '../ui/Tap';

export function WeekEventCard(p) {
  var c = p.ctx,
    e = p.e,
    v = VENUES[e.venue];
  var badge = e.rsvp
    ? ['Free', 'go']
    : e.nFriends >= 2
      ? [e.nFriends + ' friends', 'people']
      : e.age
        ? [e.age + '+', 'neutral']
        : null;
  return (
    <Tap
      onClick={(ev) =>
        c.openEvent(e.id, ev.target.closest && ev.target.closest('.g-ecard-cta') ? 'list' : null)
      }
      className={'tap card-slot hue-' + v.hue}
      aria-label={e.title + ', ' + v.name + ', ' + e.date + ' ' + e.time + ', ' + priceTxt(e)}
    >
      <EventCard
        image={e.img}
        badge={badge && badge[0]}
        badgeTone={badge && badge[1]}
        kicker={v.name + ' · ' + e.time}
        title={e.title}
        meta={e.genre + ' · ' + priceTxt(e)}
        action={e.rsvp ? 'RSVP' : e.src === 'district' ? 'Get tickets' : 'Get on the list'}
        ctaSpan
      />
      <span className="card-sticker">{i3(v.ic, 52)}</span>
    </Tap>
  );
}

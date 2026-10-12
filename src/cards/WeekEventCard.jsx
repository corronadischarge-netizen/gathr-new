import { bookLabel, priceTxt } from '../data/format';
import { VENUES } from '../data/listings';
import { EventCard, Icon } from '../design-system';
import { i3 } from '../ui/helpers';
import { Tap } from '../ui/Tap';

export function WeekEventCard(p) {
  var c = p.ctx,
    e = p.e,
    v = VENUES[e.venue];
  // one badge at most: Free and friends going are glass labels on the photo; an age limit is red (red = limits)
  var badge = e.rsvp
    ? [
        <>
          <Icon name="ticket" size={16} />
          Free
        </>,
        'glass'
      ]
    : e.nFriends >= 2
      ? [
          <>
            <Icon name="users" size={16} />
            {e.nFriends + ' friends'}
          </>,
          'glass'
        ]
      : e.age
        ? [e.age + '+', 'limit']
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
        action={bookLabel(e)}
        ctaSpan
      />
      <span className="card-sticker">{i3(v.ic, 52)}</span>
    </Tap>
  );
}

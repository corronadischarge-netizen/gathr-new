import { priceTxt } from '../data/format';
import { VENUES } from '../data/listings';
import { EventCard, Icon } from '../design-system';
import { i3 } from '../ui/helpers';
import { Tap } from '../ui/Tap';

export function WeekEventCard(p) {
  var c = p.ctx,
    e = p.e,
    v = VENUES[e.venue];
  // the label on the card: Free (green ticket) and friends going (blue) stand out; age is quiet
  var badge = e.rsvp
    ? [
        <>
          <Icon name="ticket" size={14} />
          Free
        </>,
        'quiet',
        'tag-free'
      ]
    : e.nFriends >= 2
      ? [
          <>
            <Icon name="users" size={14} />
            {e.nFriends + ' friends going'}
          </>,
          'quiet',
          'tag-going'
        ]
      : e.age
        ? [e.age + '+', 'quiet']
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
        badgeClass={badge && badge[2]}
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

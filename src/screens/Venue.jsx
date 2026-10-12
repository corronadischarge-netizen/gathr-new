import { blockedFor, bookLabel, priceTxt, rupees } from '../data/format';
import { EVENTS, upcoming } from '../data/listings';
import { FactList, TonightSoFar, VenueHero } from '../design-system';
import { btnLabel, icon, meta, thumb } from '../ui/helpers';
import { Tap } from '../ui/Tap';

const cap1 = (x) => x.charAt(0).toUpperCase() + x.slice(1);

/* what the night costs, short enough for the hero's fact column */
function cover(e) {
  if (e.rsvp) return { cover: 'Free', coverNote: 'RSVP' };
  if (e.price == null) return {};
  return e.door ? { cover: rupees(e.price), coverNote: 'at the door' } : { cover: rupees(e.price) };
}

export function Venue(p) {
  var c = p.ctx,
    S = c.S,
    e = c.ev,
    v = c.ven,
    saved = !!S.saved[e.id],
    blocked = blockedFor(e, S.age);
  var evs = upcoming()
    .filter((k) => EVENTS[k].venue === v.id)
    .map((k) => EVENTS[k]);
  var genres = (e.genre || '')
    .split(',')
    .map((x) => cap1(x.trim()))
    .filter(Boolean);
  // the one booking button
  var action = blocked
    ? e.age + '+ only'
    : bookLabel(e);
  return (
    <div className="col" style={{ paddingBottom: '48px' }}>
      <div
        onClick={(ev) => {
          var l = btnLabel(ev);
          if (l === 'Back') c.back();
          else if (l === 'Save' || l === 'Saved') c.toggleSave(e.id);
          else if (l === action) c.book();
        }}
      >
        <VenueHero
          name={v.name}
          area={v.area}
          vibe={e.title + ' · sample bookings'}
          booked={v.booked}
          cap={v.cap}
          crowd={v.crowd}
          {...cover(e)}
          doorTime={e.end ? 'Till ' + e.end : null}
          music={genres[0]}
          action={action}
          actionDisabled={blocked}
          saved={saved}
        />
      </div>
      <div className="px col" style={{ paddingTop: '24px', gap: '16px' }}>
        <TonightSoFar
          booked={v.booked}
          saved={v.saved}
          lastHour={v.lastHour}
          friends={e.friends && e.friends.length ? e.friends : null}
          friendsTotal={e.nFriends}
        />
        <FactList
          title="The room"
          rows={[
            { icon: 'zap', label: 'Vibe', value: v.vibe || 'Not listed' },
            { icon: 'music-2', label: 'Music', value: genres.slice(0, 2).join(', ') || 'Not listed' },
            { icon: 'shirt', label: 'Dress code', value: e.dress || 'Not listed' },
            { icon: 'id-card', label: 'Entry', value: e.allAges ? 'All ages' : (e.age || 18) + '+, ID at the door' }
          ]}
          note="Vibe is how the place feels. How full it gets is in Booked so far"
        />
        {meta(
          'How we count: Booked so far is bookings on gathr against tonight’s cap, verified by gathr. Walk-ins aren’t counted, so the room can feel a little fuller'
        )}
        <div className="rowc between">
          {meta('Venue photo and bookings not live yet')}
          <button type="button" className="link-btn" onClick={() => c.set({ sheet: 'rules' })}>
            Who gets in{icon('chevron-right', 16)}
          </button>
        </div>
        <div className="col" style={{ gap: '4px' }}>
          <span className="g-section-title">Listed nights</span>
          {evs.map((x) => (
            <Tap
              onClick={() => c.openEvent(x.id)}
              key={x.id}
              className="tap rowc"
              style={{ gap: '12px', minHeight: '72px' }}
              aria-label={x.title}
            >
              {thumb(x, 64)}
              <div className="col" style={{ gap: '2px', flexGrow: 1 }}>
                <span className="title16">{x.title}</span>
                {meta(x.date + ' · ' + x.time + ' · ' + priceTxt(x))}
              </div>
              {icon('chevron-right')}
            </Tap>
          ))}
        </div>
      </div>
    </div>
  );
}

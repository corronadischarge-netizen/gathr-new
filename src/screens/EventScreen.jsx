import { useEffect, useRef, useState } from 'react';
import { APP_URL } from '../config';
import { agePhrase, groupLabel, isSet } from '../data/group';
import { doorOf } from '../data/doorRules';
import { groupFor, homeItems, tryInstead } from '../data/homeData';
import { rupees } from '../data/format';
import { ActionBar, DoorVerdict, Icon, TonightSoFar, TopBar, VenueHero } from '../design-system';
import { now } from '../lib/clock';
import { doorRows, getDoorVerdict, verdictSource, verdictText } from '../lib/door';
import { log } from '../lib/log';
import { shareToast } from '../lib/utils';
import { Share } from '../services/share';
import { btnLabel, icon } from '../ui/helpers';
import { soundOf } from './HomeDoor';

/* The event page (home v3 section 7, board 03): VenueHero with the night's name, Booked so far, cover, time and
   distance, and the one booking button for the group; then Who gets in, Tonight so far and How we count */

/* what the night costs, short enough for the hero's fact column */
function cover(e) {
  if (e.rsvp) return { cover: 'Free', coverNote: 'RSVP' };
  if (e.price == null) return {};
  return e.door ? { cover: rupees(e.price), coverNote: 'at the door' } : { cover: rupees(e.price) };
}

/* the booking button for this group: "Get 4 passes", "Get on the list · 4", "Get on the list" */
function action(e, n) {
  if (e.rsvp) return 'Get on the list · ' + n;
  if (e.door) return 'Get on the list';
  return 'Get ' + n + (n === 1 ? ' pass' : ' passes');
}

export function EventScreen(p) {
  var c = p.ctx,
    S = c.S,
    e = c.ev,
    v = c.ven,
    t = now(),
    saved = !!S.saved[e.id],
    group = groupFor(S, t),
    door = doorOf(e),
    verdict = getDoorVerdict(door, group, S.age, t),
    vt = verdictText(verdict, group, 'pill'),
    onThis = S.planned === e.id,
    no = verdict.state === 'no',
    cap = door.maxPasses || 6,
    n = Math.min(isSet(group) ? group.size : 1, cap),
    it = homeItems(S, t).filter((x) => x.id === e.id)[0];
  var label = onThis ? 'Show my pass' : no ? verdict.reasons[0] : action(e, n);

  function book() {
    c.set({ guests: n, sheet: e.age >= 21 && !S.age ? 'age' : 'list', after: 'list' });
  }
  /* Ask the venue (spec 6.4): WhatsApp with the question written for you; to the venue's own number when we
     have one, otherwise WhatsApp asks who to send it to */
  function ask() {
    log('verdict_ask_venue', { nightId: e.id });
    var msg = 'Hi, is stag entry allowed tonight at ' + v.name + '? Asking via gathr';
    if (v.whatsapp || v.phone) Share.whatsappTo(String(v.whatsapp || v.phone).replace(/D/g, '').slice(-10), msg);
    else Share.whatsapp(msg);
  }
  function main() {
    if (no && !onThis) return;
    onThis ? c.go('pass') : book();
  }

  // not for this group: point to the best night that lets them in, that day or the next
  var tryNight = no ? tryInstead(S, e, t) : null;

  /* the top bar: clear over the photo; once the photo has scrolled under it, a glass bar fades in (spec 3, 6.4) */
  var root = useRef(null),
    bar = useRef(null);
  const [glass, setGlass] = useState(false);
  const [pinned, setPinned] = useState(false);
  useEffect(() => {
    var scr = root.current && root.current.closest('.screen');
    if (!scr) return;
    var media = root.current.querySelector('.g-vh2-media'),
      cta = root.current.querySelector('.g-vh2-cta');
    var onScroll = () => {
      var y = scr.scrollTop;
      setGlass(y > 280); // the photo is 380 tall; its buttons sit 52 to 100 from the top
      // the photo stays put while the card scrolls over it (no parallax, no zoom), then leaves with the page
      if (media) media.style.transform = y > 0 ? 'translateY(' + Math.min(y, media.offsetHeight) + 'px)' : '';
      // once the hero's own button has scrolled under the top bar, the same button pins to the bottom
      if (cta) setPinned(y > cta.offsetTop + cta.offsetHeight - 100);
    };
    onScroll();
    scr.addEventListener('scroll', onScroll, { passive: true });
    return () => scr.removeEventListener('scroll', onScroll);
  }, []);
  var pin = useRef(null);
  useEffect(() => {
    if (bar.current) bar.current.inert = !glass; // hidden: can't be tapped or focused
    if (pin.current) pin.current.inert = !pinned;
  }, [glass, pinned]);

  return (
    <div className="col ev3" ref={root}>
      <div className="ev3-bar-slot">
        <div ref={bar} className={'ev3-bar' + (glass ? ' is-on' : '')} aria-hidden={glass ? undefined : 'true'}>
          <TopBar
            glass
            back
            onBack={c.back}
            title={e.title}
            actions={[['heart', saved ? 'Saved' : 'Save', () => c.toggleSave(e.id), false, saved]]}
          />
        </div>
      </div>
      <div
        onClick={(ev) => {
          var l = btnLabel(ev);
          if (l === 'Back') c.back();
          else if (l === 'Save' || l === 'Saved') c.toggleSave(e.id);
          else if (l === label) main();
        }}
      >
        <VenueHero
          name={e.title}
          image={e.img}
          area={v.name + ', ' + v.area}
          vibe={soundOf(e)}
          booked={v.booked}
          cap={v.cap}
          {...cover(e)}
          doorTime={e.time}
          distance={it && it.mins != null ? it.mins + ' min' : undefined}
          action={label}
          actionVariant={onThis ? 'primary' : 'brand'}
          actionDisabled={no && !onThis}
          saved={saved}
        />
      </div>

      <div className="px col ev3-body">
        {tryNight ? (
          <button type="button" className="ev3-try" onClick={() => c.openEvent(tryNight.id)}>
            <span>
              Not for your group? Try <b>{tryNight.title}</b>
            </span>
            {icon('chevron-right', 20)}
          </button>
        ) : null}

        <section className="col ev3-door" aria-label="Who gets in">
          <h2 className="g-section-title" style={{ margin: 0 }}>
            Who gets in
          </h2>
          <div className="ev3-card">
            <DoorVerdict
              look="pill"
              state={vt.state}
              text={vt.text}
              icon={vt.icon}
              source={verdictSource(verdict)}
              onAsk={verdict.state === 'unknown' && !verdict.plain ? ask : undefined}
            />
            <ul className="ev3-rules">
              {doorRows(door, t).map((r) => (
                <li key={r[0]}>
                  <Icon name={r[0]} size={20} />
                  <span>{r[1]}</span>
                </li>
              ))}
            </ul>
            <button type="button" className="ev3-going" onClick={() => c.set({ sheet: 'goingas', gaFrom: 'event' })}>
              <span>{'Going as ' + groupLabel(group) + ' · ' + agePhrase(group, S.age)}</span>
              {icon('chevron-right', 20)}
            </button>
          </div>
        </section>

        <TonightSoFar
          booked={v.booked}
          saved={v.saved}
          lastHour={v.lastHour}
          friends={e.friends && e.friends.length ? e.friends : null}
          friendsTotal={e.nFriends}
        />
        <p className="meta" style={{ margin: 0 }}>
          How we count: Booked so far is bookings on gathr against tonight's cap, verified by gathr. Walk-ins aren't
          counted, so the room can feel a little fuller
        </p>

        {/* the rest of what the old event page offered, one tap each */}
        <div className="ev3-more">
          <button type="button" className="rule-link" onClick={() => c.set({ sheet: 'poster' })}>
            {icon('image', 20)}
            <span>See the full poster</span>
          </button>
          {e.nFriends ? (
            <button type="button" className="rule-link" onClick={() => c.set({ sheet: 'friends' })}>
              {icon('users', 20)}
              <span>Friends going</span>
            </button>
          ) : null}
          <button
            type="button"
            className="rule-link"
            onClick={() =>
              c.go('newplan', {
                draft: { opts: [e.id], deadline: 'Thu 6 pm', name: e.day === 'fri' ? 'Friday plan' : 'Night out' }
              })
            }
          >
            {icon('calendar-plus', 20)}
            <span>Plan it with friends</span>
          </button>
          <button
            type="button"
            className="rule-link"
            onClick={() =>
              Share.link(e.title, e.title + ' · ' + v.name + ' · ' + e.date + ' ' + e.time + ' on gathr', APP_URL + '#e=' + e.id).then(
                (r) => {
                  var x = shareToast(r, 'Link');
                  if (x) c.toast(x);
                },
                () => c.toast('Couldn’t share. Try again')
              )
            }
          >
            {icon('share', 20)}
            <span>Share this night</span>
          </button>
          <button type="button" className="rule-link" onClick={() => c.go('venue')}>
            {icon('map-pin', 20)}
            <span>{v.name}</span>
          </button>
          <button type="button" className="rule-link" onClick={() => Share.directions(v)}>
            {icon('navigation', 20)}
            <span>{'Directions to ' + v.name}</span>
          </button>
          {e.org && e.host ? (
            <button type="button" className="rule-link" onClick={() => c.set({ sheet: 'report' })}>
              {icon('triangle-alert', 20)}
              <span>Report this night</span>
            </button>
          ) : null}
        </div>
        <span className="home-sample">Sample data</span>
      </div>
      {/* the booking button, pinned once the hero's has scrolled away, over the functional fade */}
      <div ref={pin} className={'ev3-pin' + (pinned ? ' is-on' : '')} aria-hidden={pinned ? undefined : 'true'}>
        <ActionBar
          main={{
            label: label,
            variant: onThis ? 'primary' : 'brand',
            icon: no && !onThis ? 'lock' : 'ticket',
            disabled: no && !onThis,
            onClick: main
          }}
        />
      </div>
    </div>
  );
}

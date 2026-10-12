import { useEffect, useRef } from 'react';
import { IMAGES_3D } from '../assets/images';
import { TEST } from '../config';
import { MO, WD } from '../data/dates';
import { agePhrase, currentGroup, groupFromPlan, groupLabel, isSet } from '../data/group';
import { homeItems } from '../data/homeData';
import { EVENTS, VENUES } from '../data/listings';
import { gpVoted } from '../data/sample';
import {
  Button,
  DoorVerdict,
  GroupPill,
  MoodTile,
  NightRail,
  NightTile,
  Sticker,
  Stop,
  TopBar,
  VenueCard
} from '../design-system';
import { addDays, homeWindow, now, weekdayOf } from '../lib/clock';
import { verdictSource, verdictText } from '../lib/door';
import { heroPick, railFor, weekRails } from '../lib/homeRank';
import { log } from '../lib/log';
import { remoteOn } from '../services/remote';
import { btnLabel } from '../ui/helpers';
import { Tap } from '../ui/Tap';

/* Home v3, built around the door (specs/home-door-first.md, section 3): who's going, the one night we're most
   confident about for the group with its booking button, day rails of small tiles, sounds, and an end card.
   ?home=classic shows the previous home */

/* sounds for "Not feeling these?": the night tag, its name and its sticker (object stickers only) */
export const SOUNDS = [
  ['bollywood', 'Bollywood', 'disco-ball'],
  ['live', 'Live gigs', 'mic'],
  ['commercial', 'Commercial', 'speaker'],
  ['edm', 'Electronic', 'headphones'],
  ['hiphop', 'Hip-hop', 'boombox'],
  ['retro', 'Retro', 'spotlight'],
  ['themed', 'Theme parties', 'spotlight'],
  ['ladies', 'Ladies nights', 'spotlight']
];

function dayName(day) {
  return WD[weekdayOf(day)];
}

/* "Fri 16 Oct" */
function shortDate(day) {
  var d = new Date(day + 'T00:00:00Z');
  return WD[d.getUTCDay()].slice(0, 3) + ' ' + d.getUTCDate() + ' ' + MO[d.getUTCMonth()];
}

export function priceLabel(e) {
  if (e.rsvp || e.price === 0) return 'Free';
  if (e.price == null) return null;
  return '₹' + e.price.toLocaleString('en-IN');
}

export function soundOf(e) {
  var s = SOUNDS.filter((x) => (e.tags || []).indexOf(x[0]) >= 0)[0];
  return s ? s[1] : (e.genre || '').split(/[,·]/)[0].trim();
}

/* the hero's button (section 8): "Get 4 passes · ₹2,400", "Get on the list · 4", "Get on the list" */
function bookLabel(e, n) {
  if (e.rsvp) return 'Get on the list · ' + n;
  if (e.door) return 'Get on the list';
  var passes = 'Get ' + n + (n === 1 ? ' pass' : ' passes');
  return e.price ? passes + ' · ₹' + (e.price * n).toLocaleString('en-IN') : passes;
}

/* GroupPill: the active plan when there is one, otherwise who you're going as */
function groupPill(c, group) {
  var S = c.S,
    gp = S.groupOff ? null : S.gp,
    faces = gp ? gp.members.map((n) => ({ name: n })) : [];
  if (gp && gp.stage === 'booked' && EVENTS[gp.booked]) {
    var b = EVENTS[gp.booked];
    return {
      state: 'plan-booked',
      people: faces,
      title: WD[new Date(b.iso).getDay()] + ' · ' + b.title,
      line: "You're in · Show pass",
      onOpen: () => c.go('pass')
    };
  }
  if (gp && gp.stage === 'voting') {
    var pg = groupFromPlan(gp);
    return {
      state: 'plan-vote',
      people: faces,
      title: gp.name + ' · ' + groupLabel(pg) + ', ' + agePhrase(pg, S.age),
      line: Object.keys(gpVoted(gp, S.vote)).length + ' of ' + (gp.members.length + 1) + ' voted · closes ' + gp.deadline,
      onOpen: () => c.go('group')
    };
  }
  if (isSet(group))
    return {
      state: 'group-set',
      people: [{ name: S.me.name || 'You', image: S.me.photo }],
      title: 'Going as ' + groupLabel(group) + ', ' + agePhrase(group, S.age),
      onOpen: () => c.set({ sheet: 'goingas', gaFrom: 'home' })
    };
  return {
    state: 'group-unset',
    title: "Who's going?",
    line: 'Add your group to check the door',
    onOpen: () => c.set({ sheet: 'goingas', gaFrom: 'home' })
  };
}

export function HomeDoor(p) {
  var c = p.ctx,
    S = c.S,
    t = now(),
    w = homeWindow(t),
    group = currentGroup(S),
    items = homeItems(S, t),
    allNights = (day, sound) => c.go('allnights', { anDay: day || null, anFilters: sound ? { sound: sound } : {} });
  var on = (day) => items.filter((it) => it.day === day && !it.over);
  // the live feed is still on its way (Supabase on, online, not failed), or ?loading
  var loading = TEST.loading || (remoteOn && !S.feedAt && !S.feedFailed && navigator.onLine);

  // the hero: tonight's best for the group; with nothing on tonight at all, tomorrow's
  var heroDay = on(w.day).length ? w.day : addDays(w.day, 1),
    heroWhen = heroDay === w.day ? w.when : 'tomorrow',
    hero = heroPick(items, heroDay),
    heroIt = hero && items.filter((it) => it.id === hero.id)[0],
    heroE = hero && EVENTS[hero.id],
    // nights are on, but none lets this group in
    misfits = hero ? [] : on(heroDay).filter((it) => it.verdict.state !== 'yes' && it.verdict.state !== 'if');

  // the week: tonight and the next 6 days
  var week = [];
  for (var i = 0; i < 7; i++) week = week.concat(on(addDays(w.day, i)));

  // logging (section 10): the home once, the hero whenever it changes; Going as cross-fades the home (200 ms)
  var sig = JSON.stringify(group || null),
    lastSig = useRef(sig),
    swapped = lastSig.current !== sig;
  lastSig.current = sig;
  useEffect(() => {
    log('home_view', { layout: 'door-first' });
  }, []);
  useEffect(() => {
    if (hero) log('hero_view', { nightId: hero.id, score: hero.score, verdict: heroIt.verdict.state });
  }, [hero && hero.id, sig]);

  var unread =
    (S.inbox || []).filter((n) => !n.read_at && n.kind !== 'guest_list').length +
    (S.myGuestLists || []).filter((g) => (S.glSeen || []).indexOf(g.entryId) < 0).length;
  var top = (
    <TopBar
      avatar={S.me.name || 'You'}
      avatarImage={S.me.photo}
      onAvatar={() => c.tab('you')}
      title={'Pune · ' + shortDate(w.day)}
      actions={[
        ['search', 'Search', () => c.tab('search')],
        [
          'bell',
          !S.notifSeen ? (unread ? 'Updates, ' + unread + ' new' : 'Updates, new') : 'Updates',
          () => c.go('notifs', { notifSeen: true, glSeen: (S.myGuestLists || []).map((g) => g.entryId) }),
          !S.notifSeen
        ]
      ]}
    />
  );

  // loading: the pill, the hero card and two rails as skeletons. No spinners
  if (loading)
    return (
      <div className="col home-door" aria-busy="true" aria-label="Loading tonight's nights">
        {top}
        <div className="px home-pill">
          <div className="home-skel home-skel-pill" />
        </div>
        <div className="px col home-hero">
          <div className="home-skel home-skel-line" />
          <div className="home-skel home-skel-card" />
          <div className="home-skel home-skel-btn" />
        </div>
        <div className="col home-rails">
          {[0, 1].map((k) => (
            <div key={k} className="col" style={{ gap: 'var(--space-3)' }}>
              <div className="px">
                <div className="home-skel home-skel-line" />
              </div>
              <div className="home-skel-row">
                <NightTile loading />
                <NightTile loading />
                <NightTile loading />
              </div>
            </div>
          ))}
        </div>
      </div>
    );

  function tile(railId) {
    return (it, index) => {
      var e = EVENTS[it.id];
      return (
        <NightTile
          key={it.id}
          image={e.img}
          name={e.title}
          venue={(VENUES[e.venue] || {}).name}
          time={e.time}
          price={priceLabel(e)}
          crowd={it.crowd || undefined}
          verdict={verdictText(it.verdict, group, 'line')}
          badge={e.promoted ? 'Promoted' : undefined}
          onClick={() => {
            log('tile_tap', { railId: railId, index: index, nightId: it.id, verdict: it.verdict.state });
            c.openEvent(it.id);
          }}
        />
      );
    };
  }

  /* rails: the window's day, the next, then the rest of the week (at most 5 after tomorrow), then next week */
  function rail(r, title, seeAll) {
    var got = railFor(items, r, hero && hero.id);
    if (!got.tiles.length) return null;
    return (
      <NightRail
        key={r.key}
        title={title(got)}
        seeAllLabel={seeAll(got)}
        onSeeAll={() => {
          log('rail_see_all', { railId: r.key });
          allNights(r.days[0]);
        }}
        onView={() => log('rail_view', { railId: r.key })}
        onScroll={(maxIndex) => log('rail_scroll', { railId: r.key, maxIndex: maxIndex })}
        total={got.more || undefined}
      >
        {got.tiles.map(tile(r.key))}
      </NightRail>
    );
  }
  var rails = weekRails(w.day),
    allOn = (r) => r.days.reduce((n, d) => n + on(d).length, 0),
    first = w.when === 'tonight' ? 'Tonight' : 'Tomorrow · ' + shortDate(w.day).slice(0, 3);
  var r0 = rail(rails[0], (g) => (w.when === 'tonight' ? 'Tonight · ' + g.total + ' more' : first), () => 'See all'),
    r1 = rail(
      rails[1],
      () => (w.when === 'tonight' ? 'Tomorrow · ' + dayName(rails[1].days[0]).slice(0, 3) : dayName(rails[1].days[0])),
      () => 'See all ' + allOn(rails[1])
    ),
    rest = rails
      .slice(2)
      .map((r) =>
        rail(
          r,
          () => (r.key === 'next' ? 'Next week' : dayName(r.days[0])),
          () => 'See all ' + allOn(r)
        )
      )
      .filter(Boolean)
      .slice(0, 5);

  var fits = week.filter((it) => it.verdict.state === 'yes' || it.verdict.state === 'if').length;
  var sounds = SOUNDS.map((s) => [s, week.filter((it) => (EVENTS[it.id].tags || []).indexOf(s[0]) >= 0).length])
    .filter((x) => x[1] > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  var pill = groupPill(c, group),
    n = isSet(group) ? group.size : 1,
    hv = heroIt && verdictText(heroIt.verdict, group, 'pill'),
    hsrc = heroIt && verdictSource(heroIt.verdict),
    hven = heroE && VENUES[heroE.venue];

  return (
    <div className="col home-door">
      {top}

      <div className="px home-pill">
        <GroupPill {...pill} />
      </div>

      <div key={sig} className={'col' + (swapped ? ' home-swap' : '')}>
        {!week.length ? (
          // the whole week is empty (copy library)
          <div className="px home-hero">
            <div className="home-card">
              <h2 className="home-card-title">Quiet week. Try another area</h2>
              <Button variant="primary" onClick={() => c.go('areas')}>
                Change area
              </Button>
            </div>
          </div>
        ) : hero ? (
          <section className="px col home-hero" aria-label={'Best for your group ' + heroWhen}>
            <div className="rowc between">
              <h2 className="g-section-title home-title">{'Best for your group ' + heroWhen}</h2>
              {heroIt.sample ? <span className="home-sample">Sample data</span> : null}
            </div>
            <DoorVerdict
              look="pill"
              state={hv.state}
              text={hv.text}
              icon={hv.icon}
              // the hero's line is tight: "Checked by gathr" without the date
              source={hsrc && { kind: hsrc.kind, count: hsrc.count }}
            />
            <Tap
              onClick={(ev) => {
                // the card's heart saves; anywhere else opens the night
                var l = btnLabel(ev);
                if (l === 'Save' || l === 'Saved') c.toggleSave(hero.id);
                else c.openEvent(hero.id);
              }}
              aria-label={heroE.title + ', ' + hven.name}
            >
              <VenueCard
                name={heroE.title}
                area={hven.name + ', ' + hven.area}
                distance={heroIt.mins != null ? heroIt.mins + ' min' : undefined}
                vibes={[soundOf(heroE)].filter(Boolean)}
                crowd={heroIt.crowd || undefined}
                cover={priceLabel(heroE) || undefined}
                doorTime={heroE.time}
                image={heroE.img}
                friendsPeople={heroE.nFriends ? (heroE.friends || []).map((f) => ({ name: f })) : undefined}
                friendsTotal={heroE.nFriends || undefined}
                saved={!!S.saved[hero.id]}
              />
            </Tap>
            <Button
              variant="brand"
              size="lg"
              block
              icon="ticket"
              onClick={() => {
                log('hero_cta_tap', { nightId: hero.id, passes: Math.min(n, 6) });
                c.set({
                  cur: hero.id,
                  guests: Math.min(n, 6),
                  sheet: heroE.age >= 21 && !S.age ? 'age' : 'list',
                  after: 'list'
                });
              }}
            >
              {bookLabel(heroE, n)}
            </Button>
          </section>
        ) : misfits.length ? (
          // nights are on tonight, but none lets this group in
          <div className="px home-hero">
            <div className="home-card">
              <h2 className="home-card-title">
                {'Nothing ' + (heroWhen === 'tonight' ? 'tonight' : 'tomorrow') + ' lets your group in'}
              </h2>
              <p className="home-card-line">
                {misfits.length + ' ' + (heroWhen === 'tonight' ? 'tonight' : 'tomorrow') + " have rules that don't fit"}
              </p>
              <div className="rowc" style={{ gap: 'var(--space-2)', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Button variant="primary" onClick={() => allNights(addDays(heroDay, 1))}>
                  See tomorrow
                </Button>
                <Button variant="subtle" onClick={() => c.set({ sheet: 'goingas', gaFrom: 'home' })}>
                  Change group
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="col home-rails">
          {r0}
          {r1}
        </div>

        {sounds.length ? (
          <section className="col home-sounds" aria-label="Not feeling these?">
            <div className="px col" style={{ gap: '2px' }}>
              <h2 className="g-section-title home-title">Not feeling these?</h2>
              <p className="meta" style={{ margin: 0 }}>
                Pick a sound, see the week
              </p>
            </div>
            <div className="home-moods">
              {sounds.map((x) => (
                <MoodTile
                  key={x[0][0]}
                  kicker="I'm feeling"
                  title={x[0][1]}
                  sticker={IMAGES_3D[x[0][2]]}
                  stickerSize={64}
                  action={x[1] + ' this week'}
                  className="home-mood"
                  onClick={() => {
                    log('mood_tap', { sound: x[0][0] });
                    allNights(null, x[0][0]);
                  }}
                />
              ))}
            </div>
          </section>
        ) : null}

        {rest.length ? <div className="col home-rails home-rest">{rest}</div> : null}

        {week.length ? (
          <div className="px">
            <section className="home-end">
              <Sticker src={IMAGES_3D['disco-ball']} size={96} tilt={-8} bob />
              <h2 className="home-end-title">
                {week.length + (week.length === 1 ? ' night this week' : ' nights this week')}
                <Stop />
              </h2>
              <p className="home-end-line">{isSet(group) ? fits + ' let your group in' : week.length + ' nights on'}</p>
              <Button
                variant="primary"
                iconRight="arrow-right"
                onClick={() => {
                  log('end_card_tap');
                  allNights();
                }}
              >
                See them all
              </Button>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}

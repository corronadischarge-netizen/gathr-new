import { useRef } from 'react';
import { BookedStrip } from '../cards/BookedStrip';
import { GroupPlanCard } from '../cards/GroupPlanCard';
import { HostCtaCard } from '../cards/HostCtaCard';
import { NoMatchCard } from '../cards/NoMatchCard';
import { PickCard } from '../cards/PickCard';
import { TuneWeekCard } from '../cards/TuneWeekCard';
import { WeekEventCard } from '../cards/WeekEventCard';
import { dayOf, todayTxt } from '../data/dates';
import { blockedFor } from '../data/format';
import { EVENTS, upcoming } from '../data/listings';
import { FILTERS } from '../data/options';
import { IconButton } from '../design-system';
import { eyebrow, i3, icon, meAvatar, meta, stop, svgIcon } from '../ui/helpers';
import { Tap } from '../ui/Tap';

function visible(S, e) {
  if (blockedFor(e, S.age)) return false;
  if (S.filter === 'all') return true;
  if (S.filter === 'friends') return e.nFriends > 0;
  return e.tags.indexOf(S.filter) >= 0;
}

export function Tonight(p) {
  var c = p.ctx,
    S = c.S;
  var up = upcoming(),
    groups = [];
  up.filter((k) => visible(S, EVENTS[k])).forEach((k) => {
    var d = dayOf(EVENTS[k]),
      g = groups.filter((x) => x[0][0] === d[0])[0];
    if (g) g[1].push(k);
    else groups.push([d, [k]]);
  });
  // picking a mood: the nights below cross-fade to the new list (not on first show)
  var lastFilter = useRef({ f: S.filter, at: 0 });
  if (lastFilter.current.f !== S.filter) lastFilter.current = { f: S.filter, at: Date.now() };
  var swapped = Date.now() - lastFilter.current.at < 400;
  // the bell: how many updates you haven't opened (unread notifications and guest lists you haven't seen)
  var unread =
    (S.inbox || []).filter((n) => !n.read_at && n.kind !== 'guest_list').length +
    (S.myGuestLists || []).filter((g) => (S.glSeen || []).indexOf(g.entryId) < 0).length;
  var fresh = !S.notifSeen;
  return (
    <div className="col" style={{ paddingTop: '48px', paddingBottom: '140px' }}>
      <div className="rowc between px">
        <div className="rowc">
          <Tap onClick={() => c.tab('you')} aria-label="You" className="tap">
            {meAvatar(S, 48)}
          </Tap>
          <button
            type="button"
            className="city-chip"
            aria-label="City: Pune. See other cities"
            onClick={() => c.set({ sheet: 'city' })}
          >
            {icon('map-pin', 16)}
            Pune
            {svgIcon(['M6 9l6 6 6-6'], 16)}
          </button>
        </div>
        <div className="rowc" style={{ gap: '8px' }}>
          <IconButton icon="search" label="Search" onClick={() => c.tab('search')} />
          <span className={'bell' + (fresh ? ' is-new' : '')}>
            <IconButton
              icon="bell"
              label={!fresh ? 'Updates' : unread ? 'Updates, ' + unread + ' new' : 'Updates, new'}
              onClick={() =>
                c.go('notifs', { notifSeen: true, glSeen: (S.myGuestLists || []).map((g) => g.entryId) })
              }
            />
            {fresh ? (
              <i key={unread} className={'bell-count' + (unread ? '' : ' is-dot')} aria-hidden>
                {unread ? (unread > 9 ? '9+' : unread) : null}
              </i>
            ) : null}
          </span>
        </div>
      </div>
      <div className="px" style={{ paddingTop: '12px' }}>
        {eyebrow(todayTxt())}
        {stop('this week in pune', 'sm')}
        <p className="meta" style={{ margin: '6px 0 0' }}>
          {up.length + (up.length === 1 ? ' night' : ' nights') + ' listed · from District and Sort My Scene'}
        </p>
      </div>
      <div
        className="hscroll moods"
        role="radiogroup"
        aria-label="Filter nights"
        style={{ paddingTop: '28px' }}
      >
        {FILTERS.map((f, i) => {
          var on = S.filter === f[0];
          return (
            <button
              key={f[0]}
              type="button"
              role="radio"
              aria-checked={on}
              className={'mood hue-' + f[3] + (on ? ' on' : '')}
              style={{ '--d': i * 50 + 'ms' }}
              onClick={() => c.set({ filter: f[0] })}
            >
              {i3(f[2], 64, 'mood-ic')}
              <span className="mood-lbl">{f[1]}</span>
            </button>
          );
        })}
      </div>
      {!Object.keys(S.nights).length ? (
        <div className="px" style={{ paddingTop: '20px' }}>
          <TuneWeekCard ctx={c} />
        </div>
      ) : null}
      {c.plan ? (
        <div className="px" style={{ paddingTop: '24px' }}>
          <BookedStrip ctx={c} />
        </div>
      ) : null}
      <div className="px col" style={{ paddingTop: '32px', gap: '10px' }}>
        <PickCard ctx={c} />
      </div>
      <div key={'feed-' + S.filter} className={'col' + (swapped ? ' feed-swap' : '')}>
        {groups.length ? (
          groups.map((g) => (
            <div key={g[0][0]} className="col">
              <div className="px" style={{ paddingTop: '36px', paddingBottom: '14px' }}>
                <div className="sec-row">
                  <div className="rowc" style={{ gap: '10px' }}>
                    <span className={'day-tag hue-' + g[0][4]}>{g[0][2]}</span>
                    <span className="g-section-title">{g[0][3]}</span>
                  </div>
                  {meta(g[1].length + (g[1].length === 1 ? ' night' : ' nights'))}
                </div>
              </div>
              <div className="hscroll cards">
                {g[1].map((k) => (
                  <WeekEventCard key={k} ctx={c} e={EVENTS[k]} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="px" style={{ paddingTop: '28px' }}>
            <NoMatchCard ctx={c} />
          </div>
        )}
      </div>
      <div className="px" style={{ paddingTop: '44px' }}>
        <GroupPlanCard ctx={c} />
      </div>
      <div className="px" style={{ paddingTop: '16px' }}>
        <HostCtaCard ctx={c} />
      </div>
    </div>
  );
}

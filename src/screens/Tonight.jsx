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
import { eyebrow, i3, meAvatar, meta, stop } from '../ui/helpers';
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
  return (
    <div className="col" style={{ paddingTop: '48px', paddingBottom: '140px' }}>
      <div className="rowc between px">
        <Tap onClick={() => c.tab('you')} aria-label="You" className="tap">
          {meAvatar(S, 48)}
        </Tap>
        <div className="rowc" style={{ gap: '8px' }}>
          <IconButton icon="search" label="Search" onClick={() => c.tab('search')} />
          <span className="bell">
            <IconButton
              icon="bell"
              label={S.notifSeen ? 'Updates' : 'Updates, new'}
              onClick={() => c.go('notifs', { notifSeen: true })}
            />
            {S.notifSeen ? null : <i className="bell-dot" aria-hidden />}
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
      <div className="px" style={{ paddingTop: '44px' }}>
        <GroupPlanCard ctx={c} />
      </div>
      <div className="px" style={{ paddingTop: '16px' }}>
        <HostCtaCard ctx={c} />
      </div>
    </div>
  );
}

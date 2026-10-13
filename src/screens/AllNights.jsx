import { useEffect, useState } from 'react';
import { MO, WD } from '../data/dates';
import { agePhrase, groupLabel, isSet } from '../data/group';
import { groupFor, homeItems } from '../data/homeData';
import { EVENTS, VENUES } from '../data/listings';
import { Chip, Icon, IconButton, NightTile } from '../design-system';
import { addDays, homeWindow, now } from '../lib/clock';
import { verdictText } from '../lib/door';
import { notForYou, railItems } from '../lib/homeRank';
import { log } from '../lib/log';
import { SOUNDS, priceLabel } from './HomeDoor';

/* All nights (home spec section 4, board 02): the full list, by day, with one row of quick filters.
   Opened from a rail's "See all" (at that day), a sound tile (filtered), or the end card.
   Nights that don't fit the group collapse at the end of each day */

function dayHeading(day, w) {
  var d = new Date(day + 'T00:00:00Z'),
    wd = WD[d.getUTCDay()];
  if (day === w.day) return w.when === 'tonight' ? 'Tonight' : 'Tomorrow · ' + wd.slice(0, 3) + ' ' + d.getUTCDate();
  if (day === addDays(w.day, 1) && w.when === 'tonight') return 'Tomorrow · ' + wd.slice(0, 3) + ' ' + d.getUTCDate();
  if (day < addDays(w.day, 7)) return wd;
  return wd.slice(0, 3) + ' ' + d.getUTCDate() + ' ' + MO[d.getUTCMonth()];
}

export function AllNights(p) {
  var c = p.ctx,
    S = c.S,
    t = now(),
    w = homeWindow(t),
    group = groupFor(S, t),
    f = S.anFilters || {},
    [open, setOpen] = useState({});
  var all = homeItems(S, t).filter((it) => !it.over && it.day >= w.day);
  function keep(it) {
    var e = EVENTS[it.id];
    if (f.cheap && !(it.price != null && it.price < 500)) return false;
    if (f.friends && !(e.nFriends > 0)) return false;
    if (f.sound && (e.tags || []).indexOf(f.sound) < 0) return false;
    return true;
  }
  var shown = all.filter(keep),
    days = Array.from(new Set(shown.map((it) => it.day))).sort();
  function toggle(k, v) {
    var x = Object.assign({}, f);
    if (x[k] === v) delete x[k];
    else x[k] = v;
    c.set({ anFilters: x });
  }
  var any = Object.keys(f).length > 0;

  function jump(day) {
    var target = days.filter((d) => d >= day)[0];
    var el = target && document.getElementById('an-' + target);
    if (el) el.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  // opened from "See all": start at that day
  useEffect(() => {
    if (S.anDay) jump(S.anDay);
  }, []);
  // the week's sounds, most nights first
  var sounds = SOUNDS.map((s) => [s, all.filter((it) => (EVENTS[it.id].tags || []).indexOf(s[0]) >= 0).length]).filter((x) => x[1] > 0);

  function row(it) {
    var e = EVENTS[it.id],
      v = VENUES[e.venue] || {};
    return (
      <NightTile
        key={it.id}
        layout="row"
        image={e.img}
        name={e.title}
        venue={v.name}
        distance={it.mins != null ? it.mins + ' min' : undefined}
        time={e.time}
        price={priceLabel(e) || undefined}
        crowd={it.crowd || undefined}
        verdict={verdictText(it.verdict, group, 'line')}
        onClick={() => c.openEvent(it.id)}
      />
    );
  }
  var sampleShown = false;
  return (
    <div className="col an-page">
      <div className="an-head px">
        <IconButton icon="arrow-left" label="Back" variant="solid" onClick={c.back} />
        <div className="col an-title">
          <h1 className="g-section-title">{'All nights · ' + all.length}</h1>
          <span className="meta">
            {isSet(group) ? 'Going as ' + groupLabel(group) + ' · ' + agePhrase(group, S.age) : 'Going as you'}
          </span>
        </div>
        <IconButton icon="sliders-horizontal" label="Who's going" variant="solid" onClick={() => c.set({ sheet: 'goingas', gaFrom: 'allnights' })} />
      </div>
      {/* one row of filters (board 02; Shubh, 13 Oct: two stacked chip rows don't look good). The days are the
          sticky headings below, and "See all" opens the list at its day */}
      <div className="an-chips" role="group" aria-label="Filters">
        <Chip selected={!!f.cheap} onClick={() => toggle('cheap', true)}>
          Under ₹500
        </Chip>
        <Chip icon="users" selected={!!f.friends} onClick={() => toggle('friends', true)}>
          Friends going
        </Chip>
        {sounds.map((x) => (
          <Chip key={x[0][0]} selected={f.sound === x[0][0]} onClick={() => toggle('sound', x[0][0])}>
            {x[0][1]}
          </Chip>
        ))}
        {any ? (
          <Chip icon="x" onClick={() => c.set({ anFilters: {} })} aria-pressed={undefined}>
            Clear
          </Chip>
        ) : null}
      </div>
      {days.length ? (
        days.map((day) => {
          var fits = railItems(shown, day, null, 1000).tiles,
            out = notForYou(shown, day),
            n = fits.length + out.length,
            first = !sampleShown && shown.some((it) => it.sample);
          if (first) sampleShown = true;
          return (
            <section key={day} id={'an-' + day} className="an-day" aria-label={dayHeading(day, w) + ', ' + n + ' nights'}>
              <div className="an-day-head px">
                <h2 className="g-section-title">{day === w.day && w.when === 'tonight' ? 'Tonight · ' + n : dayHeading(day, w)}</h2>
                <span className={first ? 'home-sample' : 'meta'}>{first ? 'Sample data' : n + (n === 1 ? ' night' : ' nights')}</span>
              </div>
              <div className="px col">
                {fits.map(row)}
                {out.length ? (
                  open[day] ? (
                    out.map(row)
                  ) : (
                    <button type="button" className="an-notfor" onClick={() => {
                        log('not_for_you_expand', { day: day });
                        setOpen(Object.assign({}, open, { [day]: true }));
                      }}>
                      <span className="col">
                        <span className="title15">{'Not for your group · ' + out.length}</span>
                        <span className="meta">{out[0].verdict.reasons[0]}</span>
                      </span>
                      <Icon name="chevron-down" size={20} />
                    </button>
                  )
                ) : null}
              </div>
            </section>
          );
        })
      ) : (
        <p className="meta px">Nothing matches these filters. Clear them to see every night</p>
      )}
    </div>
  );
}

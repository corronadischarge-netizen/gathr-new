import { useEffect, useRef, useState } from 'react';
import { blockedFor, priceTxt } from '../data/format';
import { AREA_LIST } from '../data/options';
import { EVENTS, VENUES, upcoming } from '../data/listings';
import { Badge, Button, Chip, SearchField } from '../design-system';
import { i3, icon, meta, sec, thumb } from '../ui/helpers';
import { Tap } from '../ui/Tap';

/* Search (interactions spec 6.9): what you type shows at once; the results follow 250 ms after you stop typing.
   Recent searches show when the field is focused and empty; Clear empties it and keeps the keyboard up */
const WAIT = 250;

export function Search(p) {
  var c = p.ctx,
    S = c.S,
    q = S.query.trim().toLowerCase();
  const [text, setText] = useState(S.query);
  const [focused, setFocused] = useState(false);
  var field = useRef(null);
  useEffect(() => {
    if (text === S.query) return;
    var t = setTimeout(() => c.set({ query: text }), WAIT);
    return () => clearTimeout(t);
  }, [text]);
  function fill(v) {
    setText(v);
    c.set({ query: v });
  }
  // a search you acted on (opened a night, or pressed Enter) joins Recent, newest first, 5 at most
  function remember() {
    var v = text.trim();
    if (!v) return;
    c.set((o) => ({ recents: [v].concat((o.recents || []).filter((x) => x.toLowerCase() !== v.toLowerCase())).slice(0, 5) }));
  }
  function input() {
    return field.current && field.current.querySelector('input');
  }
  var recents = (S.recents || []).slice(0, 5),
    showRecents = focused && !text.trim() && recents.length;
  var res = upcoming()
    .map((k) => EVENTS[k])
    .filter((e) => {
      var v = VENUES[e.venue],
        hay = (e.title + ' ' + e.genre + ' ' + v.name + ' ' + v.area + ' ' + e.date).toLowerCase();
      if (q && hay.indexOf(q) < 0) return false;
      if (S.sfilters.letsin && blockedFor(e, S.age)) return false;
      if (S.sfilters.cheap && !(e.rsvp || (e.price != null && e.price < 1000))) return false;
      if (S.sfilters.rules && !e.age) return false;
      if (S.sfilters.week && e.day === 'later') return false;
      return true;
    });
  function tog(k) {
    c.set((o) => {
      var x = Object.assign({}, o.sfilters);
      if (x[k]) delete x[k];
      else x[k] = 1;
      return { sfilters: x };
    });
  }
  var artists = [
    ['The Offspring', 'Live rock · ' + (EVENTS.millerssessions || {}).date + ' at The Millers', 'millerssessions'],
    ['Fireboy DML', 'Afrobeats, live · ' + (EVENTS.desidrop || {}).date + ' at Xclusive Superclub', 'desidrop'],
    ['Andre Power', 'Hip-hop DJ · ' + EVENTS.kikiafterdark.date + ' at Kiki', 'kikiafterdark']
  ].filter((a) => EVENTS[a[2]]).filter((a) => !q || (a[0] + a[1]).toLowerCase().indexOf(q) >= 0);
  return (
    <div className="col" style={{ padding: '52px 0 140px', gap: '24px' }}>
      <div className="px col" style={{ gap: '8px' }}>
        <div ref={field} className="rowc" style={{ gap: '8px' }}>
          <div style={{ flexGrow: 1, minWidth: 0 }}>
            <SearchField
              value={text}
              onChange={(ev) => setText(ev.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(ev) => {
                if (ev.key === 'Enter') {
                  fill(text);
                  remember();
                }
              }}
              placeholder="Search nights, venues or artists"
              aria-label="Search"
            />
          </div>
          {text ? (
            <Button
              variant="ghost"
              size="sm"
              onMouseDown={(ev) => ev.preventDefault()}
              onClick={() => {
                fill('');
                var i = input();
                if (i) i.focus();
              }}
            >
              Clear
            </Button>
          ) : null}
        </div>
        {showRecents ? (
          <div className="col search-recent" role="list" aria-label="Recent searches">
            {recents.map((r) => (
              <button
                key={r}
                type="button"
                role="listitem"
                className="search-recent-row"
                onMouseDown={(ev) => ev.preventDefault()}
                onClick={() => fill(r)}
              >
                {icon('clock', 20)}
                <span>{r}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div className="hscroll">
        {[
          ['week', 'This week'],
          ['letsin', 'Lets me in', 'users'],
          ['cheap', 'Under ₹1,000'],
          ['rules', 'Rules listed']
        ].map((f) => (
          <Chip key={f[0]} icon={f[2]} selected={!!S.sfilters[f[0]]} onClick={() => tog(f[0])}>
            {f[1]}
          </Chip>
        ))}
      </div>
      {!q ? (
        <div className="col" style={{ gap: '12px' }}>
          <div className="px">{sec('Browse by sound')}</div>
          <div className="hscroll moods">
            {[
              ['Bollywood', 'mic', 'pink'],
              ['Hip-hop', 'headphones', 'yellow'],
              ['Live gig', 'speaker', 'blue'],
              ['Club night', 'discoball', 'violet'],
              ['Commercial', 'spotlight', 'green']
            ].map((b) => (
              <button
                key={b[0]}
                type="button"
                className={'mood hue-' + b[2]}
                onClick={() => fill(b[0])}
              >
                {i3(b[1], 64, 'mood-ic')}
                <span className="mood-lbl">{b[0]}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <div className="px col" style={{ gap: '4px' }}>
        {sec(
          q ? 'Results' : 'All listed nights',
          meta(res.length + (res.length === 1 ? ' night' : ' nights'))
        )}
        {res.length ? (
          res.map((e) => {
            var v = VENUES[e.venue];
            return (
              <Tap
                onClick={() => {
                  remember();
                  c.openEvent(e.id);
                }}
                key={e.id}
                className="tap rowc"
                style={{ gap: '12px', minHeight: '72px' }}
                aria-label={e.title}
              >
                {thumb(e, 64)}
                <div className="col" style={{ gap: '2px', flexGrow: 1, minWidth: 0 }}>
                  <span className="title16">{e.title}</span>
                  {meta(e.date + ' · ' + v.name + ' · ' + priceTxt(e))}
                </div>
                {e.age ? (
                  <Badge tone={blockedFor(e, S.age) ? 'limit' : 'neutral'}>{e.age + '+'}</Badge>
                ) : null}
              </Tap>
            );
          })
        ) : (
          <div className="col" style={{ gap: '12px' }}>
            <p className="body muted" style={{ margin: 0 }}>
              {'Nothing for ‘' + S.query.trim() + '’. Try an artist or an area'}
            </p>
            <div className="wrap">
              {['The Offspring'].concat(AREA_LIST.slice(0, 4)).map((x) => (
                <Chip key={x} icon={x === 'The Offspring' ? 'music-2' : 'map-pin'} onClick={() => fill(x)}>
                  {x}
                </Chip>
              ))}
            </div>
          </div>
        )}
      </div>
      {artists.length ? (
        <div className="px col" style={{ gap: '12px' }}>
          <span className="g-section-title">Artists</span>
          {artists.map((a) => {
            var f = !!S.follow[a[0]];
            return (
              <div key={a[0]} className="rowc" style={{ gap: '12px' }}>
                {thumb(EVENTS[a[2]], 48)}
                <div className="col" style={{ gap: '2px', flexGrow: 1 }}>
                  <span className="title16">{a[0]}</span>
                  {meta(a[1])}
                </div>
                <Button
                  variant={f ? 'ghost' : 'subtle'}
                  size="sm"
                  onClick={() =>
                    c.set((o) => {
                      var x = Object.assign({}, o.follow);
                      if (x[a[0]]) delete x[a[0]];
                      else x[a[0]] = 1;
                      return { follow: x };
                    })
                  }
                >
                  {f ? 'Following' : 'Follow'}
                </Button>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

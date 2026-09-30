import { blockedFor, priceTxt } from '../data/format';
import { EVENTS, VENUES, upcoming } from '../data/listings';
import { Badge, Button, Chip, SearchField } from '../design-system';
import { i3, meta, sec, thumb } from '../ui/helpers';
import { Tap } from '../ui/Tap';

export function Search(p) {
  var c = p.ctx,
    S = c.S,
    q = S.query.trim().toLowerCase();
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
    ['Twin Strings', 'Indie pop, soft rock · 9 Oct at Epitome', 'twin'],
    ['The Yellow Diary', 'Live band · 4 Oct at KOPA Mall', 'yellow']
  ].filter((a) => !q || (a[0] + a[1]).toLowerCase().indexOf(q) >= 0);
  return (
    <div className="col" style={{ padding: '52px 0 140px', gap: '24px' }}>
      <div className="px">
        <SearchField
          value={S.query}
          onChange={(ev) => c.set({ query: ev.target.value })}
          placeholder="Search nights, venues or artists"
          aria-label="Search"
        />
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
                onClick={() => c.set({ query: b[0] })}
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
                onClick={() => c.openEvent(e.id)}
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
          <p className="body muted">{'No nights match "' + S.query + '". Try a venue, genre or day.'}</p>
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

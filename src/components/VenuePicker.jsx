import { useState } from 'react';
import { VENUES } from '../data/listings';
import { AREA_XY } from '../data/organisers';
import { Badge, Button, Chip, IconButton, SearchField } from '../design-system';
import { meta } from '../ui/helpers';

/* "Kukoo" and "kukoo!" and "The Game Palacio" vs "game palacio" all compare the same */
function norm(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

/* Search the venues gathr knows, pick every venue you look after (the first is your main venue),
   and add one that isn't listed yet. Which venues you run is between you and the venue: gathr doesn't check. */
export function VenuePicker(p) {
  var ids = p.ids,
    custom = p.custom || [];
  const [q, setQ] = useState('');
  const [adding, setAdding] = useState(null); // { name, area } while adding a venue that isn't listed
  var all = Object.keys(VENUES);
  var nq = norm(q);
  // names that start with what you typed first, then names that contain it, then matches on the area
  var rank = (k) => {
    var at = norm(VENUES[k].name).indexOf(nq);
    return at < 0 ? 100 : at;
  };
  var hits = nq.length
    ? all
        .filter((k) => ids.indexOf(k) < 0)
        .filter((k) => norm(VENUES[k].name).indexOf(nq) >= 0 || norm(VENUES[k].area).indexOf(nq) >= 0)
        .sort((a, b) => rank(a) - rank(b))
        .slice(0, 6)
    : [];
  function add(k) {
    p.onChange(ids.concat(k), custom);
    setQ('');
  }
  function remove(k) {
    p.onChange(
      ids.filter((x) => x !== k),
      custom.filter((x) => x.id !== k)
    );
  }
  function makeMain(k) {
    p.onChange([k].concat(ids.filter((x) => x !== k)), custom);
  }
  // a venue with the same name in the same area is already listed: offer that one instead
  var twin =
    adding && adding.area
      ? all.filter(
          (k) => norm(VENUES[k].name) === norm(adding.name) && VENUES[k].area.indexOf(adding.area) >= 0
        )[0]
      : null;
  function addNew() {
    var base = 'v_' + norm(adding.name).slice(0, 24),
      id = base,
      n = 2;
    while (VENUES[id] || custom.some((x) => x.id === id)) id = base + n++;
    var nv = { id: id, name: adding.name.trim(), area: adding.area };
    VENUES[id] = {
      id: id,
      name: nv.name,
      area: nv.area,
      crowd: 'quiet',
      lat: AREA_XY[nv.area][0] + 0.0012,
      lng: AREA_XY[nv.area][1] + 0.0012,
      ic: 'spotlight',
      hue: 'violet',
      added: true
    };
    p.onChange(ids.concat(id), custom.concat(nv));
    setAdding(null);
    setQ('');
  }
  return (
    <div className="col" style={{ gap: '10px' }}>
      <span className="meta">{p.label}</span>
      {ids.length ? (
        <div className="col venue-picked">
          {ids.map((k, i) => {
            var v = VENUES[k];
            if (!v) return null;
            return (
              <div key={k} className="rowc list-row" style={{ gap: '10px' }}>
                <div className="col" style={{ gap: '2px', flexGrow: 1, minWidth: 0 }}>
                  <span className="title15">{v.name}</span>
                  {meta(v.area + (v.added ? ' · added by you' : ''))}
                </div>
                {i === 0 ? (
                  <Badge tone="brand">Main</Badge>
                ) : (
                  <button type="button" className="link-btn" onClick={() => makeMain(k)}>
                    Make main
                  </button>
                )}
                <IconButton icon="x" label={'Remove ' + v.name} variant="tonal" onClick={() => remove(k)} />
              </div>
            );
          })}
        </div>
      ) : null}
      {adding ? (
        <div className="col fade-up venue-add" style={{ gap: '10px' }}>
          <span className="title15">Add a venue</span>
          <div className="field-row">
            <input
              aria-label="Venue name"
              value={adding.name}
              maxLength={40}
              placeholder="Venue name"
              onChange={(e) => setAdding(Object.assign({}, adding, { name: e.target.value }))}
            />
          </div>
          <span className="meta">Area</span>
          <div className="wrap" role="radiogroup" aria-label="Area">
            {Object.keys(AREA_XY).map((a) => (
              <Chip
                key={a}
                role="radio"
                aria-checked={adding.area === a}
                selected={adding.area === a}
                onClick={() => setAdding(Object.assign({}, adding, { area: a }))}
              >
                {a}
              </Chip>
            ))}
          </div>
          {twin ? (
            <div className="rowc" style={{ gap: '10px' }}>
              {meta(VENUES[twin].name + ' in ' + VENUES[twin].area + ' is already listed.')}
              {ids.indexOf(twin) < 0 ? (
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() => {
                    add(twin);
                    setAdding(null);
                  }}
                >
                  Add that one
                </Button>
              ) : null}
            </div>
          ) : null}
          <div className="rowc" style={{ gap: '8px' }}>
            <Button variant="ghost" onClick={() => setAdding(null)}>
              Cancel
            </Button>
            <div style={{ flexGrow: 1 }}>
              <Button
                variant="primary"
                block
                disabled={adding.name.trim().length < 2 || !adding.area || !!twin}
                onClick={addNew}
              >
                Add venue
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="col" style={{ gap: '6px' }}>
          <SearchField
            placeholder={ids.length ? 'Add another venue' : 'Search venues by name or area'}
            aria-label="Search venues"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {hits.map((k) => (
            <button key={k} type="button" className="rowc list-row venue-hit" onClick={() => add(k)}>
              <div className="col" style={{ gap: '2px', flexGrow: 1, textAlign: 'left' }}>
                <span className="title15">{VENUES[k].name}</span>
                {meta(VENUES[k].area)}
              </div>
              <span className="meta" aria-hidden>
                Add
              </span>
            </button>
          ))}
          {nq.length >= 2 ? (
            <button
              type="button"
              className="link-btn"
              onClick={() => setAdding({ name: q.trim(), area: '' })}
            >
              {(hits.length ? 'Not here? ' : 'No venue called “' + q.trim() + '” yet. ') + 'Add it'}
            </button>
          ) : !ids.length ? (
            meta('Pick every venue you look after. You can add more later.')
          ) : null}
        </div>
      )}
    </div>
  );
}

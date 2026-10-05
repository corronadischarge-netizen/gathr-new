import { useState } from 'react';
import { EVENTS } from '../data/listings';
import { orgStats, passCount, setCheckin } from '../data/organisers';
import { Button, SearchField } from '../design-system';
import { Share } from '../services/share';
import { fav, meta, svgIcon } from '../ui/helpers';

/* who's coming to one night (bookings and guest-list people): search, check in by hand, download */
export function GuestList(p) {
  var c = p.ctx,
    S = c.S,
    id = p.id;
  var qs = useState(''),
    q = qs[0],
    setQ = qs[1];
  var st = orgStats(S, id),
    e = EVENTS[id] || {},
    passes = passCount(st.guests);
  var inPeople = st.guests.filter((g) => st.ci[g.name]).length;
  var shown = st.guests.filter(
    (g) =>
      !q ||
      g.name.toLowerCase().indexOf(q.toLowerCase()) >= 0 ||
      (g.code || '').toLowerCase().indexOf(q.toLowerCase()) >= 0
  );
  function toggleIn(name) {
    setCheckin(c, id, name, !st.ci[name]);
  }
  function csv() {
    var rows = [['Name', 'Passes', 'Booking code', 'How', 'Checked in']].concat(
      st.guests.map((g) => [
        g.name,
        g.passes,
        g.code || '',
        g.booked,
        st.ci[g.name]
          ? new Date(st.ci[g.name] > 1 ? st.ci[g.name] : Date.now()).toLocaleTimeString('en-IN', {
              hour: 'numeric',
              minute: '2-digit'
            })
          : 'No'
      ])
    );
    Share.download(
      new Blob(
        [rows.map((r) => r.map((x) => '"' + String(x).replace(/"/g, '""') + '"').join(',')).join('\n')],
        { type: 'text/csv' }
      ),
      (e.id || id) + '-whos-coming.csv'
    );
    c.toast('List downloaded');
  }
  return (
    <section className="col" style={{ gap: '12px' }} aria-labelledby="oe-list">
      <div className="sec-row">
        <h2 id="oe-list" className="g-section-title" style={{ margin: 0 }}>
          Who’s coming
        </h2>
        {meta(
          inPeople + ' of ' + st.guests.length + ' in · ' + passes + (passes === 1 ? ' pass' : ' passes')
        )}
      </div>
      {st.guests.length ? (
        <div className="col" style={{ gap: '10px' }}>
          <SearchField
            value={q}
            placeholder="Find a name"
            aria-label="Find a guest"
            onChange={(ev) => setQ(ev.target.value)}
          />
          <div className="ev-card col" style={{ gap: 0, paddingTop: '4px', paddingBottom: '4px' }}>
            {shown.length ? (
              shown.map((g, i) => {
                var isIn = !!st.ci[g.name];
                return (
                  <div key={g.name} className={'rowc org-guest' + (i ? ' sep' : '')} style={{ gap: '12px' }}>
                    {fav(g.name.split(' ')[0], 36)}
                    <div className="col" style={{ gap: '2px', flexGrow: 1, minWidth: 0 }}>
                      <span className="title15">{g.name}</span>
                      {meta(
                        g.passes +
                          (g.passes === 1 ? ' pass' : ' passes') +
                          ' · ' +
                          (g.code ? g.code + ' · ' : '') +
                          (st.ci[g.name] > 1
                            ? 'in at ' +
                              new Date(st.ci[g.name]).toLocaleTimeString('en-IN', {
                                hour: 'numeric',
                                minute: '2-digit'
                              })
                            : g.booked)
                      )}
                    </div>
                    <button
                      type="button"
                      className={'org-in' + (isIn ? ' on' : '')}
                      aria-pressed={isIn}
                      aria-label={(isIn ? 'Undo check-in for ' : 'Check in ') + g.name}
                      onClick={() => toggleIn(g.name)}
                    >
                      {isIn ? svgIcon(['M5 12.5l4.5 4.5L19 7'], 16) : null}
                      {isIn ? 'In' : 'Check in'}
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="meta" style={{ margin: '12px 0' }}>
                {'No one called “' + q + '” on the list.'}
              </p>
            )}
          </div>
          <Button variant="subtle" block icon="arrow-up-right" onClick={csv}>
            Download the list (CSV)
          </Button>
        </div>
      ) : (
        <div className="ev-card col" style={{ gap: '6px' }}>
          <span className="title15">No one on the list yet</span>
          {meta(
            p.live
              ? 'Share your link on Instagram and WhatsApp. Bookings show here as they come in.'
              : 'Once the night is live, bookings show here.'
          )}
        </div>
      )}
    </section>
  );
}

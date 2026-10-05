import { useRef, useState } from 'react';
import { HostBar } from '../components/HostBar';
import { SCAN_IC } from '../components/HostTabBar';
import { NightPicker } from '../components/NightPicker';
import { ScanResult } from '../components/ScanResult';
import { hostCur, hostNights } from '../data/hostNights';
import { EVENTS } from '../data/listings';
import { orgStats, passCount } from '../data/organisers';
import { Button } from '../design-system';
import { checkPass } from '../lib/passQr';
import { OrgIntro } from './OrgIntro';
import { eyebrow, fav, i3, meta, stop, svgIcon } from '../ui/helpers';

/* Door: pick tonight's night, scan or type a code, see who's in */
export function HostDoor(p) {
  var c = p.ctx,
    S = c.S,
    list = hostNights(S),
    id = hostCur(S);
  var cs = useState(''),
    code = cs[0],
    setCode = cs[1];
  var rs = useState(null),
    res = rs[0],
    setRes = rs[1];
  if (!S.org.profile) return <OrgIntro ctx={c} />;
  var e = id ? EVENTS[id] : null,
    st = id ? orgStats(S, id) : null;
  var inP = st ? st.guests.filter((g) => st.ci[g.name]) : [];
  var inPasses = passCount(inP),
    allPasses = st ? passCount(st.guests) : 0;
  function lookup() {
    var r = checkPass(S, id, 'code:' + code.trim().toUpperCase());
    setRes(r);
  }
  var recent = inP
    .filter((g) => st.ci[g.name] > 1)
    .sort((a, b) => st.ci[b.name] - st.ci[a.name])
    .slice(0, 4);
  return (
    <div className="full col pad-top" style={{ gap: '22px', paddingTop: '52px', paddingBottom: '140px' }}>
      <HostBar ctx={c} />
      <div>
        {eyebrow(e ? e.date + ' · ' + e.time : 'No nights on')}
        {stop('the door')}
      </div>
      {e ? <NightPicker ctx={c} list={list} cur={id} /> : null}
      {e ? (
        <div className="ev-card col" style={{ gap: '10px' }}>
          <div className="rowc between">
            <span className="title15">{e.title}</span>
            <span className="org-n">{inPasses + ' / ' + allPasses}</span>
          </div>
          <div className="org-bar" role="img" aria-label={inPasses + ' of ' + allPasses + ' passes in'}>
            <i
              style={{
                width: (allPasses ? Math.round((inPasses / allPasses) * 100) : 0) + '%',
                background: 'var(--green-300)'
              }}
            />
          </div>
          {meta(
            inP.length + ' of ' + st.guests.length + ' bookings in' + (st.sample ? ' · sample bookings' : '')
          )}
        </div>
      ) : (
        <div className="g-card card col empty-card">
          {i3('spotlight', 64)}
          <span className="title16">No nights on right now</span>
          {meta('List a night and its door opens here.')}
          <Button variant="subtle" size="sm" onClick={() => c.go('orgform', { orgEdit: null })}>
            List a night
          </Button>
        </div>
      )}
      {e ? (
        <button type="button" className="scan-cta" onClick={() => c.set({ scanning: true, hostNight: id })}>
          <span className="scan-cta-ic">{svgIcon(SCAN_IC, 32)}</span>
          <span className="col" style={{ gap: '2px', textAlign: 'left' }}>
            <span className="scan-cta-t">Scan a pass</span>
            <span className="meta" style={{ color: '#ffffffcc' }}>
              Point the camera at the guest’s QR
            </span>
          </span>
        </button>
      ) : null}
      {e ? (
        <div className="col" style={{ gap: '8px' }}>
          <label className="meta" htmlFor="door-code">
            Camera struggling? Type the booking code
          </label>
          <div className="rowc" style={{ gap: '8px' }}>
            <div className="field-row" style={{ flex: 1 }}>
              <input
                id="door-code"
                value={code}
                autoCapitalize="characters"
                spellCheck={false}
                placeholder="G-1DM2Z4"
                maxLength={9}
                onChange={(ev) => {
                  setCode(ev.target.value.toUpperCase());
                  setRes(null);
                }}
                onKeyDown={(ev) => {
                  if (ev.key === 'Enter') lookup();
                }}
              />
            </div>
            <Button variant="primary" disabled={code.trim().length < 5} onClick={lookup}>
              Check
            </Button>
          </div>
          {res ? (
            <ScanResult
              ctx={c}
              id={id}
              res={res}
              onDone={() => {
                setRes(null);
                setCode('');
              }}
            />
          ) : null}
        </div>
      ) : null}
      {st ? <JustIn recent={recent} ci={st.ci} scanning={S.scanning} /> : null}
    </div>
  );
}

/* Guests let in most recently. A new arrival slides in at the top, but only once the scanner is closed
   (adding the class then starts the animation), so door staff see it happen. */
function JustIn(p) {
  var seen = useRef(null);
  if (!seen.current) seen.current = new Map(p.recent.map((g) => [g.name, 0])); // already here: no animation
  if (!p.recent.length) return null;
  var now = Date.now();
  return (
    <div className="col" style={{ gap: '4px' }}>
      <span className="g-section-title">Just in</span>
      {p.recent.map((g) => {
        if (!p.scanning && !seen.current.has(g.name)) seen.current.set(g.name, now);
        var fresh = now - (seen.current.get(g.name) || 0) < 400;
        return (
          <div key={g.name} className={'rowc list-row' + (fresh ? ' row-in' : '')} style={{ gap: '12px' }}>
            {fav(g.name.split(' ')[0], 36)}
            <div className="col" style={{ gap: '2px', flexGrow: 1 }}>
              <span className="title15">{g.name}</span>
              {meta(
                g.passes +
                  (g.passes === 1 ? ' pass' : ' passes') +
                  ' · ' +
                  new Date(p.ci[g.name]).toLocaleTimeString('en-IN', {
                    hour: 'numeric',
                    minute: '2-digit'
                  })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

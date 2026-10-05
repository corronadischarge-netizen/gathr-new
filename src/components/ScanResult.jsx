import { useEffect, useState } from 'react';
import { ORG_KEY, orgLoad, setCheckin } from '../data/organisers';
import { Button } from '../design-system';
import { haptic } from '../lib/haptics';
import { store } from '../lib/utils';
import { isRemoteNight, letIn, takeBack } from '../services/door';
import { svgIcon } from '../ui/helpers';

/* Door staff feel the result before they read it: green = two short buzzes, amber = one long, red = a hard double */
const BUZZ = { green: haptic.success, amber: haptic.warning, red: haptic.error };

export function ScanResult(p) {
  var c = p.ctx,
    r = p.res,
    id = p.id,
    online = isRemoteNight(id);
  // a guest list: tick who's actually here (everyone still outside, to start with)
  const [here, setHere] = useState(r.pick || []);
  useEffect(() => {
    (BUZZ[r.tone] || haptic.select)();
    setHere(r.pick || []);
  }, [r]);
  function admit() {
    if (r.pick && !here.length) return;
    if (online && r.guest) letIn(c, id, r.guest, r.pick ? here : null);
    else if (r.walkin) {
      var cur = orgLoad();
      cur.walkins = cur.walkins || {};
      cur.walkins[id] = (cur.walkins[id] || []).concat(r.walkin);
      store(ORG_KEY, cur);
      c.set({ org: cur });
      setCheckin(c, id, r.walkin.name, true);
    } else setCheckin(c, id, r.guest.name, true);
    c.toast(
      r.pick
        ? here.join(', ') + (here.length === 1 ? ' is in' : ' are in')
        : (r.walkin ? r.walkin.name : r.guest.name) + ' is in'
    );
    haptic.success();
    p.onDone();
  }
  function undo() {
    if (online) takeBack(c, id, r.guest).then((ok) => ok && c.toast('Check-in undone'));
    else {
      setCheckin(c, id, r.guest.name, false);
      c.toast('Check-in undone');
    }
    p.onDone();
  }
  return (
    <div className={'scan-res tone-' + r.tone} role="alert">
      <div className="rowc" style={{ gap: '12px' }}>
        <span className="scan-res-ic" aria-hidden>
          {r.tone === 'green'
            ? svgIcon(['M5 12.5l4.5 4.5L19 7'], 22)
            : r.tone === 'amber'
              ? '!'
              : svgIcon(['M6 6l12 12', 'M18 6L6 18'], 20)}
        </span>
        <div className="col" style={{ gap: '2px', flex: 1, minWidth: 0 }}>
          <span className="scan-res-t">{r.title}</span>
          <span className="scan-res-l">{r.line}</span>
        </div>
      </div>
      {r.pick ? (
        <div className="col" role="group" aria-label="Who’s here">
          {r.pick.map((n) => {
            var on = here.indexOf(n) >= 0;
            return (
              <button
                key={n}
                type="button"
                role="checkbox"
                aria-checked={on}
                className={'rowc pick-row' + (on ? ' on' : '')}
                onClick={() => setHere(on ? here.filter((x) => x !== n) : here.concat(n))}
              >
                <span className="pick-box" aria-hidden>
                  {on ? svgIcon(['M5 12.5l4.5 4.5L19 7'], 16) : null}
                </span>
                <span className="title15">{n}</span>
              </button>
            );
          })}
        </div>
      ) : null}
      <div className="rowc" style={{ gap: '8px' }}>
        {r.admit ? (
          <div style={{ flex: 1 }}>
            <Button variant="primary" block disabled={!!r.pick && !here.length} onClick={admit}>
              {r.pick ? (here.length ? 'Let ' + here.length + ' in' : 'Tick who’s here') : 'Let them in'}
            </Button>
          </div>
        ) : null}
        {r.undo ? (
          <div style={{ flex: 1 }}>
            <Button variant="subtle" block onClick={undo}>
              Undo check-in
            </Button>
          </div>
        ) : null}
        <div style={{ flex: r.admit || r.undo ? 'none' : 1 }}>
          <Button variant="subtle" block={!(r.admit || r.undo)} onClick={p.onDone}>
            {r.admit ? 'Not now' : 'Next guest'}
          </Button>
        </div>
      </div>
    </div>
  );
}

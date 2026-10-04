import { ORG_KEY, orgLoad, setCheckin } from '../data/organisers';
import { useEffect } from 'react';
import { haptic } from '../lib/haptics';
import { Button } from '../design-system';
import { store } from '../lib/utils';
import { svgIcon } from '../ui/helpers';

/* Door staff feel the result before they read it: green = two short buzzes, amber = one long, red = a hard double */
const BUZZ = { green: haptic.success, amber: haptic.warning, red: haptic.error };

export function ScanResult(p) {
  var c = p.ctx,
    r = p.res,
    id = p.id;
  useEffect(() => {
    (BUZZ[r.tone] || haptic.select)();
  }, [r]);
  function admit() {
    if (r.walkin) {
      var cur = orgLoad();
      cur.walkins = cur.walkins || {};
      cur.walkins[id] = (cur.walkins[id] || []).concat(r.walkin);
      store(ORG_KEY, cur);
      c.set({ org: cur });
      setCheckin(c, id, r.walkin.name, true);
    } else setCheckin(c, id, r.guest.name, true);
    c.toast((r.walkin ? r.walkin.name : r.guest.name) + ' is in');
    haptic.success();
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
      <div className="rowc" style={{ gap: '8px' }}>
        {r.admit ? (
          <div style={{ flex: 1 }}>
            <Button variant="primary" block onClick={admit}>
              Let them in
            </Button>
          </div>
        ) : null}
        {r.undo ? (
          <div style={{ flex: 1 }}>
            <Button
              variant="subtle"
              block
              onClick={() => {
                setCheckin(c, id, r.guest.name, false);
                c.toast('Check-in undone');
                p.onDone();
              }}
            >
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

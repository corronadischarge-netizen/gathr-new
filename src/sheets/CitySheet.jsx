import { NEXT_CITIES } from '../data/options';
import { Sheet } from '../design-system';
import { haptic } from '../lib/haptics';
import { remoteOn, sayError, wantCity } from '../services/remote';
import { icon, meta, note, svgIcon } from '../ui/helpers';

/* The city chip on This week: Pune now, the next cities as "Coming soon · Tell me when" */
export function CitySheet(p) {
  var c = p.ctx,
    S = c.S,
    asked = S.cityWant || [];
  function tell(key, name) {
    if (!S.signedIn) {
      // sign in first; the ask is kept and sent once they're in
      c.set({ sheet: null, cityAsk: key, stack: ['welcome', 'phone'], login: true, dir: 'fwd' });
      c.toast('Sign in, and we’ll tell you when gathr opens in ' + name);
      return;
    }
    var save = remoteOn ? wantCity(key) : Promise.resolve();
    c.set({ cityWant: asked.concat(key) });
    save.then(
      () => {
        haptic.success();
        c.toast('We’ll tell you when gathr opens in ' + name);
      },
      (e) => {
        c.set((o) => ({ cityWant: (o.cityWant || []).filter((k) => k !== key) }));
        c.toast(sayError(e));
      }
    );
  }
  return (
    <Sheet title="Your city" subtitle="gathr is in Pune for now" onClose={() => c.set({ sheet: null })}>
      <div className="col">
        <div className="rowc list-row city-row" style={{ gap: '12px' }}>
          <span className="city-ic on">{icon('map-pin', 18)}</span>
          <span className="title15" style={{ flexGrow: 1 }}>
            Pune
          </span>
          <span className="city-tick" aria-label="Your city">
            {svgIcon(['M5 12.5l4.5 4.5L19 7'], 18)}
          </span>
        </div>
        {NEXT_CITIES.map((x) => {
          var done = asked.indexOf(x[0]) >= 0;
          return (
            <div key={x[0]} className="rowc list-row city-row" style={{ gap: '12px' }}>
              <span className="city-ic">{icon('map-pin', 18)}</span>
              <div className="col" style={{ gap: '2px', flexGrow: 1, minWidth: 0 }}>
                <span className="title15">{x[1]}</span>
                {meta('Coming soon')}
              </div>
              <button
                type="button"
                className={'city-tell' + (done ? ' on' : '')}
                disabled={done}
                onClick={() => tell(x[0], x[1])}
              >
                {done ? svgIcon(['M5 12.5l4.5 4.5L19 7'], 14) : null}
                {done ? 'We’ll tell you' : 'Tell me when'}
              </button>
            </div>
          );
        })}
      </div>
      {note('We only use this to tell you when gathr opens there.')}
    </Sheet>
  );
}

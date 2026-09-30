import { priceTxt } from '../data/format';
import { EVENTS, upcoming } from '../data/listings';
import { VenueHero } from '../design-system';
import { btnLabel, icon, meta, thumb } from '../ui/helpers';
import { Tap } from '../ui/Tap';

export function Venue(p) {
  var c = p.ctx,
    S = c.S,
    e = c.ev,
    v = c.ven,
    saved = !!S.saved[e.id];
  var evs = upcoming()
    .filter((k) => EVENTS[k].venue === v.id)
    .map((k) => EVENTS[k]);
  return (
    <div className="col" style={{ paddingBottom: '48px' }}>
      <div
        onClick={(ev) => {
          var l = btnLabel(ev);
          if (l === 'Back') c.back();
          else if (l === 'Save') c.toggleSave(e.id);
          else if (l && l.indexOf('See the nights') >= 0) c.openEvent(e.id);
        }}
      >
        <VenueHero
          name={v.name}
          vibe={e.genre.split(',')[0]}
          crowd={v.crowd}
          area={v.area}
          distance={evs.length + (evs.length === 1 ? ' night listed' : ' nights listed')}
          doorTime="Closes 1:30 am"
          action="See the nights"
          saved={saved}
        />
      </div>
      <div className="px col" style={{ paddingTop: '24px', gap: '20px' }}>
        <div className="rowc between">
          {meta('Venue photo and crowd not live yet')}
          <button type="button" className="link-btn" onClick={() => c.set({ sheet: 'rules' })}>
            Who gets in{icon('chevron-right', 16)}
          </button>
        </div>
        <div className="col" style={{ gap: '4px' }}>
          <span className="g-section-title">Listed nights</span>
          {evs.map((x) => (
            <Tap
              onClick={() => c.openEvent(x.id)}
              key={x.id}
              className="tap rowc"
              style={{ gap: '12px', minHeight: '72px' }}
              aria-label={x.title}
            >
              {thumb(x, 64)}
              <div className="col" style={{ gap: '2px', flexGrow: 1 }}>
                <span className="title16">{x.title}</span>
                {meta(x.date + ' · ' + x.time + ' · ' + priceTxt(x))}
              </div>
              {icon('chevron-right')}
            </Tap>
          ))}
        </div>
      </div>
    </div>
  );
}

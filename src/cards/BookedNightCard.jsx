import { icon, meta, thumb } from '../ui/helpers';
import { Tap } from '../ui/Tap';

/* Group plan, once booked: the night everyone is going to. Tap to open the pass. */
export function BookedNightCard(p) {
  var c = p.ctx,
    e = p.e;
  return (
    <Tap onClick={() => c.go('pass')} className="tap g-card card rowc" style={{ gap: '12px' }}>
      {thumb(e, 56)}
      <div className="col" style={{ gap: '2px', flexGrow: 1 }}>
        <span className="title16">{e.title}</span>
        {meta(e.date + ' · ' + e.time + ' · 5 passes')}
      </div>
      {icon('chevron-right')}
    </Tap>
  );
}

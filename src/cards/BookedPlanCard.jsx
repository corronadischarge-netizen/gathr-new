import { VENUES } from '../data/listings';
import { Badge } from '../design-system';
import { icon, meta, thumb } from '../ui/helpers';
import { Tap } from '../ui/Tap';

/* Plans: the night you've booked, and how many passes. Tap to get ready. */
export function BookedPlanCard(p) {
  var c = p.ctx,
    S = c.S,
    e = c.plan;
  return (
    <Tap onClick={() => c.go('ready')} className="tap g-card card col" style={{ gap: '12px' }}>
      <div className="rowc between">
        <Badge tone="go">{e.rsvp ? 'RSVP confirmed' : 'Booked'}</Badge>
        {meta(S.guests === 1 ? 'Just you' : 'You + ' + (S.guests - 1))}
      </div>
      <div className="rowc" style={{ gap: '12px' }}>
        {thumb(e, 56)}
        <div className="col" style={{ gap: '2px' }}>
          <span style={{ fontSize: '17px', lineHeight: '22px', fontWeight: 600 }}>{e.title}</span>
          {meta(VENUES[e.venue].name + ' · ' + e.date + ' · ' + e.time)}
        </div>
      </div>
      <div
        className="rowc"
        style={{ justifyContent: 'flex-end', gap: '4px', fontSize: '13px', fontWeight: 600 }}
      >
        Get ready{icon('chevron-right', 16)}
      </div>
    </Tap>
  );
}

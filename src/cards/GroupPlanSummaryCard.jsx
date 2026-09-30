import { EVENTS } from '../data/listings';
import { icon, meta, tile } from '../ui/helpers';
import { Tap } from '../ui/Tap';

/* Plans: your group plan in one line (voting or booked). Tap to open it. */
export function GroupPlanSummaryCard(p) {
  var c = p.ctx,
    gp = c.S.gp;
  return (
    <Tap onClick={() => c.go('group')} className="tap g-card card rowc" style={{ gap: '12px' }}>
      {tile('champagne', 'violet', 48)}
      <div className="col" style={{ gap: '2px', flexGrow: 1 }}>
        <span className="title15">{gp.name}</span>
        {meta(
          gp.stage === 'booked' ? 'Booked · ' + EVENTS[gp.booked].title : 'Voting · closes ' + gp.deadline
        )}
      </div>
      {icon('chevron-right')}
    </Tap>
  );
}

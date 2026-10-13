import { EVENTS, VENUES } from '../data/listings';
import { Button, Sheet } from '../design-system';

/* A past night's "…" menu on Plans (interactions spec 6.10): the buttons that match the swipe */
export function PastMenuSheet(p) {
  var c = p.ctx,
    id = c.S.pastSel,
    e = EVENTS[id];
  if (!e) return null;
  return (
    <Sheet title={e.title} subtitle={e.date + ' · ' + VENUES[e.venue].name} onClose={p.close}>
      <div className="col" style={{ gap: '12px' }}>
        <Button variant="primary" size="lg" block icon="arrow-right" onClick={() => c.go('recap', { recapId: id })}>
          See how it went
        </Button>
        <Button
          variant="ghost"
          block
          onClick={() => {
            c.set({ sheet: null });
            c.removePast(id);
          }}
        >
          Remove from Plans
        </Button>
      </div>
    </Sheet>
  );
}

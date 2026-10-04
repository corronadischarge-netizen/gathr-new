import { PassCard } from '../cards/PassCard';
import { VENUES } from '../data/listings';
import { Button, IconButton } from '../design-system';
import { eyebrow, stop } from '../ui/helpers';

export function Pass(p) {
  var c = p.ctx,
    e = c.plan || c.ev,
    v = VENUES[e.venue];
  // right after booking: the tick draws, then the pass rises and the wristband drops onto it
  var fresh = c.S.celebrate && Date.now() - c.S.celebrate < 4000;
  return (
    <div className={'full col pad-top' + (fresh ? ' celebrate' : '')} style={{ paddingTop: '52px' }}>
      <div className="rowc" style={{ justifyContent: 'flex-end' }}>
        <IconButton icon="x" label="Close" variant="solid" onClick={() => c.tab('plans')} />
      </div>
      {eyebrow(e.date + ' · ' + v.name, { marginTop: '8px' })}
      <div className="rowc" style={{ gap: '12px', marginTop: '6px' }}>
        <span className="ok-tick" aria-hidden>
          <svg
            viewBox="0 0 24 24"
            width={20}
            height={20}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12.5l4.5 4.5L19 7" />
          </svg>
        </span>
        {stop(e.rsvp ? "you're on the list" : "you're booked")}
      </div>
      <PassCard ctx={c} e={e} v={v} />
      <div className="bottom-stack" style={{ alignItems: 'stretch' }}>
        <Button variant="primary" size="lg" block icon="arrow-right" onClick={() => c.go('ready')}>
          Get ready for the night
        </Button>
        <Button variant="ghost" onClick={() => c.set({ sheet: 'cancel' })}>
          Cancel booking
        </Button>
      </div>
    </div>
  );
}

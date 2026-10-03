import { BookedPlanCard } from '../cards/BookedPlanCard';
import { EmptyPlanCard } from '../cards/EmptyPlanCard';
import { GroupPlanSummaryCard } from '../cards/GroupPlanSummaryCard';
import { priceTxt } from '../data/format';
import { EVENTS, VENUES } from '../data/listings';
import { Button } from '../design-system';
import { eyebrow, i3, icon, meta, sec, stop, thumb, tile } from '../ui/helpers';
import { Tap } from '../ui/Tap';

export function Plans(p) {
  var c = p.ctx,
    S = c.S,
    savedIds = Object.keys(S.saved);
  return (
    <div className="px col" style={{ padding: '52px 16px 140px', gap: '36px' }}>
      <div className="rel">
        {i3('ticket', 84, 'head-ic bob', { top: '-4px' })}
        {eyebrow('Next two weeks')}
        {stop('your plans')}
      </div>
      <div className="col" style={{ gap: '12px' }}>
        <span className="g-section-title">Booked</span>
        {c.plan ? <BookedPlanCard ctx={c} /> : <EmptyPlanCard ctx={c} />}
      </div>
      <div className="col" style={{ gap: '12px' }}>
        {sec(
          'Group plans',
          <button
            type="button"
            className="link-btn"
            onClick={() =>
              c.go('newplan', { draft: { opts: [], deadline: 'Thu 6 pm', name: 'Friday plan' } })
            }
          >
            Start a plan{icon('chevron-right', 16)}
          </button>
        )}
        {S.gp ? <GroupPlanSummaryCard ctx={c} /> : meta('No group plans yet.')}
      </div>
      <div className="col" style={{ gap: '4px' }}>
        <span className="g-section-title">Saved</span>
        {savedIds.length
          ? savedIds.map((k) => {
              var x = EVENTS[k];
              return (
                <Tap
                  onClick={() => c.openEvent(k)}
                  key={k}
                  className="tap rowc"
                  style={{ gap: '12px', minHeight: '72px' }}
                  aria-label={x.title}
                >
                  {thumb(x, 64)}
                  <div className="col" style={{ gap: '2px', flexGrow: 1 }}>
                    <span className="title16">{x.title}</span>
                    {meta(x.date + ' · ' + VENUES[x.venue].name + ' · ' + priceTxt(x))}
                  </div>
                  <Button
                    variant="subtle"
                    size="sm"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      c.openEvent(k, 'list');
                    }}
                  >
                    Book
                  </Button>
                </Tap>
              );
            })
          : meta('Nothing saved yet. Tap the heart on a night to keep it here.')}
      </div>
      <div className="col" style={{ gap: '4px' }}>
        <span className="g-section-title">Past nights</span>
        <Tap onClick={() => c.go('recap')} className="tap rowc" style={{ gap: '12px', minHeight: '72px' }}>
          {tile('memories', 'yellow', 64)}
          <div className="col" style={{ gap: '2px', flexGrow: 1 }}>
            <span className="title16">Last Friday</span>
            {meta('Sample recap')}
          </div>
          {icon('chevron-right')}
        </Tap>
      </div>
    </div>
  );
}

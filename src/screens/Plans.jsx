import { TicketStack } from '../cards/TicketStack';
import { GroupPlanSummaryCard } from '../cards/GroupPlanSummaryCard';
import { priceTxt } from '../data/format';
import { useRef } from 'react';
import { EVENTS, VENUES, isPast } from '../data/listings';
import { Button, IconButton } from '../design-system';
import { useFlip } from '../lib/motion';
import { SwipeRow } from '../ui/SwipeRow';
import { eyebrow, i3, icon, meta, sec, stop, thumb } from '../ui/helpers';
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
        <span className="g-section-title">Your tickets</span>
        <TicketStack ctx={c} />
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
        {S.gp && S.gp.stage !== 'cancelled' ? <GroupPlanSummaryCard ctx={c} /> : meta('No group plans yet')}
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
          : meta('Nothing saved yet. Tap the heart on a night to keep it here')}
      </div>
      <PastNights ctx={c} />
    </div>
  );
}

/* the nights you've been to, newest first: yours, then sample ones while you have none */
export function pastNights(S) {
  var mine = (S.pastNights || []).concat(
      Object.keys(S.myBookings || {}).filter((k) => EVENTS[k] && isPast(EVENTS[k]))
    ),
    seen = {},
    list = mine
      .filter((k) => EVENTS[k] && !seen[k] && (seen[k] = 1))
      .map((k) => ({ id: k, sample: false }));
  if (!list.length)
    list = Object.keys(EVENTS)
      .filter((k) => isPast(EVENTS[k]) && !EVENTS[k].org)
      .sort((a, b) => new Date(EVENTS[b].iso) - new Date(EVENTS[a].iso))
      .slice(0, 3)
      .map((k) => ({ id: k, sample: true }));
  return list.filter((x) => (S.pastHidden || []).indexOf(x.id) < 0);
}

/* Past nights (spec 6.10): swipe one left to remove it, with Undo; the same action is in its "…" menu */
function PastNights(p) {
  var c = p.ctx,
    S = c.S,
    list = pastNights(S),
    box = useRef(null);
  // the rows below a removed one glide up into its place
  useFlip(box, list.map((x) => x.id).join());
  return (
    <div ref={box} className="col" style={{ gap: '4px' }}>
      <span className="g-section-title">Past nights</span>
      {list.length
        ? list.map((x) => {
            var e = EVENTS[x.id];
            return (
              <SwipeRow key={x.id} flip={'past-' + x.id} onRemove={() => c.removePast(x.id)}>
                <div className="rowc past-row">
                  <Tap
                    onClick={() => c.go('recap', { recapId: x.id })}
                    className="tap rowc"
                    style={{ gap: '12px', flexGrow: 1, minWidth: 0, minHeight: '72px' }}
                    aria-label={e.title}
                  >
                    {thumb(e, 64)}
                    <div className="col" style={{ gap: '2px', flexGrow: 1, minWidth: 0 }}>
                      <span className="title16">{e.title}</span>
                      {meta(e.date + ' · ' + VENUES[e.venue].name + (x.sample ? ' · Sample data' : ''))}
                    </div>
                  </Tap>
                  <IconButton icon="ellipsis" label={'More for ' + e.title} onClick={() => c.set({ sheet: 'pastmenu', pastSel: x.id })} />
                </div>
              </SwipeRow>
            );
          })
        : meta('Nights you go to land here, with the day-after card')}
    </div>
  );
}

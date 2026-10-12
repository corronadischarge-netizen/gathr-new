import { useState } from 'react';
import { APP_URL } from '../config';
import { EVENTS, VENUES, isPast } from '../data/listings';
import { Button, Ticket } from '../design-system';
import { EmptyPlanCard } from './EmptyPlanCard';
import { shareToast } from '../lib/utils';
import { ticketProps } from '../lib/ticket';
import { Share } from '../services/share';
import { meta } from '../ui/helpers';

/* where the tickets behind the front one sit: fanned and tilted, at most three of them (four in the stack) */
const BEHIND = [
  { x: -44, y: 18, r: -9 },
  { x: 44, y: 26, r: 8 },
  { x: 8, y: 40, r: 14 }
];

/* Plans: your upcoming tickets as a stack. Tap one behind to bring it to the front; tap the front one for its pass */
export function TicketStack(p) {
  var c = p.ctx,
    S = c.S,
    mine = S.myBookings || {};
  // your plan first, then any other upcoming nights you've booked, soonest first
  var ids = Object.keys(mine)
    .filter((k) => k !== S.planned && EVENTS[k] && !isPast(EVENTS[k]))
    .sort((a, b) => new Date(EVENTS[a].iso) - new Date(EVENTS[b].iso));
  if (c.plan) ids.unshift(c.plan.id);
  ids = ids.slice(0, 4);
  var [front, setFront] = useState(null);
  if (!ids.length) return <EmptyPlanCard ctx={c} />;
  var top = ids.indexOf(front) > 0 ? front : ids[0];
  var order = [top].concat(ids.filter((k) => k !== top));
  var e = EVENTS[top],
    passes = top === S.planned ? S.guests : (mine[top] && mine[top].passes) || 1;

  // the pass and Get ready follow your plan, so opening another night's ticket makes it the plan
  function open(scr) {
    if (top !== S.planned) c.set({ planned: top, guests: passes, onList: true });
    c.go(scr);
  }
  function share() {
    var v = VENUES[e.venue];
    Share.link(e.title, 'Got my ticket for ' + e.title + ' · ' + v.name + ' · ' + e.date + ' ' + e.time, APP_URL + '#e=' + e.id).then(
      (r) => {
        var t = shareToast(r, 'Link');
        if (t) c.toast(t);
      },
      () => c.toast('Couldn’t share. Try again')
    );
  }

  return (
    <div className="col" style={{ gap: '16px' }}>
      <div className={'tk-stack' + (ids.length > 1 ? '' : ' is-single')}>
        {order
          .map((k, i) => {
            var pos = i ? BEHIND[i - 1] : { x: 0, y: 0, r: 0 },
              x = EVENTS[k];
            return (
              <button
                key={k}
                type="button"
                className={'tk-slot' + (i ? '' : ' is-front')}
                style={{ zIndex: 4 - i, transform: 'translateX(-50%) translate(' + pos.x + 'px, ' + pos.y + 'px) rotate(' + pos.r + 'deg)' }}
                aria-label={i ? 'Show the ticket for ' + x.title : 'Open the pass for ' + x.title}
                onClick={() => (i ? setFront(k) : open('pass'))}
              >
                <Ticket {...ticketProps(S, x, k === S.planned ? S.guests : (mine[k] && mine[k].passes) || 1)} scale={i ? 0.84 : 0.92} />
              </button>
            );
          })}
      </div>
      <div className="col" style={{ gap: '12px', alignItems: 'stretch' }}>
        {meta(
          (passes > 1 ? 'You + ' + (passes - 1) : 'Just you') +
            (ids.length > 1 ? ' · Tap one behind to bring it forward' : ' · Tap the ticket for your pass'),
          { textAlign: 'center' }
        )}
        <div className="rowc" style={{ gap: '8px' }}>
          <Button variant="primary" icon="send" block onClick={share}>
            Share ticket
          </Button>
          <Button variant="subtle" iconRight="chevron-right" block onClick={() => open('ready')}>
            Get ready
          </Button>
        </div>
      </div>
    </div>
  );
}

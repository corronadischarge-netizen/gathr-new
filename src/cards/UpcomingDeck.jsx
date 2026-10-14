import { useState } from 'react';
import { EVENTS, isPast } from '../data/listings';
import { Button, CardDeck, StoryCard } from '../design-system';
import { nightCard, shareNight } from '../lib/shareNight';
import { meta } from '../ui/helpers';
import { Tap } from '../ui/Tap';
import { EmptyPlanCard } from './EmptyPlanCard';

/* Plans (r25): your upcoming booked nights as StoryCards in a CardDeck, soonest first. Tap or swipe to bring one into
   focus; tap the one in focus for its pass. Share and Get ready act on the night in focus */
export function UpcomingDeck(p) {
  var c = p.ctx,
    S = c.S,
    mine = S.myBookings || {};
  var ids = Object.keys(mine).filter((k) => EVENTS[k] && !isPast(EVENTS[k]));
  if (c.plan && ids.indexOf(c.plan.id) < 0 && !isPast(c.plan)) ids.push(c.plan.id);
  ids = ids.sort((a, b) => new Date(EVENTS[a].iso) - new Date(EVENTS[b].iso)).slice(0, 4);
  const [at, setAt] = useState(0);
  if (!ids.length) return <EmptyPlanCard ctx={c} />;
  var top = ids[Math.min(at, ids.length - 1)],
    e = EVENTS[top],
    passes = top === S.planned ? S.guests : (mine[top] && mine[top].passes) || 1;

  // the pass and Get ready follow your plan, so opening another night's pass makes it the plan
  function open(scr) {
    if (top !== S.planned) c.set({ planned: top, guests: passes, onList: true });
    c.go(scr);
  }

  return (
    <div className="col" style={{ gap: '16px' }}>
      <div className="up-deck">
        <CardDeck active={Math.min(at, ids.length - 1)} onChange={setAt}>
          {ids.map((k, i) => {
            var x = EVENTS[k],
              focus = k === top;
            return (
              <Tap
                key={k}
                className="tap up-card"
                aria-label={focus ? 'Open the pass for ' + x.title : 'Show ' + x.title}
                onClick={() => (focus ? open('pass') : setAt(i))}
              >
                <StoryCard {...nightCard(S, x)} />
              </Tap>
            );
          })}
        </CardDeck>
      </div>
      <div className="col" style={{ gap: '12px', alignItems: 'stretch' }}>
        {meta(ids.length > 1 ? 'Swipe for your other nights · Tap the card for your pass' : 'Tap the card for your pass', {
          textAlign: 'center'
        })}
        <div className="rowc" style={{ gap: '8px' }}>
          <Button variant="primary" icon="send" block disabled={S.busy === 'story'} onClick={() => shareNight(c, e)}>
            {S.busy === 'story' ? 'Making your card…' : 'Share'}
          </Button>
          <Button variant="subtle" iconRight="chevron-right" block onClick={() => open('ready')}>
            Get ready
          </Button>
        </div>
      </div>
    </div>
  );
}

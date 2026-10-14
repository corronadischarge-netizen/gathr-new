import { DayAfterCard } from '../cards/DayAfterCard';
import { RateNightCard } from '../cards/RateNightCard';
import { EVENTS, VENUES, upcoming } from '../data/listings';
import { Bloom, Button, IconButton, Wordmark } from '../design-system';
import { i3, stop } from '../ui/helpers';

export function Recap(p) {
  // the night it's about: the one you opened from Plans or Updates, else your last night
  var c = p.ctx,
    S = c.S,
    e = EVENTS[S.recapId] || EVENTS[(S.pastNights || [])[0]] || c.plan || c.ev;
  var nx = upcoming().filter((k) => k !== e.id)[0];
  return (
    <div className="full col" style={{ padding: '52px 16px 24px', gap: '20px' }}>
      <Bloom recipe="comedown" at="low" />
      <div className="rel rowc between">
        <IconButton icon="arrow-left" label="Back" variant="glass" onClick={c.back} />
        <Wordmark size={22} tone="light" />
        <span style={{ width: '48px' }} />
      </div>
      <div className="rel">
        {i3('memories', 96, 'head-ic bob', { top: '-8px' })}
        <span className="g-accent" style={{ color: 'var(--ink-muted)' }}>
          {e.date.toLowerCase()}
        </span>
        {stop(['your night,', <br key="b" />, 'wrapped'])}
      </div>
      {/* one card at a time (spec 6.12): the day-after questions first, then the rating and follow card */}
      {((S.dayAfter || {})[e.id] || {}).done ? <RateNightCard ctx={c} e={e} /> : <DayAfterCard key={e.id} ctx={c} e={e} />}
      <div className="rel bottom-stack" style={{ alignItems: 'stretch' }}>
        <Button variant="primary" size="lg" block icon="share" onClick={() => c.go('wrapped')}>
          See your month, wrapped
        </Button>
        {nx ? (
          <Button variant="ghost" onClick={() => c.openEvent(nx)}>
            {'Next: ' + EVENTS[nx].title + ' at ' + VENUES[EVENTS[nx].venue].name}
          </Button>
        ) : (
          <Button variant="ghost" onClick={() => c.tab('tonight')}>
            See this week
          </Button>
        )}
      </div>
    </div>
  );
}

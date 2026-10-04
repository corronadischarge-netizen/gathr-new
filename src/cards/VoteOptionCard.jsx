import { priceTxt } from '../data/format';
import { EVENTS, VENUES } from '../data/listings';
import { Badge, CrowdMeter } from '../design-system';
import { meta, thumb } from '../ui/helpers';
import { Tap } from '../ui/Tap';

/* Group plan: one night up for the vote, with its vote bar and who voted for it. Tap to vote. */
export function VoteOptionCard(p) {
  var c = p.ctx,
    S = c.S,
    gp = S.gp,
    k = p.id;
  var e = EVENTS[k],
    v = VENUES[e.venue],
    names = (gp.votes[k] || []).concat(S.vote === k ? ['Riya'] : []),
    mine = S.vote === k,
    lead = k === p.winner && names.length;
  return (
    <Tap
      onClick={() => c.set({ vote: k })}
      className={'tap g-card card col vote-card' + (mine ? ' picked' : '')}
      style={{ gap: '12px' }}
      aria-pressed={mine}
    >
      <div className="rowc" style={{ gap: '12px' }}>
        {thumb(e, 56)}
        <div className="col" style={{ gap: '2px', flexGrow: 1 }}>
          <span className="title16">{v.name + ' · ' + e.title}</span>
          {meta(e.date + ' · ' + priceTxt(e) + (e.age ? ' · ' + e.age + '+' : ''))}
        </div>
        {lead ? (
          <Badge tone="go" className="vote-lead">
            Leading
          </Badge>
        ) : null}
      </div>
      <div className="vote-bar">
        <i style={{ width: (names.length / p.groupSize) * 100 + '%' }} />
      </div>
      <div className="rowc between">
        <CrowdMeter level={v.crowd} compact />
        {names.length ? (
          <span key={names.join()} className="votes fade-up">
            {names.join(', ')}
          </span>
        ) : (
          meta('No votes yet')
        )}
      </div>
    </Tap>
  );
}

import { friendPhoto } from '../data/friends';
import { ME } from '../lib/plan';
import { priceTxt } from '../data/format';
import { EVENTS, VENUES, nightCrowd } from '../data/listings';
import { Avatar, Badge, CrowdMeter } from '../design-system';
import { meta, thumb } from '../ui/helpers';
import { Tap } from '../ui/Tap';

/* Group plan: one night up for the vote, with its vote bar and who voted for it. Tap to vote (spec 6.7): the bar grows
   to its new share (dur-slow), your face sits on the bar of your vote, and changing your vote moves the face (FLIP in
   the list, by data-flip). p.open: votes can still change */
export function VoteOptionCard(p) {
  var c = p.ctx,
    S = c.S,
    gp = S.gp,
    k = p.id;
  var e = EVENTS[k],
    v = VENUES[e.venue],
    names = (gp.votes[k] || []).concat(S.vote === k ? [ME] : []),
    mine = S.vote === k,
    lead = k === p.winner && names.length;
  return (
    <Tap
      onClick={() => (p.open === false ? null : c.planVote(k))}
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
      <div className="rowc vote-row">
        <div className="vote-bar">
          <i style={{ transform: 'translateX(' + ((names.length / p.groupSize) * 100 - 100) + '%)' }} />
        </div>
        <span className="vote-faces" aria-hidden="true">
          {names.map((n) => (
            <span key={n} data-flip={'face-' + n} className="vote-face">
              <Avatar name={n === ME ? S.me.name || ME : n} image={n === ME ? S.me.photo : friendPhoto(n)} size={24} />
            </span>
          ))}
        </span>
      </div>
      <div className="rowc between">
        <CrowdMeter booked={nightCrowd(e).booked} cap={nightCrowd(e).cap} level={nightCrowd(e).level} compact />
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

import { EVENTS } from '../data/listings';
import { gpVoted } from '../data/sample';
import { ShapeAvatar } from '../design-system';
import { i3, icon } from '../ui/helpers';
import { Tap } from '../ui/Tap';

/* This week: your group plan, with the vote count or booking status */
export function GroupPlanCard(p) {
  var c = p.ctx,
    S = c.S;
  return (
    <Tap
      onClick={() => c.go('group')}
      className="tap plan-card hue-violet"
      aria-label={S.gp ? S.gp.name : 'Group plan'}
    >
      <div className="col" style={{ gap: '6px', position: 'relative', zIndex: 1 }}>
        <span className="plan-kicker">
          {S.gp && S.gp.stage === 'booked' ? 'Your group is going' : 'Going with your group?'}
        </span>
        <span className="plan-title">{S.gp ? S.gp.name : 'Start a plan'}</span>
        <span className="plan-meta">
          {!S.gp
            ? 'Vote together, book once'
            : S.gp.stage === 'booked'
              ? EVENTS[S.gp.booked].title + ' · everyone has a pass'
              : S.gp.opts.length +
                ' options · ' +
                Object.keys(gpVoted(S.gp, S.vote)).length +
                ' of 5 voted · closes ' +
                S.gp.deadline}
        </span>
        <div className="plan-crew">
          {[
            ['Zoya', 'flower', 'pink'],
            ['Aman', 'arch', 'yellow'],
            ['Kavya', 'circle', 'green'],
            ['Kabir', 'pill', 'blue']
          ].map((x) => (
            <ShapeAvatar key={x[0]} shape={x[1]} hue={x[2]} name={x[0]} size={36} />
          ))}
          <span className="plan-go">
            {S.gp && S.gp.stage === 'booked' ? 'Open' : S.vote ? 'See votes' : 'Vote'}
            {icon('arrow-right', 16)}
          </span>
        </div>
      </div>
      {i3('champagne', 132, 'plan-ic')}
    </Tap>
  );
}

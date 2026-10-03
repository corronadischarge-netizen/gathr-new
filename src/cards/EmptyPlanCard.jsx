import { Button } from '../design-system';
import { i3, meta } from '../ui/helpers';

/* Plans: shown when nothing is booked yet */
export function EmptyPlanCard(p) {
  var c = p.ctx;
  return (
    <div className="g-card card col rel empty-plan" style={{ gap: '12px' }}>
      {i3('champagne', 96, 'empty-ic')}
      <span className="title16">Nothing booked yet</span>
      {meta('Book a night, or start a plan with your group.')}
      <div className="rowc" style={{ gap: '8px' }}>
        <Button variant="primary" size="sm" onClick={() => c.tab('tonight')}>
          See this week
        </Button>
        <Button variant="subtle" size="sm" onClick={() => c.go('group')}>
          Start a group plan
        </Button>
      </div>
    </div>
  );
}

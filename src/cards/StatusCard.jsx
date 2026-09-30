import { rupees } from '../data/format';
import { levelOf, nextLevel, nightsCount } from '../data/sample';
import { i3, meta } from '../ui/helpers';

/* You: your status level, progress to the next one, its perks and your planner credit */
export function StatusCard(p) {
  var S = p.ctx.S,
    n = nightsCount(S),
    lv = levelOf(n),
    nx = nextLevel(n);
  return (
    <div className="status-card">
      <div className="rowc between">
        <div className="col" style={{ gap: '2px' }}>
          <span className="status-lv">{lv[0]}</span>
          {meta(n + ' nights out with gathr')}
        </div>
        {i3('wristband', 72)}
      </div>
      {nx ? (
        <div className="col" style={{ gap: '6px' }}>
          <div className="prog">
            <i style={{ width: Math.round(((n - lv[1]) / (nx[1] - lv[1])) * 100) + '%' }} />
          </div>
          {meta(nx[1] - n + ' more nights to ' + nx[0])}
        </div>
      ) : null}
      <p className="body" style={{ margin: 0 }}>
        {lv[2] + '.'}
      </p>
      <div className="rowc between credit-row">
        <div className="col" style={{ gap: '2px' }}>
          <span className="title15">{rupees(S.credit) + ' planner credit'}</span>
          {meta('Earned by booking for your group. Used at checkout.')}
        </div>
        {i3('ticket', 44)}
      </div>
    </div>
  );
}

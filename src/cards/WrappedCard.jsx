import { MO } from '../data/dates';
import { REC } from '../data/sample';
import { i3 } from '../ui/helpers';

/* Wrapped: the month-in-review story card */
export function WrappedCard(p) {
  var S = p.ctx.S;
  return (
    <div className="wrap-card">
      {i3('discoball', 96, 'wc-ic1 bob')}
      {i3('vinyl', 80, 'wc-ic2 bob', { animationDelay: '-1.5s' })}
      <span className="wc-kick">
        {(S.me.name ? S.me.name.split(' ')[0].toLowerCase() + '’s ' : 'your ') +
          MO[new Date().getMonth()].toLowerCase()}
      </span>
      <span className="wc-big">{String(REC.length)}</span>
      <span className="wc-lbl">nights out in Pune</span>
      <div className="wc-grid">
        <div>
          <span className="wc-k">Top venue</span>
          <span className="wc-v">Kukoo</span>
        </div>
        <div>
          <span className="wc-k">Top sound</span>
          <span className="wc-v">Bollywood</span>
        </div>
        <div>
          <span className="wc-k">Your crew</span>
          <span className="wc-v">{'Zoya & Aman'}</span>
        </div>
        <div>
          <span className="wc-k">Status</span>
          <span className="wc-v">Regular</span>
        </div>
      </div>
      <span className="wc-foot">gathr. · pune after dark</span>
    </div>
  );
}

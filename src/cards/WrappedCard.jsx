import { MO } from '../data/dates';
import { REC } from '../data/sample';
import { Bloom } from '../design-system';

/* Wrapped: the month-in-review story card. A recap is one of the bloom's occasions: the gathr gradient rises from the
   bottom; the words stay in the dark top half (Bloom README). No 3D objects */
export function WrappedCard(p) {
  var S = p.ctx.S;
  return (
    <div className="wrap-card">
      <Bloom recipe="uv" at="low" still />
      <span className="wc-kick">
        {(S.me.name ? S.me.name.split(' ')[0].toLowerCase() + '’s ' : 'your ') +
          MO[new Date().getMonth()].toLowerCase()}
      </span>
      <span className="wc-big">{String(REC.length)}</span>
      <span className="wc-lbl">nights out in Pune</span>
      <div className="wc-grid">
        <div>
          <span className="wc-k">Top venue</span>
          <span className="wc-v">The Millers</span>
        </div>
        <div>
          <span className="wc-k">Top sound</span>
          <span className="wc-v">Retro</span>
        </div>
        <div>
          <span className="wc-k">Your crew</span>
          <span className="wc-v">{'Dev & Arjun'}</span>
        </div>
        <div>
          <span className="wc-k">Status</span>
          <span className="wc-v">Regular</span>
        </div>
      </div>
    </div>
  );
}

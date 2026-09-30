import { cx, fillOf, textOn } from './utils';

export function PillChain(p) {
  return (
    <div className={cx('g-chain', p.className)} style={p.scale ? { fontSize: p.scale * 16 + 'px' } : null}>
      {(p.rows || []).map((row, r) => (
        <div key={r} className="g-chain-row">
          {row.map((s, i) => {
            if (s.echo) {
              return (
                <span key={i} className="g-chain-echo" aria-hidden="true">
                  {[1, 0.8, 0.6, 0.42, 0.26].map((o, j) => (
                    <span key={j} style={{ background: 'var(--' + s.echo + '-300)', opacity: o }} />
                  ))}
                </span>
              );
            }
            var tone = s.tone || 'white';
            var st =
              tone === 'white'
                ? { background: 'var(--night-50)', color: 'var(--night-950)' }
                : tone === 'outline'
                  ? { boxShadow: 'inset 0 0 0 0.12em var(--night-50)', color: 'var(--night-50)' }
                  : { background: fillOf(tone), color: textOn(tone) };
            return (
              <span
                key={i}
                className={cx('g-chain-pill', (s.arrow || s.round) && 'g-chain-round')}
                style={st}
              >
                {s.arrow ? '→' : s.label}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

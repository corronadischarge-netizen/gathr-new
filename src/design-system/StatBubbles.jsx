import { cx, fillOf, textOn } from './utils';

export function StatBubbles(p) {
  var items = p.items || [],
    max = Math.max.apply(null, items.map((i) => i.value).concat([1]));
  var big = p.size || 200;
  return (
    <div className={cx('g-bubbles', p.className)}>
      {items.map((it, i) => {
        var d = Math.max(56, Math.round(big * Math.sqrt(it.value / max)));
        return (
          <div key={i} className="g-bubble-item">
            <span
              className="g-bubble"
              style={{
                width: d + 'px',
                height: d + 'px',
                background: fillOf(it.hue || 'violet'),
                color: textOn(it.hue || 'violet'),
                fontSize: Math.max(16, d * 0.28) + 'px'
              }}
            >
              {it.display || it.value}
            </span>
            {it.label ? <span className="g-bubble-label">{it.label}</span> : null}
          </div>
        );
      })}
    </div>
  );
}

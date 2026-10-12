import { Icon } from './Icon';
import { cx } from './utils';

/* Labelled rows: icon circle, 13px label, 16px value on the right edge (strong: a price, Jakarta 700 20px). bare = rows only, no card */
export function FactList(p) {
  var list = (
    <div className="g-facts">
      {(p.rows || []).map((r, i) => (
        <div key={i} className="g-fact">
          <span className="g-fact-ic" aria-hidden="true">
            <Icon name={r.icon || 'info'} size={16} />
          </span>
          <span className="g-fact-label">{r.label}</span>
          <span className={cx('g-fact-value', r.strong && 'is-strong')}>{r.value}</span>
        </div>
      ))}
    </div>
  );
  if (p.bare) return list;
  return (
    <section className={cx('g-factcard', p.className)}>
      {p.title ? <h2 className="g-factcard-title">{p.title}</h2> : null}
      {list}
      {p.note ? <p className="g-factcard-note">{p.note}</p> : null}
    </section>
  );
}

import { cx } from './utils';

export function PageIndicator(p) {
  var n = p.count || 4,
    a = p.active || 0,
    out = [];
  for (var i = 0; i < n; i++)
    out.push(<span key={i} className={cx('g-pager-seg', i === a && 'is-active')} />);
  return (
    <div className={cx('g-pager', p.className)} role="img" aria-label={'Item ' + (a + 1) + ' of ' + n}>
      {out}
    </div>
  );
}

import { cx } from './utils';

export function ProgressBar(p) {
  var step = p.step || 1,
    total = p.total || 4;
  return (
    <div
      className={cx('g-progress', p.className)}
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={step}
      aria-label={'Step ' + step + ' of ' + total}
    >
      <span style={{ width: (step / total) * 100 + '%' }} />
    </div>
  );
}

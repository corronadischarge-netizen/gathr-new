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
      {/* the fill slides in from the left (transform only), so its rounded end looks the same at any step */}
      <span style={{ transform: 'translateX(' + ((step / total) * 100 - 100) + '%)' }} />
    </div>
  );
}

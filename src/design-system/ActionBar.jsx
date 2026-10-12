import { Button } from './Button';
import { IconButton } from './IconButton';
import { cx } from './utils';

/* One row at the bottom of a detail screen: up to two round icon buttons (each with a label) beside one
   full-width main button. The main button is violet when it books, white otherwise. */
export function ActionBar(p) {
  var m = p.main || {};
  return (
    <div className={cx('g-actionbar', p.className)}>
      {(p.icons || []).slice(0, 2).map((b, i) => (
        <IconButton key={i} variant="solid" icon={b.icon} label={b.label} onClick={b.onClick} className="g-actionbar-ic" />
      ))}
      <Button
        variant={m.variant || 'brand'}
        size="lg"
        icon={m.icon}
        disabled={!!m.disabled}
        onClick={m.onClick}
        className="g-actionbar-main"
      >
        {m.label || 'Get passes'}
      </Button>
    </div>
  );
}

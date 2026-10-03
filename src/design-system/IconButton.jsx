import { Icon } from './Icon';
import { cx, rest } from './utils';

export function IconButton(p) {
  var o = rest(p, ['variant', 'icon', 'label', 'size', 'className', 'active']);
  return (
    <button
      type="button"
      aria-label={p.label}
      {...o}
      className={cx('g-ibtn', 'g-ibtn-' + (p.variant || 'glass'), p.active && 'is-active', p.className)}
      style={p.size ? { width: p.size + 'px', height: p.size + 'px' } : undefined}
    >
      <Icon name={p.icon} size={22} />
    </button>
  );
}

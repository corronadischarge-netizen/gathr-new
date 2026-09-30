import { Icon } from './Icon';
import { cx, rest } from './utils';

export function Button(p) {
  var variant = p.variant || 'primary',
    size = p.size || 'md';
  var o = rest(p, ['variant', 'size', 'icon', 'iconRight', 'block', 'className', 'children']);
  var is = size === 'sm' ? 16 : 20;
  return (
    <button
      type="button"
      {...o}
      className={cx('g-btn', 'g-btn-' + variant, 'g-btn-' + size, p.block && 'g-btn-block', p.className)}
    >
      {p.icon ? <Icon name={p.icon} size={is} /> : null}
      <span>{p.children}</span>
      {p.iconRight ? <Icon name={p.iconRight} size={is} /> : null}
    </button>
  );
}

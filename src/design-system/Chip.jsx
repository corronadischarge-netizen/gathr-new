import { Icon } from './Icon';
import { cx, rest } from './utils';

export function Chip(p) {
  var o = rest(p, ['selected', 'icon', 'className', 'children']);
  return (
    <button
      type="button"
      aria-pressed={!!p.selected}
      {...o}
      className={cx('g-chip', p.selected && 'is-selected', p.className)}
    >
      {p.icon ? <Icon name={p.icon} size={16} /> : null}
      <span>{p.children}</span>
    </button>
  );
}

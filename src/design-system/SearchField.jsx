import { Icon } from './Icon';
import { cx, rest } from './utils';

export function SearchField(p) {
  var o = rest(p, ['className', 'placeholder']);
  return (
    <label className={cx('g-search', p.className)}>
      <Icon name="search" size={20} />
      <input type="search" placeholder={p.placeholder || 'Search venues, artists, areas'} {...o} />
    </label>
  );
}

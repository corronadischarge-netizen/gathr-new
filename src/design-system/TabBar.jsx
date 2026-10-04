import { Icon } from './Icon';
import { TabIndicator } from './TabIndicator';
import { cx } from './utils';

const TABS = [
  ['tonight', 'moon', 'Tonight'],
  ['map', 'map', 'Map'],
  ['search', 'search', 'Search'],
  ['plans', 'calendar', 'Plans'],
  ['you', 'user', 'You']
];

export function TabBar(p) {
  var active = p.active || 'tonight';
  return (
    <nav className={cx('g-tabbar', p.className)} aria-label="Main">
      <TabIndicator active={active} />
      {TABS.map((t) => {
        var on = active === t[0];
        return (
          <button
            key={t[0]}
            type="button"
            className={cx('g-tab', on && 'is-active')}
            aria-label={t[2]}
            aria-current={on ? 'page' : undefined}
            onClick={
              p.onChange
                ? () => {
                    p.onChange(t[0]);
                  }
                : undefined
            }
          >
            <Icon name={t[1]} size={24} />
          </button>
        );
      })}
    </nav>
  );
}

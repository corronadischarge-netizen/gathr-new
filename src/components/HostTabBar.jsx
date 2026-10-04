import { TabIndicator } from '../design-system';
import { icon, svgIcon } from '../ui/helpers';

/* ================= HOST MODE =================
     One account, two modes. Hosting swaps the tab bar for door tools; switching back is one tap. */
export const SCAN_IC = [
  'M4 8V6a2 2 0 0 1 2-2h2',
  'M16 4h2a2 2 0 0 1 2 2v2',
  'M20 16v2a2 2 0 0 1-2 2h-2',
  'M8 20H6a2 2 0 0 1-2-2v-2',
  'M7 12h10'
];

export const HOST_TABS = [
  ['hostdoor', 'Door', SCAN_IC],
  ['orghome', 'Nights', null, 'calendar'],
  ['hostguests', 'Guests', null, 'users'],
  ['hostprofile', 'Profile', null, 'user']
];

export function HostTabBar(p) {
  return (
    <nav className="g-tabbar host-tabbar" aria-label="Hosting">
      <TabIndicator active={p.active} />
      {HOST_TABS.map((t) => {
        var on = p.active === t[0];
        return (
          <button
            key={t[0]}
            type="button"
            className={'g-tab' + (on ? ' is-active' : '')}
            aria-label={t[1]}
            aria-current={on ? 'page' : undefined}
            onClick={() => p.onChange(t[0])}
          >
            {t[2] ? svgIcon(t[2], 24) : icon(t[3], 24)}
          </button>
        );
      })}
    </nav>
  );
}

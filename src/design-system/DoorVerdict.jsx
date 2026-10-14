import { formatSource } from '../lib/door';
import { now } from '../lib/clock';
import { useSwap } from '../lib/motion';
import { Button } from './Button';
import { Icon } from './Icon';
import { TagPill } from './TagPill';
import { cx } from './utils';

const ICON = { yes: 'check', if: 'check', unknown: 'info', no: 'x' };
const TONE = { yes: 'go', if: 'light', unknown: 'dark', no: 'dark' };

/* Will they let us in? For the group set in Going as, always in words (the colour only repeats it).
   look 'pill' (hero card, event page: TagPill, "Ask the venue" beside it for unknown, the short source under it, r25)
   or 'line' (tiles and rows: icon 16 + words) */
export function DoorVerdict(p) {
  var state = p.state || 'unknown',
    icon = p.icon || ICON[state],
    // when the group changes, the icon and words cross-fade together (interactions spec 5); never colour alone
    swap = useSwap(state + '|' + p.text);
  if (p.look === 'line')
    return (
      <span key={swap} className={cx('g-dv', 'g-dv-line', 'is-' + state, swap && 'g-swap', p.className)}>
        <Icon name={icon} size={16} />
        <span className="g-dv-text">
          <span className="g-sr">Door: </span>
          {p.text}
        </span>
      </span>
    );
  var src = p.showSource === false ? null : formatSource(p.source, now());
  return (
    <div key={swap} className={cx('g-dv', 'g-dv-pill', 'is-' + state, swap && 'g-swap', p.className)}>
      <div className="g-dv-row">
        <TagPill tone={TONE[state]} icon={icon} className="g-dv-tag">
          <span className="g-sr">Door: </span>
          {p.text}
        </TagPill>
        {state === 'unknown' && p.onAsk ? (
          <Button variant="subtle" size="sm" onClick={p.onAsk}>
            Ask the venue
          </Button>
        ) : null}
      </div>
      {src ? <span className="g-dv-src">{src}</span> : null}
    </div>
  );
}

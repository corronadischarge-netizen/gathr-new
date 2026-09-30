import { EVENTS } from '../data/listings';
import { Chip } from '../design-system';

export function NightPicker(p) {
  var c = p.ctx,
    list = p.list,
    cur = p.cur;
  if (list.length < 2) return null;
  return (
    <div
      className="hscroll"
      role="radiogroup"
      aria-label="Night"
      style={{ margin: '0 -16px', padding: '0 16px' }}
    >
      {list.map((k) => {
        var e = EVENTS[k];
        return (
          <Chip
            key={k}
            role="radio"
            aria-checked={k === cur}
            selected={k === cur}
            onClick={() => c.set({ hostNight: k })}
          >
            {e.date.split(' ').slice(0, 2).join(' ') + ' · ' + e.title}
          </Chip>
        );
      })}
    </div>
  );
}

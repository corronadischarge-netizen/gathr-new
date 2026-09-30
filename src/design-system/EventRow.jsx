import { Badge } from './Badge';
import { IconButton } from './IconButton';
import { Media } from './Media';
import { cx } from './utils';

export function EventRow(p) {
  var st = {
    soldout: ['limit', 'Sold out'],
    filling: ['now', 'Filling fast'],
    onlist: ['go', 'On the list']
  }[p.status];
  return (
    <div className={cx('g-event', p.className)}>
      <Media image={p.image} neutral className="g-event-thumb" />
      <div className="g-event-main">
        <div className="g-event-title">{p.title}</div>
        <div className="g-event-meta">
          {[p.day && p.time ? p.day + ' ' + p.time : p.time, p.venue, p.price].filter(Boolean).join(' · ')}
        </div>
      </div>
      {st ? (
        <Badge tone={st[0]}>{st[1]}</Badge>
      ) : (
        <IconButton variant="solid" icon="chevron-right" label="Open" size={40} />
      )}
    </div>
  );
}

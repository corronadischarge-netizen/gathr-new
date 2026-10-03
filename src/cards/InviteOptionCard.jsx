import { priceTxt } from '../data/format';
import { EVENTS, VENUES } from '../data/listings';
import { meta, thumb } from '../ui/helpers';
import { Tap } from '../ui/Tap';

/* Plan invite: one night a friend can pick. Works like a radio button. */
export function InviteOptionCard(p) {
  var e = EVENTS[p.id],
    v = VENUES[e.venue];
  return (
    <Tap
      onClick={p.onPick}
      role="radio"
      aria-checked={p.picked}
      className={'tap g-card card col vote-card' + (p.picked ? ' picked' : '')}
      style={{ gap: '10px' }}
    >
      <div className="rowc" style={{ gap: '12px' }}>
        {thumb(e, 56)}
        <div className="col" style={{ gap: '2px', flexGrow: 1 }}>
          <span className="title16">{v.name + ' · ' + e.title}</span>
          {meta(e.date + ' · ' + priceTxt(e) + (e.age ? ' · ' + e.age + '+' : ''))}
        </div>
      </div>
    </Tap>
  );
}

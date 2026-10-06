import { i3, svgIcon } from '../ui/helpers';

/* One-tap switch between going out and hosting, the same card in both directions:
   on You (going out) it switches to hosting; on the host's Profile (to="guest") it switches back. */
export function ModeSwitchCard(p) {
  var c = p.ctx,
    toGuest = p.to === 'guest',
    first = (c.S.me.name || '').split(' ')[0];
  return (
    <button type="button" className="mode-switch" onClick={toGuest ? c.toGuest : c.toHost}>
      <span className="mode-ic">{i3(toGuest ? 'discoball' : 'spotlight', 36)}</span>
      <span className="col" style={{ gap: '2px', flexGrow: 1, textAlign: 'left' }}>
        <span className="title15">{toGuest ? 'Switch to going out' : 'Switch to hosting'}</span>
        <span className="meta">
          {toGuest
            ? (first ? first + ' · ' : '') + 'your passes, plans and friends'
            : c.S.org.profile.name + ' · door, nights and guest lists'}
        </span>
      </span>
      {svgIcon(['M7 7h11l-3-3', 'M17 17H6l3 3'], 20)}
    </button>
  );
}

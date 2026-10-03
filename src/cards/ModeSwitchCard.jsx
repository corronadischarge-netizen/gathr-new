import { i3, svgIcon } from '../ui/helpers';

/* You: one-tap switch into hosting mode, shown once you have an organiser profile */
export function ModeSwitchCard(p) {
  var c = p.ctx;
  return (
    <button type="button" className="mode-switch" onClick={c.toHost}>
      <span className="mode-ic">{i3('spotlight', 36)}</span>
      <span className="col" style={{ gap: '2px', flexGrow: 1, textAlign: 'left' }}>
        <span className="title15">Switch to hosting</span>
        <span className="meta">{c.S.org.profile.name + ' · door, nights and guestlists'}</span>
      </span>
      {svgIcon(['M7 7h11l-3-3', 'M17 17H6l3 3'], 20)}
    </button>
  );
}

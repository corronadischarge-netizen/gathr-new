import { IconButton } from '../design-system';
import { icon, meta, note, tile } from '../ui/helpers';
import { Tap } from '../ui/Tap';

export function Notifs(p) {
  var c = p.ctx,
    S = c.S,
    items = [];
  if (S.saved.twin)
    items.push([
      ['ticket', 'pink'],
      'Twin Strings: tickets running low',
      'You saved this · Fri 9 Oct at Epitome · ₹1,299',
      () => {
        c.openEvent('twin', 'list');
      }
    ]);
  if (S.gp && S.gp.stage === 'voting')
    items.push([
      ['champagne', 'violet'],
      'Zoya voted for Lavish Friday',
      S.gp.name + ' · voting closes ' + S.gp.deadline,
      () => {
        c.go('group');
      }
    ]);
  items.push([
    ['sunglasses', 'blue'],
    'Ishaan wants to be friends',
    'He joined gathr from your plan link',
    () => {
      c.go('friendslist');
    }
  ]);
  Object.keys(S.follow).forEach((f) => {
    items.push([
      ['headphones', 'yellow'],
      f + ' announced a new night',
      'You follow ' + f + ' · see it first',
      () => {
        c.openEvent('twin');
      }
    ]);
  });
  items.push([
    ['camera', 'yellow'],
    'Rate your last night',
    'Your answer helps the next group decide',
    () => {
      c.go('recap');
    }
  ]);
  return (
    <div className="full col pad-top" style={{ gap: '24px' }}>
      <div>
        <IconButton icon="arrow-left" label="Back" variant="solid" onClick={c.back} />
      </div>
      <h1 className="g-display disp">Updates</h1>
      <div className="col">
        {items.map((it, i) => (
          <Tap
            onClick={it[3]}
            key={it[1]}
            className="tap rowc list-row fade-up"
            style={{ gap: '14px', '--d': i * 60 + 'ms' }}
          >
            {tile(it[0][0], it[0][1], 48)}
            <div className="col" style={{ gap: '2px', flexGrow: 1 }}>
              <span className="title15">{it[1]}</span>
              {meta(it[2])}
            </div>
            {icon('chevron-right')}
          </Tap>
        ))}
      </div>
      {note('Updates are sample data.')}
    </div>
  );
}

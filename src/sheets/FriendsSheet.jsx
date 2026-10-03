import { Button, Sheet } from '../design-system';
import { fav, icon, meta, note } from '../ui/helpers';

export function FriendsSheet(p) {
  var c = p.ctx,
    e = c.ev,
    fr = e.friends || [];
  return (
    <Sheet
      title={fr.length + (fr.length === 1 ? ' friend' : ' friends') + ' going'}
      subtitle="Friends who share their booked nights with you"
      onClose={() => c.set({ sheet: null })}
    >
      <div className="col">
        {fr.map((f) => (
          <div key={f} className="rowc list-row" style={{ gap: '12px' }}>
            {fav(f, 40)}
            <div className="col" style={{ flexGrow: 1 }}>
              <span className="title15">{f}</span>
              {meta('Booked this night')}
            </div>
          </div>
        ))}
      </div>
      <Button
        variant="primary"
        size="lg"
        block
        icon="ticket"
        onClick={() => c.set({ guests: 1, sheet: e.age >= 21 && !c.S.age ? 'age' : 'list', after: 'list' })}
      >
        Join them
      </Button>
      <Button
        variant="subtle"
        block
        icon="users"
        onClick={() => {
          c.set({ sheet: null });
          c.go('newplan', {
            draft: { opts: [e.id], deadline: 'Thu 6 pm', name: e.day === 'fri' ? 'Friday plan' : 'Night out' }
          });
        }}
      >
        Start a plan with them
      </Button>
      <button
        type="button"
        className="link-btn"
        style={{ alignSelf: 'center' }}
        onClick={() => {
          c.set({ sheet: null });
          c.go('friendslist');
        }}
      >
        How friends work{icon('chevron-right', 16)}
      </button>
      {note('Friends are sample data.')}
    </Sheet>
  );
}

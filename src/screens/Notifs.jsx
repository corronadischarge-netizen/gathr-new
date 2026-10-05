import { useEffect } from 'react';
import { EVENTS, VENUES } from '../data/listings';
import { IconButton } from '../design-system';
import { poss } from '../lib/utils';
import { openFrom } from '../services/push';
import { markRead } from '../services/remote';
import { icon, meta, note, tile } from '../ui/helpers';
import { Tap } from '../ui/Tap';

export function Notifs(p) {
  var c = p.ctx,
    S = c.S,
    items = [];
  // opening Updates reads your notifications
  useEffect(() => {
    var unread = (S.inbox || []).filter((n) => !n.read_at).map((n) => n.id);
    if (!unread.length) return;
    markRead(unread)
      .then(() =>
        c.set((o) => ({
          inbox: (o.inbox || []).map((n) =>
            unread.indexOf(n.id) >= 0 ? Object.assign({}, n, { read_at: 'now' }) : n
          )
        }))
      )
      .catch(() => {});
  }, []);
  // your nights and your organiser profile (guest lists show below, with whether you've taken your passes)
  var LOOK = {
    night_live: ['ticket', 'green'],
    night_back: ['megaphone', 'yellow'],
    verified: ['heart', 'violet']
  };
  (S.inbox || [])
    .filter((n) => LOOK[n.kind])
    .forEach((n) => {
      items.push([
        LOOK[n.kind],
        n.title,
        n.body,
        () => {
          openFrom(c, Object.assign({ kind: n.kind }, n.data));
        }
      ]);
    });
  // guest lists you're on: tapping opens the night with "Guest list" already picked
  (S.myGuestLists || []).forEach((g) => {
    var e = EVENTS[g.event];
    if (!e) return;
    items.push([
      ['wristband', 'green'],
      'You’re on ' + poss(g.owner) + ' guest list',
      e.title +
        ' · ' +
        e.date +
        (VENUES[e.venue] ? ' at ' + VENUES[e.venue].name : '') +
        ' · free entry' +
        (g.plusOnes.length ? ' for you + ' + g.plusOnes.length : '') +
        (g.bookingId ? ' · passes taken' : ''),
      () => {
        c.set({ bookMode: 'guest', bookList: g.listId });
        c.openEvent(g.event, 'list');
      }
    ]);
  });
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

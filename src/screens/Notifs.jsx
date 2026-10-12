import { useEffect } from 'react';
import { IMAGES_3D } from '../assets/images';
import { EVENTS, VENUES } from '../data/listings';
import { IconButton, Update, UpdateGroup } from '../design-system';
import { poss } from '../lib/utils';
import { openFrom } from '../services/push';
import { markRead } from '../services/remote';
import { meta, note } from '../ui/helpers';

/* "5m", "2h", "1d", "3w": how long ago, for the end of the meta line */
function ago(iso) {
  var m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  return m < 60 ? Math.max(1, m) + 'm' : m < 1440 ? Math.round(m / 60) + 'h' : m < 10080 ? Math.round(m / 1440) + 'd' : Math.round(m / 10080) + 'w';
}

/* a night's 3D object (its venue's), for the lead */
function nightObject(e) {
  var v = e && VENUES[e.venue];
  return v && IMAGES_3D[v.ic];
}

const noStop = (t) => (t || '').replace(/\.\s*$/, '');

// the statuses of one night replace each other: only the newest shows
const NIGHT_KINDS = ['night_submitted', 'night_review', 'night_live', 'night_back', 'night_rejected', 'night_reported'];

export function Notifs(p) {
  var c = p.ctx,
    S = c.S,
    hidden = S.upHidden || [],
    rows = [],
    sample = false;
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

  function hide(key, t) {
    c.set((o) => ({ upHidden: (o.upHidden || []).concat(key) }));
    // declining is quiet: the other person isn't told, and there's an Undo
    c.toast(t, {
      label: 'Undo',
      run: () => c.set((o) => ({ upHidden: (o.upHidden || []).filter((k) => k !== key), toast: null }))
    });
  }

  /* ---- your account's notifications (nights you host, gathr checks, promoter invites) ---- */
  var nightSeen = {};
  (S.inbox || []).forEach((n) => {
    var d = n.data || {},
      open = () => openFrom(c, Object.assign({ kind: n.kind }, d)),
      e = d.event_id && EVENTS[d.event_id],
      when = n.created_at ? ago(n.created_at) : '',
      key = 'n:' + n.id;
    if (hidden.indexOf(key) >= 0) return;
    if (NIGHT_KINDS.indexOf(n.kind) >= 0) {
      if (nightSeen[d.event_id]) return;
      nightSeen[d.event_id] = 1;
    }
    var base = { id: key, title: noStop(n.title), time: when, unread: !n.read_at, object: nightObject(e) };
    var date = e ? e.date : '';
    if (n.kind === 'night_back') rows.push(Object.assign(base, { kind: 'task', action: 'Fix', meta: 'Check the details', onAction: open }));
    else if (n.kind === 'night_review') rows.push(Object.assign(base, { kind: 'task', action: 'Check', meta: date || 'Waiting for a check', onAction: open }));
    else if (n.kind === 'night_reported') rows.push(Object.assign(base, { kind: 'task', action: 'Check', meta: 'Someone reported it', onAction: open }));
    else if (n.kind === 'promoter_invite') {
      var host = noStop(n.title).split(' wants you on ')[0] || 'The host';
      rows.push(
        Object.assign(base, {
          kind: 'decide',
          name: host,
          object: null,
          meta: (date ? date + ' · ' : '') + 'your own list',
          onAccept: open,
          onDecline: () => hide(key, 'Invite declined. ' + host + ' won’t be told')
        })
      );
    } else if (n.kind === 'night_live') rows.push(Object.assign(base, { kind: 'info', meta: date, onOpen: open }));
    else if (n.kind === 'night_submitted') rows.push(Object.assign(base, { kind: 'info', meta: 'Usually within a day', onOpen: open }));
    else if (n.kind === 'night_rejected')
      rows.push(Object.assign(base, { kind: 'info', object: null, icon: 'x', tone: 'limit', meta: date, onOpen: open }));
    else if (n.kind === 'verified') rows.push(Object.assign(base, { kind: 'info', icon: 'shield-check', tone: 'go', onOpen: open }));
    else if (n.kind === 'promoter_joined')
      rows.push(Object.assign(base, { kind: 'info', object: null, icon: 'users', tone: 'go', meta: date, onOpen: open }));
  });

  /* ---- guest lists you're on: take your passes, or just news once you have ---- */
  (S.myGuestLists || []).forEach((g) => {
    var e = EVENTS[g.event];
    if (!e) return;
    var go = () => {
      c.set({ bookMode: 'guest', bookList: g.listId });
      c.openEvent(g.event, 'list');
    };
    var base = { id: 'gl:' + g.listId, title: 'You’re on ' + poss(g.owner) + ' guest list', object: nightObject(e) };
    rows.push(
      g.bookingId
        ? Object.assign(base, { kind: 'info', meta: e.date + ' · passes taken', onOpen: go })
        : Object.assign(base, { kind: 'task', action: 'Get passes', meta: e.date + ' · free entry', onAction: go })
    );
  });

  /* ---- sample updates (no live feed for these yet) ---- */
  if (S.saved.twin) {
    sample = true;
    rows.push({
      id: 's:twin',
      kind: 'chance',
      title: 'Twin Strings: few left',
      meta: 'Fri 9 Oct · ₹1,299',
      time: '5h',
      action: 'Book',
      object: nightObject(EVENTS.twin),
      onAction: () => c.openEvent('twin', 'list')
    });
  }
  if (!S.ishaan) {
    sample = true;
    rows.push({
      id: 's:ishaan',
      kind: 'decide',
      title: 'Ishaan wants to be friends',
      meta: 'Joined from your plan link',
      time: '1d',
      name: 'Ishaan',
      onAccept: () => {
        c.set({ ishaan: 'yes' });
        c.toast('Ishaan is now your friend');
      },
      onDecline: () => {
        c.set({ ishaan: 'no' });
        c.toast('Request declined. Ishaan won’t be told', {
          label: 'Undo',
          run: () => c.set({ ishaan: null, toast: null })
        });
      }
    });
  }
  if (S.gp && S.gp.stage === 'voting') {
    sample = true;
    rows.push({
      id: 's:vote',
      kind: 'info',
      title: 'Zoya voted for Lavish Friday',
      meta: 'Voting closes ' + S.gp.deadline,
      time: '1h',
      name: 'Zoya',
      onOpen: () => c.go('group')
    });
  }
  Object.keys(S.follow).forEach((f) => {
    sample = true;
    rows.push({
      id: 's:follow:' + f,
      kind: 'info',
      title: f + ' announced a new night',
      meta: EVENTS.twin.date,
      time: '3h',
      object: nightObject(EVENTS.twin),
      onOpen: () => c.openEvent('twin')
    });
  });
  sample = true;
  rows.push({
    id: 's:rate',
    kind: 'info',
    title: 'Rate your last night',
    meta: 'Helps the next group decide',
    time: '2d',
    icon: 'star',
    tone: 'brand',
    onOpen: () => c.go('recap')
  });

  /* ---- Needs you: tasks, then chances, then people waiting on you; three answers on screen at most ---- */
  var ORDER = { task: 0, chance: 1, decide: 2 };
  var asks = rows.filter((r) => r.kind !== 'info').sort((a, b) => ORDER[a.kind] - ORDER[b.kind]);
  var needs = asks.slice(0, 3);
  // anything past three waits in Earlier as a plain row that opens it
  var earlier = asks
    .slice(3)
    .map((r) =>
      Object.assign({}, r, { kind: 'info', onOpen: r.onAction || r.onAccept })
    )
    .concat(rows.filter((r) => r.kind === 'info'));

  return (
    <div className="full col pad-top updates">
      <div>
        <IconButton icon="arrow-left" label="Back" variant="solid" onClick={c.back} />
      </div>
      <h1 className="g-display disp updates-title">Updates</h1>
      {needs.length ? (
        <UpdateGroup title="Needs you" aside={String(needs.length)}>
          {needs.map((r) => (
            <Update {...r} key={r.id} />
          ))}
        </UpdateGroup>
      ) : null}
      {earlier.length ? (
        <UpdateGroup title="Earlier">
          {earlier.map((r) => (
            <Update {...r} key={r.id} unread={undefined} />
          ))}
        </UpdateGroup>
      ) : null}
      {!needs.length && !earlier.length
        ? meta('Nothing new. Book a night or start a plan and updates land here')
        : null}
      {sample ? note('Friend, vote, follow, rating and saved-night updates are sample data') : null}
    </div>
  );
}

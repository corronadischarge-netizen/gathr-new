import { useEffect, useRef, useState } from 'react';
import { IMAGES_3D } from '../assets/images';
import { DEMO_REQUEST } from '../data/demo';
import { friendPhoto, friendRequest } from '../data/friends';
import { EVENTS, VENUES } from '../data/listings';
import { IconButton, Update, UpdateGroup } from '../design-system';
import { now } from '../lib/clock';
import { closesText } from '../lib/plan';
import { haptic } from '../lib/haptics';
import { ms, useFlip } from '../lib/motion';
import { optimistic } from '../lib/optimistic';
import { poss } from '../lib/utils';
import { pastNights } from './Plans';
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
  /* Accept turns the row to its done state (with the success haptic) for this visit; Decline slides the row out,
     then it's gone with Undo for 5 s (interactions spec 5, 6.11) */
  const [done, setDone] = useState([]);
  const [leaving, setLeaving] = useState([]);
  function decline(key, act, t, undo) {
    setLeaving((l) => l.concat(key));
    setTimeout(() => {
      act();
      setLeaving((l) => l.filter((k) => k !== key));
      // declining is quiet: the other person isn't told, and there's an Undo
      c.toast(t, {
        label: 'Undo',
        run: () => {
          c.set({ toast: null });
          undo();
        }
      });
    }, ms('--motion-slow'));
  }
  function hide(key, t) {
    decline(
      key,
      () => c.set((o) => ({ upHidden: (o.upHidden || []).concat(key) })),
      t,
      () => c.set((o) => ({ upHidden: (o.upHidden || []).filter((k) => k !== key) }))
    );
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

  /* ---- sample updates for the demo account (no live feed for these yet): a friend request, and the host's
     night in review (specs/demo-data.md section 7) ---- */
  var req = friendRequest(S) || (done.indexOf('s:req') >= 0 ? DEMO_REQUEST : null),
    accepted = done.indexOf('s:req') >= 0;
  if (req) {
    sample = true;
    rows.push({
      id: 's:req',
      kind: 'decide',
      done: accepted,
      title: req.name + ' wants to add you as a friend',
      meta: accepted ? 'You’re friends now' : 'Met you at Reggaeton Sundays',
      time: '1d',
      name: req.name,
      image: req.photo,
      onAccept: () =>
        optimistic(c, {
          apply: () => {
            c.set({ friendReq: 'yes' });
            setDone((d) => d.concat('s:req'));
            haptic.success();
          },
          sync: () => new Promise((ok) => setTimeout(ok, 300)), // sample: no friends service yet
          rollback: () => {
            c.set({ friendReq: null });
            setDone((d) => d.filter((k) => k !== 's:req'));
          }
        }),
      onDecline: () =>
        decline('s:req', () => c.set({ friendReq: 'no' }), 'Request declined. ' + req.name + ' won’t be told', () => c.set({ friendReq: null }))
    });
  }
  var inReview = S.demo && S.org && S.org.demo && (S.org.events || []).filter((o) => o.status === 'review')[0];
  if (inReview) {
    sample = true;
    rows.push({
      id: 's:review:' + inReview.id,
      kind: 'info',
      title: inReview.title + ' is in review',
      meta: (S.org.profile || {}).name + ' · usually under a day',
      time: '4h',
      icon: 'clock',
      tone: 'wait',
      onOpen: () => c.set({ stack: ['you', 'orghome', 'orgevent'], orgView: inReview.id, dir: 'fwd' })
    });
  }
  /* your plan's news: who voted, who left (from the plan's polling) */
  var news = (S.gp && S.gp.stage !== 'cancelled' && S.gp.news) || [];
  news.forEach((n) =>
    rows.push({
      id: 'p:' + n.id,
      kind: 'info',
      title: n.text,
      meta: S.gp.name,
      time: ago(new Date(n.at).toISOString()),
      name: n.who,
      onOpen: () => c.go('group')
    })
  );
  /* the day after a night you went to: one tap, opens the card (spec 6.12; on the phone this is the morning push) */
  var last = pastNights(S).filter((x) => !x.sample)[0],
    le = last && EVENTS[last.id],
    // 48 hours from when the night ended (about 5 hours after it started)
    asked = le && now() - new Date(le.iso).getTime() < 53 * 3600000 && !((S.dayAfter || {})[le.id] || {}).done;
  if (asked)
    rows.push({
      id: 'd:' + le.id,
      kind: 'task',
      title: 'How was ' + le.title + '? One tap',
      meta: le.date,
      action: 'Answer',
      object: nightObject(le),
      onAction: () => c.go('recap', { recapId: le.id })
    });
  /* the demo plan: a friend's vote, and yours still to give */
  var firstVote = S.gp && S.gp.stage === 'voting' && !news.length && S.gp.demo && (S.gp.opts || []).filter((k) => (S.gp.votes[k] || []).length)[0];
  if (firstVote && EVENTS[firstVote]) {
    var voter = S.gp.votes[firstVote][0];
    sample = true;
    rows.push(
      Object.assign(
        { id: 's:vote', title: voter + ' voted for ' + EVENTS[firstVote].title, time: '1h', name: voter, image: friendPhoto(voter) },
        S.vote
          ? { kind: 'info', meta: S.gp.name + ' · ' + closesText(S.gp, now()), onOpen: () => c.go('group') }
          : { kind: 'task', action: 'Vote', meta: S.gp.name + ' · ' + closesText(S.gp, now()), onAction: () => c.go('group') }
      )
    );
  }
  /* earlier: friends' nights (demo) */
  if (S.demo)
    [
      ['Kabir', 'desidrop', '6h'],
      ['Tanvi', 'epitomelive', '1d']
    ].forEach((x) => {
      var e = EVENTS[x[1]];
      if (!e) return;
      sample = true;
      rows.push({ id: 's:going:' + x[1], kind: 'info', title: x[0] + ' is going to ' + e.title, meta: e.date, time: x[2], name: x[0], image: friendPhoto(x[0]), onOpen: () => c.openEvent(x[1]) });
    });
  Object.keys(S.follow).forEach((f) => {
    sample = true;
    rows.push({
      id: 's:follow:' + f,
      kind: 'info',
      title: f + ' announced a new night',
      meta: EVENTS.millerssessions.date,
      time: '3h',
      object: nightObject(EVENTS.millerssessions),
      onOpen: () => c.openEvent('millerssessions')
    });
  });
  if (!asked && S.demo) sample = true;
  if (!asked && S.demo) rows.push({
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
  rows = rows.map((r) => Object.assign(r, { leaving: leaving.indexOf(r.id) >= 0 }));
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

  /* Earlier rows count as read after 1 s on screen; once everything is read, the bell's dot clears */
  var earlierIds = useRef([]);
  earlierIds.current = earlier.map((r) => r.id);
  useEffect(() => {
    var t = setTimeout(() => {
      var unread = (S.inbox || []).filter((n) => !n.read_at).map((n) => n.id);
      c.set((o) => ({
        upRead: Array.from(new Set((o.upRead || []).concat(earlierIds.current))).slice(-200),
        notifSeen: true
      }));
      if (!unread.length) return;
      markRead(unread)
        .then(() =>
          c.set((o) => ({
            inbox: (o.inbox || []).map((n) => (unread.indexOf(n.id) >= 0 ? Object.assign({}, n, { read_at: 'now' }) : n))
          }))
        )
        .catch(() => {});
    }, 1000);
    return () => clearTimeout(t);
  }, []);
  // a row that leaves: the ones below glide up into its place
  var box = useRef(null);
  useFlip(box, needs.concat(earlier).map((r) => r.id).join());

  return (
    <div ref={box} className="full col pad-top updates">
      <div>
        <IconButton icon="arrow-left" label="Back" variant="solid" onClick={c.back} />
      </div>
      <h1 className="g-display disp updates-title">Updates</h1>
      {needs.length ? (
        <UpdateGroup title="Needs you" aside={String(needs.length)}>
          {needs.map((r) => (
            <Update {...r} key={r.id} flip={r.id} />
          ))}
        </UpdateGroup>
      ) : null}
      {earlier.length ? (
        <UpdateGroup title="Earlier">
          {earlier.map((r) => (
            <Update {...r} key={r.id} flip={r.id} unread={(S.upRead || []).indexOf(r.id) < 0 && r.unread !== false} />
          ))}
        </UpdateGroup>
      ) : null}
      {!needs.length && !earlier.length
        ? meta('Nothing new. Book a night or start a plan and updates land here')
        : null}
      {sample ? note('Friend, vote, follow and saved-night updates are sample data') : null}
    </div>
  );
}

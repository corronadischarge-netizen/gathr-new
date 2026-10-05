import { EVENTS } from '../data/listings';
import { haptic } from '../lib/haptics';
import { store } from '../lib/utils';
import { pullCheckins, remoteOn, sayError, sendCheckin, undoCheckins } from './remote';

/* The door, for nights hosted on gathr. A check-in shows on this phone at once and goes into a small outbox
   that sends it to the database; with bad signal at the door it waits and retries. Each check-in carries its
   own id (client_id), so sending it twice is harmless: the database keeps one. */
const OUTBOX = 'gathr.door.outbox';

function newId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g, () => ((Math.random() * 16) | 0).toString(16));
}
function outbox() {
  return store(OUTBOX) || [];
}
function setOutbox(list) {
  store(OUTBOX, list);
}
/* this night's check-ins: what the database has, plus anything still waiting to send */
function merge(c, eventId, fromDb) {
  var waiting = outbox().filter((x) => x.event_id === eventId);
  var have = fromDb.map((x) => x.client_id);
  c.set((o) => ({
    remoteCheckins: Object.assign({}, o.remoteCheckins, {
      [eventId]: fromDb.concat(
        waiting.filter((x) => have.indexOf(x.client_id) < 0).map((x) => Object.assign({ waiting: true }, x))
      )
    })
  }));
}

/* Load (or refresh) a night's check-ins. */
export function loadCheckins(c, eventId) {
  return pullCheckins(eventId).then(
    (rows) => merge(c, eventId, rows),
    () => {}
  );
}

/* Let people in. who: { bookingId, entryId, names (guest list) or couples / stags / girls (a paid booking) } */
export function checkIn(c, eventId, who) {
  var row = {
    client_id: newId(),
    event_id: eventId,
    outcome: 'admitted',
    booking_id: who.bookingId || null,
    guest_entry_id: who.bookingId ? null : who.entryId || null,
    guest_names: who.names || [],
    couples: who.names ? 0 : who.couples || 0,
    stags: who.names ? 0 : who.stags || 0,
    girls: who.names ? 0 : who.girls || 0
  };
  setOutbox(outbox().concat(row));
  c.set((o) => {
    var cur = (o.remoteCheckins && o.remoteCheckins[eventId]) || [];
    return {
      remoteCheckins: Object.assign({}, o.remoteCheckins, {
        [eventId]: cur.concat(Object.assign({ waiting: true, scanned_at: new Date().toISOString() }, row))
      })
    };
  });
  return flush(c);
}

var sending = false;
/* Send whatever is waiting. Rule errors (e.g. "Already in") come back to the door; no signal just waits. */
export function flush(c) {
  var list = outbox();
  if (sending || !list.length) return Promise.resolve();
  sending = true;
  var row = list[0];
  return sendCheckin(row)
    .then(
      (saved) => {
        drop(row.client_id);
        settle(c, row, Object.assign({}, row, saved, { waiting: false }));
      },
      (err) => {
        if (err && err.code === '23505' && /client_id/.test(err.message || '')) {
          drop(row.client_id); // it got there on an earlier try
          settle(c, row, Object.assign({}, row, { waiting: false }));
        } else if (/fetch|network|Failed to fetch|Load failed/i.test((err && err.message) || '')) {
          throw err; // no signal: keep it and try again later
        } else {
          drop(row.client_id);
          settle(c, row, null);
          haptic.error();
          c.toast(sayError(err));
        }
      }
    )
    .then(
      () => {
        sending = false;
        return flush(c);
      },
      () => {
        sending = false;
      }
    );
}
function drop(clientId) {
  setOutbox(outbox().filter((x) => x.client_id !== clientId));
}
function settle(c, row, saved) {
  c.set((o) => {
    var cur = ((o.remoteCheckins && o.remoteCheckins[row.event_id]) || []).filter(
      (x) => x.client_id !== row.client_id
    );
    return {
      remoteCheckins: Object.assign({}, o.remoteCheckins, { [row.event_id]: saved ? cur.concat(saved) : cur })
    };
  });
}

/* Undo: only check-ins this phone recorded, within 10 minutes. */
export function undo(c, eventId, rows) {
  var waiting = rows.filter((x) => x.waiting),
    sent = rows.filter((x) => !x.waiting && x.id);
  waiting.forEach((x) => {
    drop(x.client_id);
    settle(c, x, null);
  });
  if (!sent.length) return Promise.resolve(true);
  return undoCheckins(sent.map((x) => x.id)).then(
    (n) => {
      if (!n) {
        c.toast('Only the phone that let them in can undo it, within 10 minutes');
        return false;
      }
      return loadCheckins(c, eventId).then(() => true);
    },
    (err) => {
      c.toast(sayError(err));
      return false;
    }
  );
}

export function waitingCount() {
  return outbox().length;
}

/* ---------------------------------------------------------------- what the door screens call */
/* a night hosted on gathr, with Supabase on: its door runs through the database */
export function isRemoteNight(id) {
  return remoteOn && !!EVENTS[id] && !!EVENTS[id].remote;
}
/* everyone named on a guest-list row, and those not in yet */
export function namesOf(g) {
  return [g.name].concat(g.plusOnes || []);
}
export function stillOut(g) {
  var inside = g.inNames || [];
  return namesOf(g).filter((n) => inside.indexOf(n) < 0);
}
/* Let a guest in: a paid booking all at once, guest-list people by name (all who are still out by default). */
export function letIn(c, eventId, g, names) {
  if (g.guestList)
    return checkIn(c, eventId, { bookingId: g.bookingId, entryId: g.entryId, names: names || stillOut(g) });
  var cs = g.couples || 0,
    st = g.stags || 0,
    gi = g.girls || 0;
  if (!cs && !st && !gi) st = g.passes || 1; // a booking from before parties were recorded
  return checkIn(c, eventId, { bookingId: g.bookingId, couples: cs, stags: st, girls: gi });
}
export function takeBack(c, eventId, g) {
  return undo(c, eventId, g.inRows || []);
}

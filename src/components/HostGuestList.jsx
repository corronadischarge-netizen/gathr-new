import { useEffect, useState } from 'react';
import { EVENTS, VENUES } from '../data/listings';
import { Button, IconButton } from '../design-system';
import { haptic } from '../lib/haptics';
import { okEmail, poss } from '../lib/utils';
import {
  addToHostList,
  invitePromoter,
  pullListPeople,
  pullListSummary,
  remoteOn,
  removeFromList,
  sayError,
  withdrawInvite
} from '../services/remote';
import { Share } from '../services/share';
import { meta, note } from '../ui/helpers';
import { GuestForm } from './GuestForm';

/* The guest lists for one night. Free entry for named people; nobody can ask to be on one.
   · Your list: you add each guest by name, with their email (they get it in gathr), their phone (you can
     WhatsApp them) or neither (the door finds them by name).
   · Promoters: you invite a promoter to this night by email, with a cap. Once they sign in with that email they
     add their own people. You see each list: how many are on it and how many came. */
export function HostGuestList(p) {
  var c = p.ctx,
    id = p.id,
    e = EVENTS[id] || {};
  const [people, setPeople] = useState(null);
  const [lists, setLists] = useState(null); // every list on the night, or false on a database without invites
  const [adding, setAdding] = useState(false);
  const [inviting, setInviting] = useState(null); // the "invite a promoter" form while it's open
  const [open, setOpen] = useState(null); // the guest row or promoter list showing its details
  const [busy, setBusy] = useState(false);
  function load() {
    pullListPeople(id).then(setPeople, () => setPeople([]));
    pullListSummary(id).then(setLists, () => setLists(false));
  }
  useEffect(() => {
    if (remoteOn && e.remote) load();
  }, [id]);
  if (!remoteOn || !e.remote)
    return (
      <section className="col" style={{ gap: '8px' }}>
        <h2 className="g-section-title" style={{ margin: 0 }}>
          Guest list
        </h2>
        {meta(
          remoteOn
            ? 'Guest lists are for nights you list on gathr. This one is listed from another site.'
            : 'Guest lists work once gathr is online and you’re signed in.'
        )}
      </section>
    );
  var mine = (people || []).filter((x) => !x.by),
    count = (list) => list.reduce((a, x) => a + 1 + x.plusOnes.length, 0),
    promos = (lists || []).filter((l) => !l.isHost);
  function add(g) {
    return addToHostList(id, g).then(
      () => {
        haptic.success();
        var first = g.name.split(' ')[0];
        if (g.phone)
          c.toast(first + ' is on your list', {
            label: 'WhatsApp',
            run: () =>
              Share.whatsappTo(
                g.phone,
                'You’re on my guest list for ' +
                  e.title +
                  ' at ' +
                  ((VENUES[e.venue] || {}).name || '') +
                  ', ' +
                  e.date +
                  ' · ' +
                  e.time +
                  '. Free entry' +
                  (g.plusOnes.length ? ' for you + ' + g.plusOnes.length : '') +
                  '. Give your name at the door.'
              )
          });
        else c.toast(first + (g.email ? ' is on your list. They’ll see it in gathr' : ' is on your list'));
        setAdding(false);
        load();
      },
      (err) => {
        haptic.error();
        c.toast(sayError(err));
        throw err;
      }
    );
  }
  function remove(x) {
    removeFromList(x.id).then(
      () => {
        c.toast(x.name + ' is off the list');
        load();
      },
      (err) => c.toast(sayError(err))
    );
  }
  function invite() {
    var f = inviting,
      cap = +f.cap || null;
    if (busy || !okEmail(f.email) || (f.cap && !(cap > 0 && cap <= 500))) return;
    setBusy(true);
    invitePromoter(id, f.email.trim(), f.name.trim(), cap).then(
      () => {
        setBusy(false);
        haptic.success();
        c.toast('Invite sent. They’ll see it when they sign in with ' + f.email.trim().toLowerCase());
        setInviting(null);
        load();
      },
      (err) => {
        setBusy(false);
        haptic.error();
        c.toast(sayError(err));
      }
    );
  }
  function withdraw(l) {
    withdrawInvite(l.listId).then(
      () => {
        c.toast('Invite withdrawn');
        load();
      },
      (err) => c.toast(sayError(err))
    );
  }
  /* one guest: name and party size on one line; tap for their contact, plus-ones and note */
  function row(x, canRemove) {
    var more = open === x.id,
      n = 1 + x.plusOnes.length;
    return (
      <div key={x.id} className="list-row gl-row">
        <div className="rowc" style={{ gap: '8px' }}>
          <button
            type="button"
            className="org-guest-main"
            aria-expanded={more}
            onClick={() => setOpen(more ? null : x.id)}
          >
            <span className="title15 org-guest-name">{x.name}</span>
            <span className="org-guest-n">{n === 1 ? '1 person' : n + ' people'}</span>
          </button>
          {x.taken ? <span className="gl-taken">Has passes</span> : null}
          {canRemove ? (
            <IconButton
              icon="x"
              label={'Take ' + x.name + ' off the list'}
              variant="tonal"
              onClick={() => remove(x)}
            />
          ) : null}
        </div>
        {more ? (
          <p className="meta" style={{ margin: '0 0 10px' }}>
            {[
              x.email || (x.phone ? '+91 ' + x.phone : 'Name only'),
              x.plusOnes.length ? 'with ' + x.plusOnes.join(', ') : null,
              x.note,
              x.taken ? 'took their passes' : x.email ? 'hasn’t taken their passes yet' : null
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        ) : null}
      </div>
    );
  }
  return (
    <>
      <section className="col" style={{ gap: '10px' }} aria-labelledby="hg-title">
        <div className="sec-row">
          <h2 id="hg-title" className="g-section-title" style={{ margin: 0 }}>
            Your guest list
          </h2>
          {people ? meta(count(mine) + (count(mine) === 1 ? ' person' : ' people') + ' · free entry') : null}
        </div>
        {!people ? meta('Loading your guest list…') : null}
        {people && !mine.length && !adding
          ? meta('Free entry for people you invite: by email, phone, or just their name.')
          : null}
        {mine.length ? <div className="col">{mine.map((x) => row(x, true))}</div> : null}
        {adding ? (
          <GuestForm onSave={add} onCancel={() => setAdding(false)} />
        ) : (
          <Button variant="subtle" icon="users" onClick={() => setAdding(true)}>
            Add a guest
          </Button>
        )}
      </section>
      <section className="col" style={{ gap: '10px' }} aria-labelledby="hp-title">
        <div className="sec-row">
          <h2 id="hp-title" className="g-section-title" style={{ margin: 0 }}>
            Promoters
          </h2>
          {promos.length ? meta(promos.length + (promos.length === 1 ? ' list' : ' lists')) : null}
        </div>
        {lists === false ? meta('Promoter invites need the latest gathr database update.') : null}
        {lists && !promos.length && !inviting
          ? meta('Invite a promoter to this night with a cap. They add their own people; you see who came.')
          : null}
        {promos.map((l) => {
          var more = open === l.listId,
            theirs = (people || []).filter((x) => x.by === l.owner);
          return (
            <div key={l.listId} className="list-row gl-row">
              <div className="rowc" style={{ gap: '8px' }}>
                <button
                  type="button"
                  className="org-guest-main"
                  aria-expanded={more}
                  disabled={l.waiting}
                  onClick={() => setOpen(more ? null : l.listId)}
                >
                  <span className="title15 org-guest-name">{l.owner}</span>
                  <span className="org-guest-n">
                    {l.waiting
                      ? 'Invited'
                      : l.people + (l.cap ? ' of ' + l.cap : '') + ' · ' + l.came + ' came'}
                  </span>
                </button>
                {l.waiting ? (
                  <Button variant="ghost" size="sm" onClick={() => withdraw(l)}>
                    Withdraw
                  </Button>
                ) : null}
              </div>
              {l.waiting ? (
                <p className="meta" style={{ margin: '0 0 10px' }}>
                  {'Waiting for ' +
                    l.email +
                    ' to sign in to gathr' +
                    (l.cap ? ' · cap ' + l.cap + ' people' : '')}
                </p>
              ) : null}
              {more ? (
                theirs.length ? (
                  <div className="col gl-theirs">{theirs.map((x) => row(x, true))}</div>
                ) : (
                  <p className="meta" style={{ margin: '0 0 10px' }}>
                    {poss(l.owner) + ' list is empty so far.'}
                  </p>
                )
              ) : null}
            </div>
          );
        })}
        {inviting ? (
          <div className="col fade-up venue-add" style={{ gap: '10px' }}>
            <span className="title15">Invite a promoter to this night</span>
            <div className="field-row">
              <input
                aria-label="Promoter’s name"
                placeholder="Their name, as guests know them"
                maxLength={30}
                value={inviting.name}
                onChange={(ev) => setInviting(Object.assign({}, inviting, { name: ev.target.value }))}
              />
            </div>
            <div className="field-row">
              <input
                aria-label="Promoter’s email"
                type="email"
                inputMode="email"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="The email they’ll sign in to gathr with"
                value={inviting.email}
                onChange={(ev) => setInviting(Object.assign({}, inviting, { email: ev.target.value }))}
              />
            </div>
            <div className="field-row">
              <input
                aria-label="Cap, in people"
                inputMode="numeric"
                placeholder="Cap, in people (optional)"
                value={inviting.cap}
                onChange={(ev) =>
                  setInviting(
                    Object.assign({}, inviting, { cap: ev.target.value.replace(/[^0-9]/g, '').slice(0, 3) })
                  )
                }
              />
            </div>
            {inviting.email && !okEmail(inviting.email) ? (
              <span className="meta err-txt">Enter an email like name@gmail.com</span>
            ) : null}
            {note(
              'Each guest counts with their plus-ones. Promoters aren’t tied to your venue; they can work any night.'
            )}
            <div className="btn-pair">
              <Button variant="subtle" block onClick={() => setInviting(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                block
                disabled={!okEmail(inviting.email) || inviting.name.trim().length < 2 || busy}
                onClick={invite}
              >
                {busy ? 'Sending…' : 'Send invite'}
              </Button>
            </div>
          </div>
        ) : lists !== false ? (
          <Button variant="subtle" icon="user" onClick={() => setInviting({ name: '', email: '', cap: '' })}>
            Invite a promoter
          </Button>
        ) : null}
      </section>
    </>
  );
}

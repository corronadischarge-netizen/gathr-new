import { useEffect, useState } from 'react';
import { GuestForm } from '../components/GuestForm';
import { MO, WD } from '../data/dates';
import { Button, IconButton } from '../design-system';
import { haptic } from '../lib/haptics';
import { addToList, myPromoterLists, pullMyListPeople, removeFromList, sayError } from '../services/remote';
import { Share } from '../services/share';
import { eyebrow, meta, note, stop } from '../ui/helpers';

export function whenTxt(iso) {
  var d = new Date(new Date(iso).getTime() + 330 * 60000); // Pune time
  var h = d.getUTCHours(),
    m = d.getUTCMinutes();
  return (
    WD[d.getUTCDay()].slice(0, 3) +
    ' ' +
    d.getUTCDate() +
    ' ' +
    MO[d.getUTCMonth()] +
    ' · ' +
    ((h % 12 || 12) + (m ? ':' + String(m).padStart(2, '0') : '') + (h >= 12 ? ' pm' : ' am'))
  );
}

/* A promoter's nights: each night a host invited them to, their own guest list on it (up to the host's cap),
   and how many of their people came. They add people by name, with an email, a phone or neither. */
export function Promoting(p) {
  var c = p.ctx,
    S = c.S,
    nights = S.promoting || [];
  const [open, setOpen] = useState(nights.length === 1 ? nights[0].listId : null);
  const [people, setPeople] = useState({}); // listId → people on it
  const [adding, setAdding] = useState(null);
  function refresh() {
    myPromoterLists()
      .then((l) => c.set({ promoting: l }))
      .catch(() => {});
  }
  function loadPeople(listId) {
    pullMyListPeople(listId).then(
      (l) => setPeople((o) => Object.assign({}, o, { [listId]: l })),
      () => setPeople((o) => Object.assign({}, o, { [listId]: [] }))
    );
  }
  useEffect(refresh, []);
  useEffect(() => {
    if (open) loadPeople(open);
  }, [open]);
  function add(n, g) {
    return addToList(n.listId, g).then(
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
                  n.title +
                  ' at ' +
                  n.venue +
                  ', ' +
                  whenTxt(n.startsAt) +
                  '. Free entry' +
                  (g.plusOnes.length ? ' for you + ' + g.plusOnes.length : '') +
                  '. Give your name at the door.'
              )
          });
        else c.toast(first + (g.email ? ' is on your list. They’ll see it in gathr' : ' is on your list'));
        setAdding(null);
        loadPeople(n.listId);
        refresh();
      },
      (err) => {
        haptic.error();
        c.toast(sayError(err));
        throw err;
      }
    );
  }
  function remove(n, x) {
    removeFromList(x.id).then(
      () => {
        c.toast(x.name + ' is off your list');
        loadPeople(n.listId);
        refresh();
      },
      (err) => c.toast(sayError(err))
    );
  }
  return (
    <div className="full col pad-top" style={{ gap: '28px', paddingTop: '52px', paddingBottom: '48px' }}>
      <div className="rowc between">
        <IconButton icon="arrow-left" label="Back" variant="solid" onClick={c.back} />
      </div>
      <div>
        {eyebrow('Your guest lists')}
        {stop('nights you’re promoting')}
      </div>
      {!nights.length
        ? meta(
            'When a host invites you to promote a night, it shows here. They invite you by the email you sign in with.'
          )
        : null}
      {nights.map((n) => {
        var more = open === n.listId,
          list = people[n.listId],
          room = n.cap != null ? Math.max(0, n.cap - n.people) : null;
        return (
          <section key={n.listId} className="ev-card col" style={{ gap: '12px' }}>
            <button
              type="button"
              className="promo-head"
              aria-expanded={more}
              onClick={() => setOpen(more ? null : n.listId)}
            >
              <span className="col" style={{ gap: '2px', minWidth: 0, flexGrow: 1, textAlign: 'left' }}>
                <span className="title15">{n.title}</span>
                {meta(whenTxt(n.startsAt) + ' · ' + n.venue + ' · for ' + n.host)}
              </span>
              <span className="promo-count">
                <b>{n.people}</b>
                {n.cap != null ? ' / ' + n.cap : ''}
              </span>
            </button>
            {meta(
              (n.cap != null
                ? room
                  ? room + (room === 1 ? ' spot' : ' spots') + ' left'
                  : 'Your list is full'
                : 'No cap') + (n.came ? ' · ' + n.came + ' came' : '')
            )}
            {more ? (
              <>
                {!list ? meta('Loading your list…') : null}
                {list && list.length ? (
                  <div className="col">
                    {list.map((x) => (
                      <div key={x.id} className="rowc list-row" style={{ gap: '8px', minHeight: '52px' }}>
                        <span className="title15 org-guest-name" style={{ flexGrow: 1 }}>
                          {x.name}
                        </span>
                        <span className="org-guest-n">
                          {1 + x.plusOnes.length === 1 ? '1 person' : 1 + x.plusOnes.length + ' people'}
                        </span>
                        <IconButton
                          icon="x"
                          label={'Take ' + x.name + ' off your list'}
                          variant="tonal"
                          onClick={() => remove(n, x)}
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
                {adding === n.listId ? (
                  <GuestForm room={room} onSave={(g) => add(n, g)} onCancel={() => setAdding(null)} />
                ) : (
                  <Button
                    variant="subtle"
                    icon="users"
                    disabled={room === 0}
                    onClick={() => setAdding(n.listId)}
                  >
                    {room === 0 ? 'Your list is full' : 'Add a guest'}
                  </Button>
                )}
              </>
            ) : null}
          </section>
        );
      })}
      {nights.length ? note('The host sets your cap. Each guest counts with their plus-ones.') : null}
    </div>
  );
}

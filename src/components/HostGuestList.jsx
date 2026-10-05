import { useEffect, useState } from 'react';
import { EVENTS } from '../data/listings';
import { Badge, Button, IconButton } from '../design-system';
import { haptic } from '../lib/haptics';
import { okEmail, poss } from '../lib/utils';
import { addToHostList, pullListPeople, remoteOn, removeFromList, sayError } from '../services/remote';
import { meta } from '../ui/helpers';

const EMPTY = { name: '', email: '', plusOnes: [], note: '' };

/* The host's guest list for one night: free entry for named people. The host adds each guest by the email
   they sign in to gathr with, with their plus-ones by name. The guest sees it in gathr and takes their
   passes when booking. Promoters' lists for the night show here too, under the promoter's name. */
export function HostGuestList(p) {
  var c = p.ctx,
    id = p.id,
    e = EVENTS[id] || {};
  const [people, setPeople] = useState(null);
  const [form, setForm] = useState(null); // the "add a guest" form while it's open
  const [busy, setBusy] = useState(false);
  function load() {
    pullListPeople(id).then(setPeople, () => setPeople([]));
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
    byPromoter = {};
  (people || [])
    .filter((x) => x.by)
    .forEach((x) => {
      (byPromoter[x.by] = byPromoter[x.by] || []).push(x);
    });
  var count = (list) => list.reduce((a, x) => a + 1 + x.plusOnes.length, 0);
  var names = form ? form.plusOnes.map((n) => n.trim()) : [];
  var okForm =
    form &&
    form.name.trim().length >= 2 &&
    okEmail(form.email) &&
    names.every((n) => n.length >= 2) &&
    !(people || []).some((x) => !x.by && x.email === form.email.trim().toLowerCase());
  function save() {
    if (!okForm || busy) return;
    setBusy(true);
    addToHostList(id, {
      name: form.name.trim(),
      email: form.email.trim(),
      plusOnes: names,
      note: form.note.trim()
    }).then(
      () => {
        setBusy(false);
        haptic.success();
        c.toast(form.name.trim().split(' ')[0] + ' is on your list. They’ll see it in gathr');
        setForm(null);
        load();
      },
      (err) => {
        setBusy(false);
        haptic.error();
        c.toast(sayError(err));
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
  function row(x, canRemove) {
    return (
      <div key={x.id} className="rowc list-row" style={{ gap: '10px' }}>
        <div className="col" style={{ gap: '2px', flexGrow: 1, minWidth: 0 }}>
          <span className="title15">{x.name + (x.plusOnes.length ? ' + ' + x.plusOnes.length : '')}</span>
          {meta([x.plusOnes.join(', '), x.email, x.note].filter(Boolean).join(' · '))}
        </div>
        {x.taken ? <Badge tone="go">Has passes</Badge> : <Badge tone="neutral">Not taken yet</Badge>}
        {canRemove ? (
          <IconButton
            icon="x"
            label={'Take ' + x.name + ' off the list'}
            variant="tonal"
            onClick={() => remove(x)}
          />
        ) : null}
      </div>
    );
  }
  return (
    <section className="col" style={{ gap: '10px' }} aria-labelledby="hg-title">
      <div className="sec-row">
        <h2 id="hg-title" className="g-section-title" style={{ margin: 0 }}>
          Guest list
        </h2>
        {people
          ? meta(count(people) + (count(people) === 1 ? ' person' : ' people') + ' · free entry')
          : null}
      </div>
      {!people ? meta('Loading your guest list…') : null}
      {people && !people.length && !form
        ? meta(
            'Free entry for people you invite. Add them by the email they use on gathr; they’ll see it there.'
          )
        : null}
      {mine.map((x) => row(x, true))}
      {Object.keys(byPromoter).map((who) => (
        <div key={who} className="col">
          <span className="meta" style={{ paddingTop: '8px' }}>
            {poss(who) + ' list · ' + count(byPromoter[who]) + ' people'}
          </span>
          {byPromoter[who].map((x) => row(x, true))}
        </div>
      ))}
      {form ? (
        <div className="col fade-up venue-add" style={{ gap: '10px' }}>
          <span className="title15">Add a guest</span>
          <div className="field-row">
            <input
              aria-label="Guest’s name"
              placeholder="Their name"
              maxLength={60}
              value={form.name}
              onChange={(ev) => setForm(Object.assign({}, form, { name: ev.target.value }))}
            />
          </div>
          <div className="field-row">
            <input
              aria-label="Guest’s email on gathr"
              type="email"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="The email they sign in to gathr with"
              value={form.email}
              onChange={(ev) => setForm(Object.assign({}, form, { email: ev.target.value }))}
            />
          </div>
          {form.plusOnes.map((n, i) => (
            <div key={i} className="rowc" style={{ gap: '8px' }}>
              <div className="field-row" style={{ flexGrow: 1 }}>
                <input
                  aria-label={'Plus-one ' + (i + 1) + ' name'}
                  placeholder={'Plus-one ' + (i + 1) + ', by name'}
                  maxLength={40}
                  value={n}
                  onChange={(ev) => {
                    var po = form.plusOnes.slice();
                    po[i] = ev.target.value;
                    setForm(Object.assign({}, form, { plusOnes: po }));
                  }}
                />
              </div>
              <IconButton
                icon="x"
                label={'Remove plus-one ' + (i + 1)}
                variant="tonal"
                onClick={() =>
                  setForm(Object.assign({}, form, { plusOnes: form.plusOnes.filter((_, j) => j !== i) }))
                }
              />
            </div>
          ))}
          {form.plusOnes.length < 10 ? (
            <button
              type="button"
              className="link-btn"
              onClick={() => setForm(Object.assign({}, form, { plusOnes: form.plusOnes.concat('') }))}
            >
              Add a plus-one
            </button>
          ) : null}
          <div className="field-row">
            <input
              aria-label="Note"
              placeholder="Note for the door (optional), e.g. table 4"
              maxLength={80}
              value={form.note}
              onChange={(ev) => setForm(Object.assign({}, form, { note: ev.target.value }))}
            />
          </div>
          {form.email && !okEmail(form.email) ? (
            <span className="meta err-txt">Enter an email like name@gmail.com</span>
          ) : null}
          {names.some((n) => n.length < 2) ? <span className="meta">Give every plus-one a name</span> : null}
          <div className="rowc" style={{ gap: '8px' }}>
            <Button variant="ghost" onClick={() => setForm(null)}>
              Cancel
            </Button>
            <div style={{ flexGrow: 1 }}>
              <Button variant="primary" block disabled={!okForm || busy} onClick={save}>
                {busy
                  ? 'Adding…'
                  : 'Add ' + (1 + form.plusOnes.length) + (form.plusOnes.length ? ' people' : ' person')}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button variant="subtle" icon="users" onClick={() => setForm(Object.assign({}, EMPTY))}>
          Add a guest
        </Button>
      )}
    </section>
  );
}

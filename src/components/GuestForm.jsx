import { useState } from 'react';
import { Button, IconButton } from '../design-system';
import { okEmail } from '../lib/utils';
import { meta } from '../ui/helpers';

/* Email, Indian mobile, or nothing, from one box: { email } | { phone } | {} | null when it's neither */
export function readContact(v) {
  v = (v || '').trim();
  if (!v) return {};
  if (v.indexOf('@') >= 0) return okEmail(v) ? { email: v.toLowerCase() } : null;
  var d = v.replace(/[^0-9]/g, '');
  if (d.length === 12 && d.slice(0, 2) === '91') d = d.slice(2);
  if (d.length === 11 && d[0] === '0') d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? { phone: d } : null;
}

/* Add a guest: their name, then their email or phone (or neither), named plus-ones and a note for the door.
   Used by hosts on their own list and by promoters on theirs. onSave(guest) returns a promise. */
export function GuestForm(p) {
  const [f, setF] = useState({ name: '', contact: '', plusOnes: [], note: '' });
  const [busy, setBusy] = useState(false);
  function upd(x) {
    setF(Object.assign({}, f, x));
  }
  var who = readContact(f.contact),
    names = f.plusOnes.map((n) => n.trim()),
    left = p.room != null ? p.room : null, // people the list still has room for (a promoter's cap)
    size = 1 + f.plusOnes.length,
    ok =
      f.name.trim().length >= 2 && who && names.every((n) => n.length >= 2) && (left == null || size <= left);
  function save() {
    if (!ok || busy) return;
    setBusy(true);
    p.onSave(Object.assign({ name: f.name.trim(), plusOnes: names, note: f.note.trim() }, who)).then(
      () => setBusy(false),
      () => setBusy(false)
    );
  }
  return (
    <div className="col fade-up venue-add" style={{ gap: '10px' }}>
      <span className="title15">Add a guest</span>
      <div className="field-row">
        <input
          aria-label="Guest’s name"
          placeholder="Their name"
          maxLength={60}
          value={f.name}
          onChange={(ev) => upd({ name: ev.target.value })}
        />
      </div>
      <div className="field-row">
        <input
          aria-label="Their email or phone (optional)"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="Email or phone (optional)"
          value={f.contact}
          onChange={(ev) => upd({ contact: ev.target.value })}
        />
      </div>
      {who === null ? (
        <span className="meta err-txt">Enter an email like name@gmail.com, or a 10-digit mobile number</span>
      ) : (
        meta(
          who.email
            ? 'They’ll get it in gathr and take their passes there.'
            : who.phone
              ? 'You can send it to them on WhatsApp. The door finds them by name.'
              : 'Name only: the door finds them by name.'
        )
      )}
      {f.plusOnes.map((n, i) => (
        <div key={i} className="rowc" style={{ gap: '8px' }}>
          <div className="field-row" style={{ flexGrow: 1 }}>
            <input
              aria-label={'Plus-one ' + (i + 1) + ' name'}
              placeholder={'Plus-one ' + (i + 1) + ', by name'}
              maxLength={40}
              value={n}
              onChange={(ev) => {
                var po = f.plusOnes.slice();
                po[i] = ev.target.value;
                upd({ plusOnes: po });
              }}
            />
          </div>
          <IconButton
            icon="x"
            label={'Remove plus-one ' + (i + 1)}
            variant="tonal"
            onClick={() => upd({ plusOnes: f.plusOnes.filter((_, j) => j !== i) })}
          />
        </div>
      ))}
      {f.plusOnes.length < 10 ? (
        <button
          type="button"
          className="link-btn"
          style={{ alignSelf: 'flex-start' }}
          onClick={() => upd({ plusOnes: f.plusOnes.concat('') })}
        >
          Add a plus-one
        </button>
      ) : null}
      <div className="field-row">
        <input
          aria-label="Note"
          placeholder="Note for the door (optional), e.g. table 4"
          maxLength={80}
          value={f.note}
          onChange={(ev) => upd({ note: ev.target.value })}
        />
      </div>
      {names.some((n) => n.length < 2) ? meta('Give every plus-one a name') : null}
      {left != null && size > left ? (
        <span className="meta err-txt">
          {'Your list has room for ' + left + (left === 1 ? ' more person' : ' more people')}
        </span>
      ) : null}
      <div className="btn-pair">
        <Button variant="subtle" block onClick={p.onCancel}>
          Cancel
        </Button>
        <Button variant="primary" block disabled={!ok || busy} onClick={save}>
          {busy ? 'Adding…' : 'Add ' + size + (size === 1 ? ' person' : ' people')}
        </Button>
      </div>
    </div>
  );
}

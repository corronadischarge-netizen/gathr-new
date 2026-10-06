import { useState } from 'react';
import { Button, Chip } from '../design-system';
import { ENERGY, FAMILIES, NIGHT_KINDS, artistInfo, family, findArtists, nightKind } from '../data/taxonomy';
import { haptic } from '../lib/haptics';
import { remoteOn, sayError, suggestKind } from '../services/remote';
import { icon, meta, note } from '../ui/helpers';

/* Kind of night: the 12 formats, plus "Suggest a new kind" (it goes to gathr; it never becomes a tag on the night) */
export function KindPicker(p) {
  var c = p.ctx,
    D = p.value,
    cur = nightKind(D.kind)[0];
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [sending, setSending] = useState(false);
  function send() {
    var n = name.trim();
    if (n.length < 3 || sending) return;
    setSending(true);
    (remoteOn ? suggestKind(n, p.example || '') : Promise.resolve()).then(
      () => {
        setSending(false);
        haptic.success();
        c.toast('Thanks. gathr will look at “' + n + '”');
        setName('');
        setOpen(false);
      },
      (e) => {
        setSending(false);
        c.toast(sayError(e));
      }
    );
  }
  return (
    <div className="col" style={{ gap: '10px' }}>
      <span className="meta">Kind of night</span>
      <div className="wrap" role="radiogroup" aria-label="Kind of night">
        {NIGHT_KINDS.map((k) => (
          <Chip
            key={k[0]}
            role="radio"
            aria-checked={cur === k[0]}
            selected={cur === k[0]}
            onClick={() => p.onChange({ kind: k[0] })}
          >
            {k[1]}
          </Chip>
        ))}
      </div>
      {open ? (
        <div className="col" style={{ gap: '8px' }}>
          <div className="field-row">
            <input
              aria-label="A kind of night we don’t have"
              value={name}
              maxLength={40}
              placeholder="Foam party, Qawwali night…"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="btn-pair">
            <Button variant="subtle" block onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" block disabled={name.trim().length < 3 || sending} onClick={send}>
              {sending ? 'Sending…' : 'Suggest it'}
            </Button>
          </div>
          {note('Pick the closest kind above for now. If gathr adds yours, you can switch to it.')}
        </div>
      ) : (
        <button
          type="button"
          className="link-btn"
          style={{ alignSelf: 'flex-start' }}
          onClick={() => setOpen(true)}
        >
          Don’t see yours? Suggest a new kind
        </button>
      )}
    </div>
  );
}

/* The sound: sounds-like artists (which suggest the family and genre), genre family (required), exact genre and energy */
export function SoundPicker(p) {
  var c = p.ctx,
    D = p.value,
    set = p.onChange,
    like = D.soundsLike || [],
    fam = family(D.family);
  const [q, setQ] = useState('');
  var found = findArtists(q).filter((a) => like.indexOf(a[0]) < 0),
    typed = q.trim(),
    canAddTyped =
      typed.length >= 2 &&
      !found.some((a) => a[0].toLowerCase() === typed.toLowerCase()) &&
      like.indexOf(typed) < 0;
  function addArtist(name) {
    if (like.length >= 3) {
      c.toast('Three artists is plenty');
      return;
    }
    var x = { soundsLike: like.concat(name) },
      info = artistInfo(name);
    // the first artist we know sets the family and genre, if the host hasn't picked them
    if (info && !D.family) {
      x.family = info[1];
      x.genre = info[2];
      c.toast(
        'Set to ' + family(info[1])[1] + ' · ' + info[2] + ' from ' + info[0] + '. Change it below if not'
      );
    }
    set(x);
    setQ('');
  }
  return (
    <>
      <div className="col" style={{ gap: '10px' }}>
        <span className="meta">{(like.length > 1 ? 'Artists' : 'Artist') + ' · up to 3 (optional)'}</span>
        {like.length ? (
          <div className="wrap">
            {like.map((a) => (
              <Chip
                key={a}
                icon="x"
                aria-label={'Remove ' + a}
                onClick={() => set({ soundsLike: like.filter((x) => x !== a) })}
              >
                {a}
              </Chip>
            ))}
          </div>
        ) : null}
        {like.length < 3 ? (
          <div className="col" style={{ gap: '4px' }}>
            <div className="field-row">
              {icon('search', 18)}
              <input
                aria-label="Find an artist"
                value={q}
                maxLength={40}
                placeholder="Anyma, Diljit Dosanjh, Prateek Kuhad…"
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (found[0] || canAddTyped))
                    addArtist(found[0] ? found[0][0] : typed);
                }}
              />
            </div>
            {found.length || canAddTyped ? (
              <div className="artist-list" role="listbox" aria-label="Artists">
                {found.map((a) => (
                  <button
                    key={a[0]}
                    type="button"
                    role="option"
                    aria-selected="false"
                    onClick={() => addArtist(a[0])}
                  >
                    <span className="title15">{a[0]}</span>
                    <span className="meta">{family(a[1])[1] + ' · ' + a[2]}</span>
                  </button>
                ))}
                {canAddTyped ? (
                  <button type="button" role="option" aria-selected="false" onClick={() => addArtist(typed)}>
                    <span className="title15">{'Add “' + typed + '”'}</span>
                    <span className="meta">Pick the family yourself below</span>
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="col" style={{ gap: '10px' }}>
        <span className="meta">Genre family</span>
        <div className="wrap" role="radiogroup" aria-label="Genre family">
          {FAMILIES.map((f) => (
            <Chip
              key={f[0]}
              role="radio"
              aria-checked={D.family === f[0]}
              selected={D.family === f[0]}
              onClick={() => set({ family: f[0], genre: D.family === f[0] ? D.genre : '' })}
            >
              {f[1]}
            </Chip>
          ))}
        </div>
      </div>
      {fam ? (
        <div className="col" style={{ gap: '10px' }}>
          <span className="meta">{'Exact genre (optional)'}</span>
          <div className="wrap" role="radiogroup" aria-label="Exact genre">
            {fam[4].map((g) => (
              <Chip
                key={g}
                role="radio"
                aria-checked={D.genre === g}
                selected={D.genre === g}
                onClick={() => set({ genre: D.genre === g ? '' : g })}
              >
                {g}
              </Chip>
            ))}
          </div>
        </div>
      ) : null}
      <div className="col" style={{ gap: '10px' }}>
        <span className="meta">Energy (optional)</span>
        <div className="seg" role="radiogroup" aria-label="Energy">
          {ENERGY.map((x) => (
            <button
              key={x[0]}
              type="button"
              role="radio"
              aria-checked={D.energy === x[0]}
              className={D.energy === x[0] ? 'on' : ''}
              onClick={() => set({ energy: D.energy === x[0] ? '' : x[0] })}
            >
              {x[1]}
            </button>
          ))}
        </div>
        {meta('Guests can filter by energy, so it helps the right crowd find you.')}
      </div>
    </>
  );
}

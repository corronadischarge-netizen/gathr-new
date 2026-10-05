import { useRef, useState } from 'react';
import { OrgBack } from '../components/OrgBack';
import { VENUES } from '../data/listings';
import { KINDS, ORG_KEY, SOUNDS, STAGS, orgLoad, orgSave, orgVenueIds, syncOrg } from '../data/organisers';
import { Button, Chip } from '../design-system';
import { store } from '../lib/utils';
import { haptic } from '../lib/haptics';
import { Auth } from '../services/auth';
import { pushNight, remoteOn, sayError } from '../services/remote';
import { eyebrow, i3, meta, stop } from '../ui/helpers';

/* 4 · list or edit a night */
export function OrgForm(p) {
  var c = p.ctx,
    S = c.S,
    org = S.org,
    pr = org.profile || {};
  var ex = S.orgEdit ? (org.events || []).filter((o) => o.id === S.orgEdit)[0] : null;
  var today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  var minDate = today.toISOString().slice(0, 10);
  var ds = useState(
      ex
        ? Object.assign({}, ex)
        : {
            id: 'org_' + Date.now().toString(36),
            title: '',
            kind: 'club',
            sounds: [],
            date: '',
            start: '21:00',
            end: '',
            entry: 'free',
            price: '',
            capacity: '',
            age: '21',
            stag: '',
            dress: '',
            about: '',
            poster: null,
            venueId: pr.venueId,
            status: 'draft'
          }
    ),
    D = ds[0],
    setD = ds[1];
  var fileRef = useRef(null);
  function upd(x) {
    setD(Object.assign({}, D, x));
  }
  function pick(ev) {
    var f = ev.target.files && ev.target.files[0];
    if (!f) return;
    if (!/^image\//.test(f.type)) {
      c.toast('Pick an image (JPG or PNG)');
      return;
    }
    var rd = new FileReader();
    rd.onload = () => {
      var img = new Image();
      img.onload = () => {
        var W = 720,
          H = 900,
          cv = document.createElement('canvas'),
          k = Math.max(W / img.width, H / img.height);
        cv.width = W;
        cv.height = H;
        cv.getContext('2d').drawImage(
          img,
          (W - img.width * k) / 2,
          (H - img.height * k) / 2,
          img.width * k,
          img.height * k
        );
        upd({ poster: cv.toDataURL('image/jpeg', 0.82) });
      };
      img.src = rd.result;
    };
    rd.readAsDataURL(f);
    ev.target.value = '';
  }
  var need = [];
  if (D.title.trim().length < 3) need.push('a name');
  if (!D.date || D.date < minDate) need.push('a date from today');
  if (!D.start) need.push('a start time');
  if (D.entry === 'paid' && !(+D.price > 0)) need.push('a price');
  if (!D.stag) need.push('your stag policy');
  if (!D.poster) need.push('a poster');
  const [saving, setSaving] = useState(null); // 'draft' or 'review' while a save is on its way
  function save(status) {
    if (saving) return;
    var o = Object.assign({}, D, {
      title: D.title.trim(),
      status: status,
      venueId: D.venueId || pr.venueId,
      updated: new Date().toISOString()
    });
    if (!remoteOn) return saved(o, status);
    // with Supabase on, the poster is uploaded and the night saved to the database first
    setSaving(status);
    pushNight(o, status, pr).then(
      (n) => {
        setSaving(null);
        saved(n, status, o.id);
      },
      (e) => {
        setSaving(null);
        haptic.error();
        c.toast(sayError(e));
      }
    );
  }
  function saved(o, status, oldId) {
    var list = (org.events || []).filter((x) => x.id !== o.id && x.id !== oldId).concat(o);
    orgSave(c, Object.assign({}, org, { events: list }));
    c.set({
      stack: (S.mode === 'host' ? ['orghome'] : ['you', 'orghome']).concat('orgevent'),
      orgView: o.id,
      dir: 'fwd'
    });
    if (status === 'review') {
      c.toast(Auth.live ? 'Sent to gathr for a check. Usually under a day' : 'Sent for review');
      if (!Auth.live)
        setTimeout(() => {
          var cur = orgLoad();
          cur.events = cur.events.map((x) =>
            x.id === o.id && x.status === 'review' ? Object.assign({}, x, { status: 'live' }) : x
          );
          store(ORG_KEY, cur);
          syncOrg(cur);
          c.set({ org: cur, toast: 'Approved. Your night is live (demo: approved instantly)' });
        }, 2600);
    } else c.toast('Draft saved');
  }
  function F(label, id, input, hint) {
    return (
      <div className="col" style={{ gap: '8px' }}>
        <label className="meta" htmlFor={id}>
          {label}
        </label>
        {input}
        {hint || null}
      </div>
    );
  }
  return (
    <div className="full col pad-top" style={{ gap: '24px', paddingTop: '52px', paddingBottom: '32px' }}>
      <OrgBack c={c} />
      <div>
        {eyebrow(pr.name || 'Organiser')}
        {stop(ex ? 'edit your night' : 'list a night')}
      </div>
      {/* poster */}
      <div className="rowc" style={{ gap: '16px', alignItems: 'flex-end' }}>
        <button
          type="button"
          className="org-poster"
          aria-label={D.poster ? 'Change poster' : 'Add a poster'}
          onClick={() => fileRef.current && fileRef.current.click()}
          style={D.poster ? { backgroundImage: 'url(' + D.poster + ')' } : null}
        >
          {D.poster ? null : (
            <span className="col" style={{ alignItems: 'center', gap: '6px' }}>
              {i3('camera', 48)}
              <span className="meta">Add poster</span>
            </span>
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={pick} />
        <div className="col" style={{ gap: '6px', flex: 1 }}>
          <span className="title15">Poster · 4:5</span>
          {meta('A clean photo or artwork works best. Put dates and prices in the form, not on the image.')}
        </div>
      </div>
      {F(
        'Name of the night',
        'of-title',
        <div className="field-row">
          <input
            id="of-title"
            value={D.title}
            maxLength={48}
            placeholder="Techno Tuesdays: Vol. 4"
            onChange={(e) => upd({ title: e.target.value })}
          />
        </div>
      )}
      {orgVenueIds(pr).length > 1 ? (
        <div className="col" style={{ gap: '10px' }}>
          <span className="meta">Where</span>
          <div className="wrap" role="radiogroup" aria-label="Venue for this night">
            {orgVenueIds(pr)
              .filter((k) => VENUES[k])
              .map((k) => (
                <Chip
                  key={k}
                  role="radio"
                  aria-checked={(D.venueId || pr.venueId) === k}
                  selected={(D.venueId || pr.venueId) === k}
                  onClick={() => upd({ venueId: k })}
                >
                  {VENUES[k].name}
                </Chip>
              ))}
          </div>
        </div>
      ) : null}
      <div className="col" style={{ gap: '10px' }}>
        <span className="meta">Kind of night</span>
        <div className="wrap" role="radiogroup" aria-label="Kind of night">
          {KINDS.map((k) => (
            <Chip
              key={k[0]}
              role="radio"
              aria-checked={D.kind === k[0]}
              selected={D.kind === k[0]}
              onClick={() => upd({ kind: k[0] })}
            >
              {k[1]}
            </Chip>
          ))}
        </div>
      </div>
      <div className="col" style={{ gap: '10px' }}>
        <span className="meta">The sound · pick up to 3</span>
        <div className="wrap">
          {SOUNDS.map((x) => {
            var on = D.sounds.indexOf(x) >= 0;
            return (
              <Chip
                key={x}
                selected={on}
                onClick={() => {
                  var s2 = D.sounds.slice();
                  if (on) s2.splice(s2.indexOf(x), 1);
                  else if (s2.length < 3) s2.push(x);
                  else {
                    c.toast('Three sounds is plenty');
                    return;
                  }
                  upd({ sounds: s2 });
                }}
              >
                {x}
              </Chip>
            );
          })}
        </div>
      </div>
      {F(
        'One line about the night (optional)',
        'of-about',
        <div className="field-row">
          <input
            id="of-about"
            value={D.about}
            maxLength={90}
            placeholder="Warehouse sound, 3 local DJs, all night"
            onChange={(e) => upd({ about: e.target.value })}
          />
        </div>
      )}
      <div className="org-sec">
        <span className="ev-lbl">When</span>
      </div>
      {F(
        'Date',
        'of-date',
        <div className="field-row">
          <input
            id="of-date"
            type="date"
            min={minDate}
            value={D.date}
            onChange={(e) => upd({ date: e.target.value })}
          />
        </div>
      )}
      <div className="rowc" style={{ gap: '10px' }}>
        <div style={{ flex: 1 }}>
          {F(
            'Starts',
            'of-start',
            <div className="field-row">
              <input
                id="of-start"
                type="time"
                value={D.start}
                onChange={(e) => upd({ start: e.target.value })}
              />
            </div>
          )}
        </div>
        <div style={{ flex: 1 }}>
          {F(
            'Ends (optional)',
            'of-end',
            <div className="field-row">
              <input id="of-end" type="time" value={D.end} onChange={(e) => upd({ end: e.target.value })} />
            </div>
          )}
        </div>
      </div>
      <div className="org-sec">
        <span className="ev-lbl">Entry</span>
      </div>
      <div className="seg" role="radiogroup" aria-label="Entry type">
        {[
          ['free', 'Free RSVP'],
          ['paid', 'Paid pass'],
          ['door', 'Pay at door']
        ].map((t) => (
          <button
            key={t[0]}
            type="button"
            role="radio"
            aria-checked={D.entry === t[0]}
            className={D.entry === t[0] ? 'on' : ''}
            onClick={() => upd({ entry: t[0] })}
          >
            {t[1]}
          </button>
        ))}
      </div>
      {D.entry !== 'free'
        ? F(
            D.entry === 'paid' ? 'Price per pass' : 'Cover at the door (optional)',
            'of-price',
            <div className="field-row">
              <span className="cc">₹</span>
              <input
                id="of-price"
                type="text"
                inputMode="numeric"
                value={D.price}
                placeholder="500"
                onChange={(e) => upd({ price: e.target.value.replace(/\D/g, '').slice(0, 5) })}
              />
            </div>,
            D.entry === 'paid'
              ? meta('Guests pay on gathr. No fees are added on top of your price.')
              : meta('Guests book free on gathr and pay you at the door.')
          )
        : meta('Guests RSVP on gathr and get a pass. You see every name.')}
      {F(
        'Capacity (optional)',
        'of-cap',
        <div className="field-row">
          <input
            id="of-cap"
            type="text"
            inputMode="numeric"
            value={D.capacity}
            placeholder="No cap"
            onChange={(e) => upd({ capacity: e.target.value.replace(/\D/g, '').slice(0, 4) })}
          />
        </div>,
        meta('We stop taking bookings when the night is full. Guest-list passes count too.')
      )}
      <div className="org-sec">
        <span className="ev-lbl">Who gets in</span>
      </div>
      <div className="col" style={{ gap: '10px' }}>
        <span className="meta">Age</span>
        <div className="wrap" role="radiogroup" aria-label="Age">
          {['18', '21', '25'].map((a) => (
            <Chip
              key={a}
              role="radio"
              aria-checked={D.age === a}
              selected={D.age === a}
              onClick={() => upd({ age: a })}
            >
              {a + '+'}
            </Chip>
          ))}
        </div>
      </div>
      <div className="col" style={{ gap: '10px' }}>
        <span className="meta">Stag entry</span>
        <div className="col" style={{ gap: '8px' }} role="radiogroup" aria-label="Stag entry">
          {STAGS.map((x) => (
            <Chip
              key={x[0]}
              role="radio"
              aria-checked={D.stag === x[0]}
              selected={D.stag === x[0]}
              onClick={() => upd({ stag: x[0] })}
            >
              {x[1]}
            </Chip>
          ))}
        </div>
      </div>
      {F(
        'Dress code (optional)',
        'of-dress',
        <div className="field-row">
          <input
            id="of-dress"
            value={D.dress}
            maxLength={40}
            placeholder="Smart casual, no shorts"
            onChange={(e) => upd({ dress: e.target.value })}
          />
        </div>
      )}
      {meta('Government ID is checked for everyone. That’s Pune law.')}
      <div className="bottom-stack" style={{ alignItems: 'stretch' }}>
        <Button
          variant="brand"
          size="lg"
          block
          disabled={need.length > 0 || !!saving}
          onClick={() => save('review')}
        >
          {saving === 'review'
            ? 'Sending…'
            : ex && ex.status === 'live'
              ? 'Save and send for a check'
              : 'Submit for review'}
        </Button>
        {need.length ? (
          <span className="meta" style={{ textAlign: 'center' }} aria-live="polite">
            {'Still needed: ' + need.join(', ')}
          </span>
        ) : (
          <span className="meta" style={{ textAlign: 'center' }}>
            gathr checks the rules and poster, then it goes live
          </span>
        )}
        <Button
          variant="ghost"
          disabled={D.title.trim().length < 3 || !!saving}
          onClick={() => save('draft')}
        >
          {saving === 'draft' ? 'Saving…' : 'Save as draft'}
        </Button>
      </div>
    </div>
  );
}

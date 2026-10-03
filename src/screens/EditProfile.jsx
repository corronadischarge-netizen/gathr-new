import { useRef, useState } from 'react';
import { AREAS } from '../data/options';
import { Button, Chip, IconButton } from '../design-system';
import { Sms } from '../services/sms';
import { fav, icon, meta } from '../ui/helpers';

export function EditProfile(p) {
  var c = p.ctx,
    S = c.S,
    me = S.me;
  const [d, setD] = useState(Object.assign({}, me, { age: S.age, phone: S.phone || '', phoneOk: S.phoneOk }));
  var fileRef = useRef(null);
  function upd(x) {
    setD(Object.assign({}, d, x));
  }
  function pick(ev) {
    var f = ev.target.files && ev.target.files[0];
    if (!f) return;
    if (!/^image\//.test(f.type)) {
      c.toast('Pick a photo (JPG or PNG)');
      return;
    }
    var rd = new FileReader();
    rd.onload = () => {
      var img = new Image();
      img.onload = () => {
        var s = 320,
          cv = document.createElement('canvas'),
          k = Math.max(s / img.width, s / img.height);
        cv.width = s;
        cv.height = s;
        var cx2 = cv.getContext('2d');
        cx2.drawImage(img, (s - img.width * k) / 2, (s - img.height * k) / 2, img.width * k, img.height * k);
        upd({ photo: cv.toDataURL('image/jpeg', 0.85) });
      };
      img.src = rd.result;
    };
    rd.readAsDataURL(f);
    ev.target.value = '';
  }
  var okName = d.name.trim().length >= 2,
    okHandle = /^[a-z0-9._]{3,20}$/.test(d.handle),
    okPhone = !d.phone || /^[6-9]\d{9}$/.test(d.phone),
    okUpi = !d.upi || /^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(d.upi);
  function save() {
    var next = {
      name: d.name.trim(),
      handle: d.handle,
      area: d.area,
      bio: d.bio,
      photo: d.photo,
      upi: d.upi || ''
    };
    c.set({
      me: next,
      age: d.age,
      phone: d.phone || '',
      phoneOk: d.phone === S.phone ? S.phoneOk || !!d.phoneOk : !!d.phoneOk
    });
    try {
      localStorage.setItem('gathr.me', JSON.stringify(next));
    } catch (e) {}
    c.back();
    c.toast('Profile saved');
  }
  return (
    <div className="full col pad-top" style={{ gap: '24px', paddingTop: '52px', paddingBottom: '32px' }}>
      <div className="rowc between">
        <IconButton icon="arrow-left" label="Back" variant="solid" onClick={c.back} />
        <span className="title16">Edit profile</span>
        <span style={{ width: '48px' }} />
      </div>
      <div className="col" style={{ alignItems: 'center', gap: '12px' }}>
        <button
          type="button"
          className="avatar-edit"
          aria-label="Change profile photo"
          onClick={() => fileRef.current && fileRef.current.click()}
        >
          {d.photo ? <img src={d.photo} alt="" /> : fav(d.name || 'You', 104)}
          <span className="avatar-badge">{icon('image', 16)}</span>
        </button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={pick} />
        <div className="rowc" style={{ gap: '8px' }}>
          <Button variant="subtle" size="sm" onClick={() => fileRef.current && fileRef.current.click()}>
            {d.photo ? 'Change photo' : 'Add a photo'}
          </Button>
          {d.photo ? (
            <Button variant="ghost" size="sm" onClick={() => upd({ photo: null })}>
              Remove
            </Button>
          ) : null}
        </div>
      </div>
      <div className="col" style={{ gap: '8px' }}>
        <label className="meta" htmlFor="pf-name">
          Name
        </label>
        <div className="field-row">
          <input
            id="pf-name"
            value={d.name}
            maxLength={40}
            autoComplete="name"
            onChange={(ev) => upd({ name: ev.target.value })}
          />
        </div>
        {!okName ? (
          <span className="meta" style={{ color: 'var(--limit-text)' }}>
            Add your name
          </span>
        ) : null}
      </div>
      <div className="col" style={{ gap: '8px' }}>
        <label className="meta" htmlFor="pf-handle">
          Username · friends find you by this
        </label>
        <div className="field-row">
          <span className="cc">@</span>
          <input
            id="pf-handle"
            value={d.handle}
            maxLength={20}
            autoCapitalize="none"
            onChange={(ev) => upd({ handle: ev.target.value.toLowerCase().replace(/\s/g, '') })}
          />
        </div>
        {!okHandle ? (
          <span className="meta" style={{ color: 'var(--limit-text)' }}>
            3 to 20 letters, numbers, dots or underscores
          </span>
        ) : null}
      </div>
      <div className="col" style={{ gap: '8px' }}>
        <label className="meta" htmlFor="pf-bio">
          About you (optional)
        </label>
        <div className="field-row">
          <input
            id="pf-bio"
            value={d.bio || ''}
            maxLength={60}
            placeholder="Techno on Thursdays, Bollywood on Saturdays"
            onChange={(ev) => upd({ bio: ev.target.value })}
          />
        </div>
      </div>
      <div className="col" style={{ gap: '10px' }}>
        <span className="meta">Where you usually go out</span>
        <div className="wrap">
          {AREAS.map((a) => (
            <Chip key={a} icon="map-pin" selected={d.area === a} onClick={() => upd({ area: a })}>
              {a}
            </Chip>
          ))}
        </div>
      </div>
      <div className="col" style={{ gap: '10px' }}>
        <span className="meta">Age · only used to hide nights you can’t enter</span>
        <div className="wrap" role="radiogroup" aria-label="Age">
          {['18 to 20', '21 to 24', '25 or older'].map((a) => (
            <Chip
              key={a}
              role="radio"
              aria-checked={d.age === a}
              selected={d.age === a}
              onClick={() => upd({ age: a })}
            >
              {a}
            </Chip>
          ))}
        </div>
      </div>
      <div className="col" style={{ gap: '8px' }}>
        <label className="meta" htmlFor="pf-phone">
          {'Mobile number · for WhatsApp passes' + (Sms.on ? '' : ' (not verified by SMS yet)')}
        </label>
        <div className="field-row">
          <span className="cc">+91</span>
          <input
            id="pf-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="98765 43210"
            maxLength={10}
            value={d.phone || ''}
            onChange={(ev) => upd({ phone: ev.target.value.replace(/\D/g, '').slice(0, 10) })}
          />
          {Sms.on && okPhone && d.phone && !(d.phone === S.phone && S.phoneOk) ? (
            <Button
              variant="subtle"
              size="sm"
              onClick={() =>
                Sms.send(d.phone).then(
                  () => {
                    c.toast('Code sent by SMS');
                    upd({ smsSent: true });
                  },
                  (e) => {
                    c.toast(e.message);
                  }
                )
              }
            >
              Verify
            </Button>
          ) : null}
        </div>
        {d.smsSent ? (
          <div className="field-row">
            <input
              aria-label="SMS code"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="6-digit SMS code"
              maxLength={6}
              onChange={(ev) => {
                var v = ev.target.value.replace(/\D/g, '');
                if (v.length === 6)
                  Sms.verify(v).then(
                    () => {
                      upd({ smsSent: false, phoneOk: true });
                      c.toast('Number verified');
                    },
                    () => {
                      c.toast('That code doesn’t match');
                    }
                  );
              }}
            />
          </div>
        ) : null}
        {d.phone && !okPhone ? <span className="meta err-txt">Enter a 10-digit mobile number</span> : null}
      </div>
      <div className="col" style={{ gap: '8px' }}>
        <label className="meta" htmlFor="pf-upi">
          UPI ID (optional) · friends pay you back to this
        </label>
        <div className="field-row">
          <input
            id="pf-upi"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="name@okaxis"
            value={d.upi || ''}
            onChange={(ev) => upd({ upi: ev.target.value.trim() })}
          />
        </div>
        {d.upi && !okUpi ? <span className="meta err-txt">A UPI ID looks like name@bank</span> : null}
      </div>
      {S.signedIn ? (
        <div className="rowc list-row" style={{ gap: '12px' }}>
          <div className="col" style={{ gap: '2px', flexGrow: 1 }}>
            <span className="title15">Signed in as</span>
            {meta(S.email || '')}
          </div>
          <Button variant="ghost" size="sm" onClick={() => c.set({ sheet: 'logout' })}>
            Log out
          </Button>
        </div>
      ) : null}
      <Button
        variant="primary"
        size="lg"
        block
        disabled={!okName || !okHandle || !okPhone || !okUpi}
        onClick={save}
      >
        Save changes
      </Button>
    </div>
  );
}

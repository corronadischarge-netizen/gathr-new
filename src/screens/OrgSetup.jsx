import { useState } from 'react';
import { OrgBack } from '../components/OrgBack';
import { Switch } from '../components/Switch';
import { VENUES } from '../data/listings';
import { AREA_XY, orgSave } from '../data/organisers';
import { Button, Chip } from '../design-system';
import { eyebrow, meta, stop } from '../ui/helpers';

/* 2 · who you are and where you host */
export function OrgSetup(p) {
  var c = p.ctx,
    S = c.S,
    org = S.org,
    pr = org.profile || {};
  var fs = useState({
      name: pr.name || '',
      type: pr.type || 'venue',
      venueId: pr.newVenue ? 'new' : pr.venueId || '',
      vName: pr.newVenue ? pr.newVenue.name : '',
      vArea: pr.newVenue ? pr.newVenue.area : '',
      insta: pr.insta || '',
      phone: pr.phone || S.phone || '',
      agree: !!pr.name
    }),
    F = fs[0],
    setF = fs[1];
  function upd(x) {
    setF(Object.assign({}, F, x));
  }
  var okName = F.name.trim().length >= 2,
    okVenue = F.venueId && (F.venueId !== 'new' || (F.vName.trim().length >= 2 && F.vArea)),
    okInsta = /^@?[a-z0-9._]{2,30}$/i.test(F.insta.trim()),
    okPhone = !F.phone || /^[6-9]\d{9}$/.test(F.phone);
  var ok = okName && okVenue && okInsta && okPhone && F.agree;
  var venues = Object.keys(VENUES).filter((k) => k.indexOf('v_') !== 0);
  function save() {
    var vid =
      F.venueId === 'new'
        ? 'v_' +
          F.vName
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '')
            .slice(0, 20)
        : F.venueId;
    var prof = {
      name: F.name.trim(),
      type: F.type,
      venueId: vid,
      newVenue: F.venueId === 'new' ? { name: F.vName.trim(), area: F.vArea } : null,
      insta: F.insta.trim().replace(/^@/, ''),
      phone: F.phone,
      status: pr.status || 'pending',
      since: pr.since || new Date().toISOString()
    };
    orgSave(c, Object.assign({}, org, { profile: prof }));
    if (pr.name) {
      c.back();
      c.toast('Profile saved');
    } else {
      c.set({ mode: 'host', stack: ['orghome'], dir: 'fwd' });
      c.toast('You’re set up. This is hosting mode');
    }
  }
  return (
    <div className="full col pad-top" style={{ gap: '24px', paddingTop: '52px', paddingBottom: '32px' }}>
      <OrgBack c={c} />
      <div>
        {eyebrow('Organiser profile')}
        {stop(pr.name ? 'edit your profile' : 'who’s hosting?')}
      </div>
      <div className="col" style={{ gap: '8px' }}>
        <label className="meta" htmlFor="og-name">
          Name guests will see
        </label>
        <div className="field-row">
          <input
            id="og-name"
            value={F.name}
            maxLength={40}
            placeholder="Kukoo, or Techno Tuesdays"
            onChange={(e) => upd({ name: e.target.value })}
          />
        </div>
      </div>
      <div className="col" style={{ gap: '10px' }}>
        <span className="meta">You are a</span>
        <div className="wrap" role="radiogroup" aria-label="Organiser type">
          {[
            ['venue', 'Venue'],
            ['promoter', 'Promoter'],
            ['collective', 'Collective or artist']
          ].map((t) => (
            <Chip
              key={t[0]}
              role="radio"
              aria-checked={F.type === t[0]}
              selected={F.type === t[0]}
              onClick={() => upd({ type: t[0] })}
            >
              {t[1]}
            </Chip>
          ))}
        </div>
      </div>
      <div className="col" style={{ gap: '10px' }}>
        <span className="meta">{F.type === 'venue' ? 'Your venue' : 'Where you usually host'}</span>
        <div className="wrap" role="radiogroup" aria-label="Venue">
          {venues
            .map((k) => (
              <Chip
                key={k}
                role="radio"
                aria-checked={F.venueId === k}
                selected={F.venueId === k}
                onClick={() => upd({ venueId: k })}
              >
                {VENUES[k].name}
              </Chip>
            ))
            .concat(
              <Chip
                key="new"
                icon="map-pin"
                role="radio"
                aria-checked={F.venueId === 'new'}
                selected={F.venueId === 'new'}
                onClick={() => upd({ venueId: 'new' })}
              >
                A venue not listed
              </Chip>
            )}
        </div>
        {F.venueId === 'new' ? (
          <div className="col fade-up" style={{ gap: '10px' }}>
            <div className="field-row">
              <input
                aria-label="Venue name"
                value={F.vName}
                maxLength={40}
                placeholder="Venue name"
                onChange={(e) => upd({ vName: e.target.value })}
              />
            </div>
            <div className="wrap" role="radiogroup" aria-label="Area">
              {Object.keys(AREA_XY).map((a) => (
                <Chip
                  key={a}
                  role="radio"
                  aria-checked={F.vArea === a}
                  selected={F.vArea === a}
                  onClick={() => upd({ vArea: a })}
                >
                  {a}
                </Chip>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <div className="col" style={{ gap: '8px' }}>
        <label className="meta" htmlFor="og-insta">
          Instagram · we message this account to confirm it’s you
        </label>
        <div className="field-row">
          <span className="cc">@</span>
          <input
            id="og-insta"
            value={F.insta.replace(/^@/, '')}
            autoCapitalize="none"
            spellCheck={false}
            placeholder="kukoo.pune"
            onChange={(e) => upd({ insta: e.target.value.trim() })}
          />
        </div>
      </div>
      <div className="col" style={{ gap: '8px' }}>
        <label className="meta" htmlFor="og-phone">
          Mobile for the door team (optional)
        </label>
        <div className="field-row">
          <span className="cc">+91</span>
          <input
            id="og-phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={F.phone}
            placeholder="98765 43210"
            onChange={(e) => upd({ phone: e.target.value.replace(/\D/g, '') })}
          />
        </div>
        {!okPhone ? <span className="meta err-txt">Enter a 10-digit mobile number</span> : null}
      </div>
      <div className="rowc" style={{ gap: '12px', minHeight: '56px' }}>
        <div className="col" style={{ gap: '2px', flexGrow: 1 }}>
          <span className="title15">I host nights here and can confirm the door rules</span>
          {meta('Nights with wrong rules are taken down')}
        </div>
        <Switch
          on={F.agree}
          label="I host nights here and can confirm the door rules"
          onClick={() => upd({ agree: !F.agree })}
        />
      </div>
      <div className="bottom-stack" style={{ alignItems: 'stretch' }}>
        <Button variant="primary" size="lg" block disabled={!ok} onClick={save}>
          {pr.name ? 'Save profile' : 'Continue'}
        </Button>
        {!ok ? (
          <span className="meta" style={{ textAlign: 'center' }}>
            {!okName
              ? 'Add a name'
              : !okVenue
                ? 'Pick a venue'
                : !okInsta
                  ? 'Add your Instagram'
                  : !F.agree
                    ? 'Confirm you host here'
                    : 'Check your number'}
          </span>
        ) : null}
      </div>
    </div>
  );
}

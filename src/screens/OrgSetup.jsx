import { useState } from 'react';
import { OrgBack } from '../components/OrgBack';
import { Switch } from '../components/Switch';
import { VenuePicker } from '../components/VenuePicker';
import { orgSave, orgVenueIds } from '../data/organisers';
import { Button, Chip } from '../design-system';
import { haptic } from '../lib/haptics';
import { pushProfile, remoteOn, sayError } from '../services/remote';
import { eyebrow, meta, note, stop } from '../ui/helpers';

/* 2 · who you are and where you host */
export function OrgSetup(p) {
  var c = p.ctx,
    S = c.S,
    org = S.org,
    pr = org.profile || {};
  var fs = useState({
      name: pr.name || '',
      type: pr.type || 'venue',
      venueIds: orgVenueIds(pr),
      // venues they added themselves (an older profile kept one as newVenue)
      customVenues: (pr.customVenues || []).concat(
        pr.newVenue ? [Object.assign({ id: pr.venueId }, pr.newVenue)] : []
      ),
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
    okVenue = F.venueIds.length > 0,
    okInsta = /^@?[a-z0-9._]{2,30}$/i.test(F.insta.trim()),
    okPhone = !F.phone || /^[6-9]\d{9}$/.test(F.phone);
  var ok = okName && okVenue && okInsta && okPhone && F.agree;
  const [saving, setSaving] = useState(false);
  function save() {
    if (saving) return;
    var prof = {
      remoteId: pr.remoteId || null,
      name: F.name.trim(),
      type: F.type,
      venueId: F.venueIds[0], // the main venue
      venueIds: F.venueIds,
      customVenues: F.customVenues.filter((x) => F.venueIds.indexOf(x.id) >= 0),
      newVenue: null,
      insta: F.insta.trim().replace(/^@/, ''),
      phone: F.phone,
      status: pr.status || 'pending',
      since: pr.since || new Date().toISOString()
    };
    function done(saved) {
      orgSave(c, Object.assign({}, org, { profile: saved }));
      if (pr.name) {
        c.back();
        c.toast('Profile saved');
      } else {
        c.set({ mode: 'host', stack: ['orghome'], dir: 'mode' });
        c.toast('You’re set up. This is hosting mode');
      }
    }
    if (!remoteOn) return done(prof);
    // with Supabase on, the profile and venues are saved to the database first
    setSaving(true);
    pushProfile(prof).then(
      (saved) => {
        setSaving(false);
        done(saved);
      },
      (e) => {
        setSaving(false);
        haptic.error();
        c.toast(sayError(e));
      }
    );
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
      <VenuePicker
        label={F.type === 'venue' ? 'Your venues' : 'Venues you look after'}
        ids={F.venueIds}
        custom={F.customVenues}
        onChange={(ids, custom) => upd({ venueIds: ids, customVenues: custom })}
      />
      {note(
        pr.name
          ? 'Add or remove venues here any time.'
          : 'You can add more venues later from your profile: Host · profile → Edit organiser profile.'
      )}
      <div className="col" style={{ gap: '8px' }}>
        <label className="meta" htmlFor="og-insta">
          Instagram · you or your brand, kept on your profile
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
        <Button variant="primary" size="lg" block disabled={!ok || saving} onClick={save}>
          {saving ? 'Saving…' : pr.name ? 'Save profile' : 'Continue'}
        </Button>
        {!ok ? (
          <span className="meta" style={{ textAlign: 'center' }}>
            {!okName
              ? 'Add a name'
              : !okVenue
                ? 'Add at least one venue'
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

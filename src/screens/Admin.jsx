import { useEffect, useState } from 'react';
import { priceTxt } from '../data/format';
import { VENUES } from '../data/listings';
import { orgToEvent, setRemoteFeed, stagTxt } from '../data/organisers';
import { Button, IconButton } from '../design-system';
import { haptic } from '../lib/haptics';
import { decideNight, pullFeed, pullWaiting, sayError, verifyOrganiser } from '../services/remote';
import { eyebrow, meta, note, stop, thumb } from '../ui/helpers';

/* gathr admin: organisers waiting to be verified, and nights waiting to go live.
   Only people in app_admins see this (the database allows these changes for them alone). */
export function Admin(p) {
  var c = p.ctx;
  const [w, setW] = useState(null); // { organisers, nights } once loaded
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState({}); // id → true while its button is working
  function load() {
    setErr(null);
    pullWaiting().then(setW, (e) => setErr(sayError(e)));
  }
  useEffect(load, []);
  function act(id, run, msg, after) {
    if (busy[id]) return;
    setBusy(Object.assign({}, busy, { [id]: true }));
    run().then(
      () => {
        haptic.success();
        c.toast(msg);
        setW((o) => ({
          organisers: o.organisers.filter((x) => x.id !== id),
          nights: o.nights.filter((x) => x.night.id !== id)
        }));
        if (after) after();
      },
      (e) => {
        haptic.error();
        c.toast(sayError(e));
        setBusy((o) => Object.assign({}, o, { [id]: false }));
      }
    );
  }
  function refreshFeed() {
    pullFeed()
      .then((f) => {
        setRemoteFeed(f);
        c.set({ feedAt: Date.now() });
      })
      .catch(() => {});
  }
  var n = w ? w.organisers.length + w.nights.length : 0;
  return (
    <div className="full col pad-top" style={{ gap: '24px', paddingTop: '52px', paddingBottom: '48px' }}>
      <div className="rowc between">
        <IconButton icon="arrow-left" label="Back" variant="solid" onClick={c.back} />
        <Button variant="ghost" size="sm" onClick={load}>
          Refresh
        </Button>
      </div>
      <div>
        {eyebrow('gathr admin')}
        {stop(!w ? 'checking' : n ? n + ' waiting for you' : 'all clear')}
      </div>
      {err ? (
        <div className="col" style={{ gap: '10px' }}>
          <p className="meta err-txt" role="alert" style={{ margin: 0 }}>
            {err}
          </p>
          <Button variant="subtle" onClick={load}>
            Try again
          </Button>
        </div>
      ) : !w ? (
        meta('Loading what’s waiting…')
      ) : !n ? (
        <div className="col" style={{ gap: '10px' }}>
          {meta('Nothing to check. New organisers and nights sent for review show up here.')}
          <Button variant="subtle" onClick={load}>
            Check again
          </Button>
        </div>
      ) : null}
      {w && w.organisers.length ? (
        <div className="col" style={{ gap: '12px' }}>
          <span className="g-section-title">{'Organisers to verify · ' + w.organisers.length}</span>
          {note('Message them on Instagram first to confirm the account is really theirs.')}
          {w.organisers.map((o) => (
            <div key={o.id} className="g-card card col" style={{ gap: '10px', padding: '16px 18px' }}>
              <div className="col" style={{ gap: '2px' }}>
                <span className="title16">{o.name}</span>
                {meta(
                  { venue: 'Venue', promoter: 'Promoter', collective: 'Collective' }[o.type] +
                    ' · ' +
                    (o.organiser_venues || [])
                      .map((x) => (VENUES[x.venue_id] ? VENUES[x.venue_id].name : x.venue_id))
                      .join(', ')
                )}
                <a
                  className="rule-link"
                  href={'https://instagram.com/' + o.insta}
                  target="_blank"
                  rel="noopener"
                  style={{ minHeight: '32px' }}
                >
                  {'@' + o.insta + ' on Instagram'}
                </a>
                {o.phone ? meta('Door phone +91 ' + o.phone) : null}
              </div>
              <Button
                variant="primary"
                block
                disabled={!!busy[o.id]}
                onClick={() => act(o.id, () => verifyOrganiser(o.id), o.name + ' is verified')}
              >
                {busy[o.id] ? 'Verifying…' : 'Verify ' + o.name}
              </Button>
            </div>
          ))}
        </div>
      ) : null}
      {w && w.nights.length ? (
        <div className="col" style={{ gap: '12px' }}>
          <span className="g-section-title">{'Nights to check · ' + w.nights.length}</span>
          {w.nights.map((x) => {
            var e = orgToEvent(x.night, { name: x.host }),
              v = VENUES[e.venue];
            return (
              <div key={e.id} className="g-card card col" style={{ gap: '12px', padding: '16px 18px' }}>
                <div className="rowc" style={{ gap: '12px' }}>
                  {thumb(e, 64)}
                  <div className="col" style={{ gap: '2px', flexGrow: 1, minWidth: 0 }}>
                    <span className="title16">{e.title}</span>
                    {meta(x.host + ' · ' + (v ? v.name : e.venue))}
                    {meta(e.date + ' · ' + e.time + (e.end ? ' – ' + e.end : ''))}
                  </div>
                </div>
                {meta(
                  [
                    priceTxt(e),
                    e.age + '+',
                    stagTxt(e.stag),
                    e.dress ? 'Dress: ' + e.dress : null,
                    e.capacity ? e.capacity + ' capacity' : null
                  ]
                    .filter(Boolean)
                    .join(' · ')
                )}
                {e.about ? (
                  <p className="body" style={{ margin: 0 }}>
                    {e.about}
                  </p>
                ) : null}
                <div className="rowc" style={{ gap: '8px' }}>
                  <Button
                    variant="ghost"
                    disabled={!!busy[e.id]}
                    onClick={() =>
                      act(e.id, () => decideNight(e.id, false), 'Sent back to ' + x.host + ' as a draft')
                    }
                  >
                    Send back
                  </Button>
                  <div style={{ flexGrow: 1 }}>
                    <Button
                      variant="primary"
                      block
                      disabled={!!busy[e.id]}
                      onClick={() =>
                        act(e.id, () => decideNight(e.id, true), e.title + ' is live', refreshFeed)
                      }
                    >
                      {busy[e.id] ? 'Working…' : 'Put it live'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

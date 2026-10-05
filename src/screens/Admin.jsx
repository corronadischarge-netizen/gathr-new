import { useEffect, useState } from 'react';
import { priceTxt } from '../data/format';
import { VENUES } from '../data/listings';
import { NEXT_CITIES } from '../data/options';
import { orgToEvent, setRemoteFeed, stagTxt } from '../data/organisers';
import { family, nightKind } from '../data/taxonomy';
import { Button, IconButton } from '../design-system';
import { haptic } from '../lib/haptics';
import {
  cityCounts,
  decideKind,
  decideNight,
  pullFeed,
  pullKindSuggestions,
  pullReviewQueue,
  pullWaiting,
  sayError,
  setTrusted,
  verifyOrganiser
} from '../services/remote';
import { eyebrow, meta, note, stop, thumb } from '../ui/helpers';

/* what each automatic flag means, in a few words */
const FLAG = {
  new_host: 'New host',
  new_venue: 'New venue',
  duplicate: 'Possible duplicate',
  odd_price: 'Unusual price',
  reported: 'Reported',
  low_checkins: 'Low check-ins'
};

/* gathr admin: nights waiting for a check (Approve / Reject up front, the rest behind "More details"),
   organisers to verify, suggested kinds of night, and which cities people want next.
   Only people in app_admins see this (the database allows these changes for them alone). */
export function Admin(p) {
  var c = p.ctx;
  const [w, setW] = useState(null); // { organisers, nights } once loaded
  const [q, setQ] = useState({}); // event id → its flags and the host's record (from the review queue)
  const [kinds, setKinds] = useState([]);
  const [cities, setCities] = useState([]);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState({}); // id → true while its button is working
  const [open, setOpen] = useState(null); // the night showing "More details"
  const [rejecting, setRejecting] = useState(null); // { id, note } while the reject box is open
  function load() {
    setErr(null);
    pullWaiting().then(setW, (e) => setErr(sayError(e)));
    // the extras need the newer database updates; without them the screen still works
    pullReviewQueue().then(
      (rows) => {
        var m = {};
        rows.forEach((r) => (m[r.event_id] = r));
        setQ(m);
      },
      () => setQ({})
    );
    pullKindSuggestions().then(setKinds, () => setKinds([]));
    cityCounts().then(setCities, () => setCities([]));
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
        setRejecting(null);
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
  function trust(r, yes) {
    setTrusted(r.host_id, yes).then(
      () => {
        c.toast(r.host + (yes ? ' is trusted: their nights go live straight away' : ' is no longer trusted'));
        load();
      },
      (e) => c.toast(sayError(e))
    );
  }
  function kindDone(k, added) {
    decideKind(k.id, added).then(
      () => {
        c.toast(added ? '“' + k.name + '” marked as added' : 'Suggestion declined');
        setKinds((o) => o.filter((x) => x.id !== k.id));
      },
      (e) => c.toast(sayError(e))
    );
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
        meta(
          'Nothing to check. Nights from hosts who aren’t trusted yet, and anything flagged, show up here.'
        )
      ) : null}
      {w && w.nights.length ? (
        <div className="col" style={{ gap: '12px' }}>
          <span className="g-section-title">{'Nights to check · ' + w.nights.length}</span>
          {w.nights
            .slice()
            .sort(
              (a, b) =>
                ((q[b.night.id] || {}).flags || []).length - ((q[a.night.id] || {}).flags || []).length
            )
            .map((x) => {
              var e = orgToEvent(x.night, { name: x.host }),
                v = VENUES[e.venue],
                r = q[e.id],
                flags = (r && r.flags) || [],
                more = open === e.id,
                rej = rejecting && rejecting.id === e.id ? rejecting : null;
              return (
                <div key={e.id} className="g-card card col" style={{ gap: '12px', padding: '16px 18px' }}>
                  <div className="rowc" style={{ gap: '12px' }}>
                    {thumb(e, 56)}
                    <div className="col" style={{ gap: '2px', flexGrow: 1, minWidth: 0 }}>
                      <span className="title16">{e.title}</span>
                      {meta(x.host + ' · ' + (v ? v.name : e.venue) + ' · ' + e.date)}
                    </div>
                  </div>
                  {flags.length ? (
                    <div className="wrap" aria-label="Flags">
                      {flags.map((f) => (
                        <span key={f} className="flag-chip">
                          {FLAG[f] || f}
                        </span>
                      ))}
                    </div>
                  ) : r ? (
                    meta('Nothing flagged')
                  ) : null}
                  {rej ? (
                    <div className="col" style={{ gap: '8px' }}>
                      <div className="field-row">
                        <input
                          aria-label="A note for the host"
                          placeholder="What should they fix? (they’ll see this)"
                          maxLength={200}
                          value={rej.note}
                          onChange={(ev) => setRejecting({ id: e.id, note: ev.target.value })}
                        />
                      </div>
                      <div className="btn-pair">
                        <Button
                          variant="subtle"
                          block
                          disabled={!!busy[e.id]}
                          onClick={() =>
                            act(
                              e.id,
                              () => decideNight(e.id, 'back', rej.note.trim()),
                              'Sent back to ' + x.host
                            )
                          }
                        >
                          Send back to fix
                        </Button>
                        <Button
                          variant="primary"
                          block
                          disabled={!!busy[e.id]}
                          onClick={() =>
                            act(
                              e.id,
                              () => decideNight(e.id, 'reject', rej.note.trim()),
                              e.title + ' rejected'
                            )
                          }
                        >
                          Reject for good
                        </Button>
                      </div>
                      <button type="button" className="link-btn" onClick={() => setRejecting(null)}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="btn-pair">
                      <Button
                        variant="subtle"
                        block
                        disabled={!!busy[e.id]}
                        onClick={() => setRejecting({ id: e.id, note: '' })}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="primary"
                        block
                        disabled={!!busy[e.id]}
                        onClick={() =>
                          act(e.id, () => decideNight(e.id, 'live'), e.title + ' is live', refreshFeed)
                        }
                      >
                        {busy[e.id] ? 'Working…' : 'Approve'}
                      </Button>
                    </div>
                  )}
                  <button
                    type="button"
                    className="link-btn"
                    style={{ alignSelf: 'flex-start' }}
                    aria-expanded={more}
                    onClick={() => setOpen(more ? null : e.id)}
                  >
                    {more ? 'Fewer details' : 'More details'}
                  </button>
                  {more ? (
                    <div className="col" style={{ gap: '8px' }}>
                      {meta(
                        [
                          e.time + (e.end ? ' – ' + e.end : ''),
                          priceTxt(e),
                          e.age + '+',
                          stagTxt(e.stag),
                          e.dress ? 'Dress: ' + e.dress : null,
                          e.capacity ? e.capacity + ' capacity' : null
                        ]
                          .filter(Boolean)
                          .join(' · ')
                      )}
                      {meta(
                        [nightKind(e.kindKey)[1], e.family ? family(e.family)[1] : null, e.exactGenre]
                          .filter(Boolean)
                          .join(' · ')
                      )}
                      {e.about ? (
                        <p className="body" style={{ margin: 0 }}>
                          {e.about}
                        </p>
                      ) : null}
                      {r
                        ? meta(
                            [
                              r.host_verified ? 'Verified' : 'Not verified',
                              r.host_trusted ? 'trusted' : 'not trusted yet',
                              r.host_nights + (r.host_nights === 1 ? ' night' : ' nights') + ' put live',
                              r.turnout != null ? Math.round(r.turnout * 100) + '% turned up' : null,
                              r.reports
                                ? r.reports + (r.reports === 1 ? ' report' : ' reports')
                                : 'no reports'
                            ]
                              .filter(Boolean)
                              .join(' · ')
                          )
                        : null}
                      <a
                        className="rule-link"
                        href={'https://instagram.com/' + x.insta}
                        target="_blank"
                        rel="noopener"
                      >
                        {'@' + x.insta + ' on Instagram'}
                      </a>
                      {r ? (
                        <Button variant="ghost" size="sm" onClick={() => trust(r, !r.host_trusted)}>
                          {r.host_trusted
                            ? 'Stop trusting ' + x.host
                            : 'Trust ' + x.host + ' (go live without a check)'}
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
        </div>
      ) : null}
      {w && w.organisers.length ? (
        <div className="col" style={{ gap: '12px' }}>
          <span className="g-section-title">{'Organisers to verify · ' + w.organisers.length}</span>
          {note('Check their Instagram looks like the real account before you verify.')}
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
      {kinds.length ? (
        <div className="col" style={{ gap: '12px' }}>
          <span className="g-section-title">{'Suggested kinds of night · ' + kinds.length}</span>
          {note(
            'Marking one added doesn’t change the app by itself: add it to the list in the code, then mark it here.'
          )}
          {kinds.map((k) => (
            <div key={k.id} className="rowc list-row" style={{ gap: '8px' }}>
              <div className="col" style={{ gap: '2px', flexGrow: 1, minWidth: 0 }}>
                <span className="title15">{k.name}</span>
                {k.example ? meta('For “' + k.example + '”') : null}
              </div>
              <Button variant="ghost" size="sm" onClick={() => kindDone(k, false)}>
                Decline
              </Button>
              <Button variant="subtle" size="sm" onClick={() => kindDone(k, true)}>
                Added
              </Button>
            </div>
          ))}
        </div>
      ) : null}
      {cities.length ? (
        <div className="col" style={{ gap: '8px' }}>
          <span className="g-section-title">Cities people want next</span>
          {cities.map((x) => (
            <div key={x.city} className="rowc list-row" style={{ gap: '8px', minHeight: '48px' }}>
              <span className="title15" style={{ flexGrow: 1 }}>
                {(NEXT_CITIES.filter((k) => k[0] === x.city)[0] || [0, x.city])[1]}
              </span>
              {meta(x.people + (+x.people === 1 ? ' person' : ' people'))}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

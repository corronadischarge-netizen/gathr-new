import { GuestList } from '../components/GuestList';
import { OrgBack } from '../components/OrgBack';
import { APP_URL, CFG } from '../config';
import { priceTxt } from '../data/format';
import { EVENTS, VENUES } from '../data/listings';
import { ST_LBL, hashN, nightStage, orgLoad, orgSave, orgStats, orgToEvent, passCount } from '../data/organisers';
import { Button } from '../design-system';
import { shareToast } from '../lib/utils';
import { OrgHome } from './OrgHome';
import { Share } from '../services/share';
import { i3, meta, note, statusChip, thumb } from '../ui/helpers';

/* 5 · one night: status, funnel, audience, who's coming, with door check-in */
export function OrgEvent(p) {
  var c = p.ctx,
    S = c.S,
    org = S.org,
    id = S.orgView,
    o = (org.events || []).filter((x) => x.id === id)[0];
  var e = EVENTS[id] || (o ? orgToEvent(o, org.profile) : null);
  if (!e) return <OrgHome ctx={c} />;
  var st = orgStats(S, id),
    status = o ? nightStage(o, e) : 'live',
    lb = ST_LBL[status];
  var passes = passCount(st.guests),
    inCount = st.guests.filter((g) => st.ci[g.name]).reduce((a, g) => a + g.passes, 0);
  var inPeople = st.guests.filter((g) => st.ci[g.name]).length;
  var funnel = [
      ['Viewed', st.views],
      ['Interested', st.interested],
      ['Booked', st.guests.length],
      ['Checked in', inPeople]
    ],
    max = Math.max(1, st.views);
  function remove() {
    var cur = orgLoad();
    cur.events = cur.events.filter((x) => x.id !== id);
    orgSave(c, cur);
    c.set({ stack: S.mode === 'host' ? ['orghome'] : ['you', 'orghome'], dir: 'back' });
    c.toast('Night removed');
  }
  return (
    <div className="full col pad-top" style={{ gap: '24px', paddingTop: '52px', paddingBottom: '32px' }}>
      <OrgBack
        c={c}
        right={
          o && status !== 'rejected' ? (
            <Button variant="subtle" size="sm" onClick={() => c.go('orgform', { orgEdit: id })}>
              Edit
            </Button>
          ) : null
        }
      />
      <div className="rowc" style={{ gap: '14px' }}>
        {e.img ? (
          thumb(e, 72)
        ) : (
          <span className="org-noposter" style={{ width: '72px', height: '72px' }}>
            {i3('camera', 40)}
          </span>
        )}
        <div className="col" style={{ gap: '4px', minWidth: 0 }}>
          <h1 className="g-display disp" style={{ fontSize: '24px', lineHeight: '28px', margin: 0 }}>
            {e.title}
          </h1>
          {meta(e.date + ' · ' + e.time + ' · ' + priceTxt(e))}
          <div className="rowc" style={{ gap: '6px' }}>
            {statusChip(o ? lb[0] : 'Listed', lb[1])}
            {st.sample ? statusChip('Sample numbers', 'wait') : null}
          </div>
        </div>
      </div>
      {status === 'review' ? (
        <div className="demo-box">
          <b>gathr is checking this night</b>
          <span>
            We look at the poster and door rules, usually within a day. You’ll get an update here when it’s live.
          </span>
        </div>
      ) : null}
      {status === 'back' ? (
        <div className="host-notice is-warn" role="status">
          <div className="col host-notice-txt" style={{ padding: 'var(--space-4)' }}>
            <span className="title15">gathr sent this night back</span>
            <span className="host-notice-body">{o.reviewNote}</span>
            <span className="host-notice-more">Fix the details and send it again. It isn’t listed until then.</span>
            <div style={{ paddingTop: 'var(--space-2)' }}>
              <Button variant="primary" size="sm" onClick={() => c.go('orgform', { orgEdit: id })}>
                Fix and send again
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      {status === 'rejected' ? (
        <div className="host-notice is-no" role="status">
          <div className="col host-notice-txt" style={{ padding: 'var(--space-4)' }}>
            <span className="title15">gathr didn’t approve this night</span>
            <span className="host-notice-body">{o.reviewNote || 'It doesn’t fit gathr’s rules.'}</span>
            <span className="host-notice-more">
              {'It won’t be listed. Think this is a mistake? Email ' + CFG.contactEmail + '.'}
            </span>
          </div>
        </div>
      ) : null}
      {status === 'draft' ? (
        <div className="demo-box">
          <b>Draft · only you can see this</b>
          <span>Finish the details and submit it for review.</span>
        </div>
      ) : null}
      {status === 'live' && o ? (
        <div className="rowc" style={{ gap: '8px' }}>
          <div style={{ flex: 1 }}>
            <Button
              variant="subtle"
              size="sm"
              block
              icon="share"
              onClick={() =>
                Share.link(
                  e.title,
                  e.title + ' at ' + (VENUES[e.venue] || {}).name + ' · ' + e.date + ' · on gathr',
                  APP_URL + '#e=' + e.id
                ).then((r) => {
                  var t = shareToast(r, 'Link');
                  if (t) c.toast(t);
                })
              }
            >
              Share link
            </Button>
          </div>
          <div style={{ flex: 1 }}>
            <Button
              variant="subtle"
              size="sm"
              block
              icon="arrow-up-right"
              onClick={() => c.set({ mode: 'guest', stack: ['tonight', 'event'], cur: id, dir: 'mode' })}
            >
              See it as a guest
            </Button>
          </div>
        </div>
      ) : null}
      {/* funnel: one measure, one hue, labelled bars */}
      <section className="col" style={{ gap: '12px' }} aria-labelledby="oe-funnel">
        <div className="sec-row">
          <h2 id="oe-funnel" className="g-section-title" style={{ margin: 0 }}>
            From interest to the door
          </h2>
          {st.cap ? meta(passes + ' of ' + st.cap + ' passes') : meta('people, not passes')}
        </div>
        <div className="ev-card col" style={{ gap: '14px' }}>
          {funnel.map((f, i) => {
            var pct = Math.round((f[1] / max) * 100),
              conv = i
                ? funnel[i - 1][1]
                  ? Math.round((f[1] / funnel[i - 1][1]) * 100) + '% of ' + funnel[i - 1][0].toLowerCase()
                  : '—'
                : null;
            return (
              <div key={f[0]} className="col" style={{ gap: '6px' }}>
                <div className="rowc between">
                  <span className="title15">{f[0]}</span>
                  <span className="rowc" style={{ gap: '8px' }}>
                    {conv ? meta(conv) : null}
                    <b className="org-n">{f[1].toLocaleString('en-IN')}</b>
                  </span>
                </div>
                <div className="org-bar" role="img" aria-label={f[0] + ': ' + f[1]}>
                  <i style={{ width: Math.max(pct, f[1] ? 2 : 0) + '%' }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
      {/* audience */}
      <section className="col" style={{ gap: '12px' }} aria-labelledby="oe-aud">
        <h2 id="oe-aud" className="g-section-title" style={{ margin: 0 }}>
          Who’s interested
        </h2>
        {st.interested >= 20 ? (
          <div className="ev-card col" style={{ gap: '12px' }}>
            {[
              ['21–24', hashN(id + 'a', 38, 52)],
              ['25–29', hashN(id + 'b', 28, 38)],
              ['30+', 0]
            ].map((m, i, arr) => {
              var v = i === 2 ? 100 - arr[0][1] - arr[1][1] : m[1];
              return (
                <div key={m[0]} className="rowc" style={{ gap: '12px' }}>
                  <span className="meta" style={{ width: '48px' }}>
                    {m[0]}
                  </span>
                  <div className="org-bar" style={{ flexGrow: 1 }}>
                    <i style={{ width: v + '%' }} />
                  </div>
                  <span className="meta" style={{ width: '36px', textAlign: 'right' }}>
                    {v + '%'}
                  </span>
                </div>
              );
            })}
            <div className="ev-divider" />
            {meta(
              'Also into: ' +
                ['Bollywood', 'Hip-hop', 'Techno', 'House', 'Commercial']
                  .filter((x, i) => hashN(id + x, 0, 2) > 0 || i < 2)
                  .slice(0, 3)
                  .join(', ') +
                ' · mostly from ' +
                ['Koregaon Park', 'Kalyani Nagar', 'Baner'][hashN(id, 0, 2)]
            )}
          </div>
        ) : (
          <div className="ev-card">
            {meta(
              'Age mix and favourite sounds show once 20 people are interested. Below that, it could single people out.'
            )}
          </div>
        )}
      </section>
      <GuestList ctx={c} id={id} live={status === 'live'} />
      {st.sample ? note('Numbers for listed nights are sample data until the venue lists on gathr.') : null}
      {o ? (
        <Button variant="ghost" style={{ color: 'var(--limit-text)' }} onClick={remove}>
          {status === 'live' ? 'Take this night down' : 'Delete this night'}
        </Button>
      ) : null}
    </div>
  );
}

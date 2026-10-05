import { HostBar } from '../components/HostBar';
import { OrgBack } from '../components/OrgBack';
import { priceTxt } from '../data/format';
import { EVENTS, isPast, upcoming } from '../data/listings';
import { ST_LBL, orgStats, orgToEvent, orgVenueIds, orgVenuesLabel, passCount } from '../data/organisers';
import { Badge, Button } from '../design-system';
import { OrgIntro } from './OrgIntro';
import { eyebrow, i3, meta, note, statusChip, stop, thumb } from '../ui/helpers';
import { Tap } from '../ui/Tap';

export function OrgHome(p) {
  var c = p.ctx,
    S = c.S,
    org = S.org,
    pr = org.profile;
  if (!pr) return <OrgIntro ctx={c} />;
  var own = (org.events || []).map((o) => ({
    id: o.id,
    o: o,
    e: EVENTS[o.id] || orgToEvent(o, pr),
    st: o.status === 'live' && isPast(orgToEvent(o, pr)) ? 'past' : o.status
  }));
  var mine = orgVenueIds(pr);
  var listed = upcoming()
    .filter((k) => mine.indexOf(EVENTS[k].venue) >= 0 && !EVENTS[k].org)
    .map((k) => ({ id: k, e: EVENTS[k], st: 'live', imported: true }));
  var all = own.concat(listed).sort((a, b) => new Date(a.e.iso) - new Date(b.e.iso));
  var up = all.filter((x) => x.st === 'live'),
    tot = { guests: 0, ci: 0, int: 0 };
  up.forEach((x) => {
    var st = orgStats(S, x.id);
    tot.guests += passCount(st.guests);
    tot.ci += st.checkedIn;
    tot.int += st.interested;
  });
  return (
    <div
      className="full col pad-top"
      style={{ gap: '26px', paddingTop: '52px', paddingBottom: S.mode === 'host' ? '140px' : '32px' }}
    >
      {S.mode === 'host' && S.stack.length === 1 ? (
        <HostBar ctx={c} />
      ) : (
        <OrgBack
          c={c}
          right={
            <Button variant="subtle" size="sm" onClick={() => c.go('orgsetup')}>
              Profile
            </Button>
          }
        />
      )}
      <div className="col" style={{ gap: '6px' }}>
        {eyebrow(
          (orgVenuesLabel(pr) ? orgVenuesLabel(pr) + ' · ' : '') +
            { venue: 'Venue', promoter: 'Promoter', collective: 'Collective' }[pr.type]
        )}
        {stop(pr.name.toLowerCase())}
        <div className="rowc" style={{ gap: '8px' }}>
          {pr.status === 'verified' ? (
            <Badge tone="go">Verified</Badge>
          ) : (
            <Badge tone="now">Verification pending</Badge>
          )}
          {pr.status === 'verified' ? null : meta('We’ll message @' + pr.insta)}
        </div>
      </div>
      <div className="org-stats" role="list" aria-label="Upcoming nights, totals">
        {[
          ['On the list', tot.guests, 'passes'],
          ['Checked in', tot.ci, 'so far'],
          ['Interested', tot.int, 'saves']
        ].map((x) => (
          <div key={x[0]} className="ev-fact" role="listitem">
            <span className="ev-lbl">{x[0]}</span>
            <span className="ev-val">{x[1].toLocaleString('en-IN')}</span>
            <span className="ev-sub">{x[2]}</span>
          </div>
        ))}
      </div>
      <Button
        variant="brand"
        size="lg"
        block
        icon="ticket"
        onClick={() => c.go('orgform', { orgEdit: null })}
      >
        List a night
      </Button>
      <div className="col" style={{ gap: '4px' }}>
        <div className="sec-row">
          <h2 className="g-section-title" style={{ margin: 0 }}>
            Your nights
          </h2>
          {meta(all.length + (all.length === 1 ? ' night' : ' nights'))}
        </div>
        {all.length ? (
          all.map((x) => {
            var st = orgStats(S, x.id),
              lb = ST_LBL[x.st] || ST_LBL.draft;
            return (
              <Tap
                onClick={() => c.go('orgevent', { orgView: x.id })}
                key={x.id}
                className="tap rowc list-row"
                style={{ gap: '12px', minHeight: '76px' }}
                aria-label={x.e.title + ', ' + lb[0]}
              >
                {x.e.img ? thumb(x.e, 56) : <span className="org-noposter">{i3('camera', 34)}</span>}
                <div className="col" style={{ gap: '3px', flexGrow: 1, minWidth: 0 }}>
                  <span className="title15">{x.e.title}</span>
                  {meta(
                    x.e.date +
                      ' · ' +
                      (x.st === 'live' || x.st === 'past'
                        ? passCount(st.guests) + ' on the list · ' + st.interested + ' interested'
                        : priceTxt(x.e))
                  )}
                </div>
                {statusChip(x.imported ? 'Listed' : lb[0], lb[1])}
              </Tap>
            );
          })
        ) : (
          <div className="g-card card col empty-card">
            {i3('spotlight', 64)}
            <span className="title16">No nights yet</span>
            {meta('List your first night. It goes live once gathr checks it.')}
          </div>
        )}
      </div>
      {listed.length
        ? note('Nights marked “Listed” came from District or Sort My Scene. Their numbers are sample data.')
        : null}
    </div>
  );
}

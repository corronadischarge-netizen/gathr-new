import { HostBar } from '../components/HostBar';
import { orgVenuesLabel } from '../data/organisers';
import { Badge, Button } from '../design-system';
import { OrgIntro } from './OrgIntro';
import { eyebrow, icon, meta, note, stop } from '../ui/helpers';

/* Profile: who you host as, and the way back to going out */
export function HostProfile(p) {
  var c = p.ctx,
    S = c.S,
    pr = S.org.profile;
  if (!pr) return <OrgIntro ctx={c} />;
  var where = orgVenuesLabel(pr);
  return (
    <div className="full col pad-top" style={{ gap: '24px', paddingTop: '52px', paddingBottom: '140px' }}>
      <HostBar ctx={c} />
      <div className="col" style={{ gap: '6px' }}>
        {eyebrow(
          { venue: 'Venue', promoter: 'Promoter', collective: 'Collective' }[pr.type] +
            (where ? ' · ' + where : '')
        )}
        {stop(pr.name.toLowerCase())}
        <div className="rowc" style={{ gap: '8px' }}>
          {pr.status === 'verified' ? (
            <Badge tone="go">Verified</Badge>
          ) : (
            <Badge tone="now">Verification pending</Badge>
          )}
          {meta('@' + pr.insta)}
        </div>
      </div>
      <div className="ev-card col ev-rows">
        {[
          [
            'Edit organiser profile',
            'Name, venues, Instagram, door phone',
            () => {
              c.go('orgsetup');
            },
            'user'
          ],
          [
            'List a night',
            'Free, paid or pay at the door',
            () => {
              c.go('orgform', { orgEdit: null });
            },
            'ticket'
          ]
        ].map((r, i) => (
          <div key={r[0]}>
            {i ? <div className="ev-divider" /> : null}
            <button type="button" className="ev-row" onClick={r[2]}>
              <span className="ev-row-ic">{icon(r[3], 20)}</span>
              <span className="col" style={{ gap: '2px', flexGrow: 1, textAlign: 'left' }}>
                <span className="title15">{r[0]}</span>
                <span className="meta">{r[1]}</span>
              </span>
              {icon('chevron-right')}
            </button>
          </div>
        ))}
      </div>
      <div className="ev-card col" style={{ gap: '6px' }}>
        <span className="title15">Door staff</span>
        {meta(
          'Invite bouncers to scan passes from their own phones, with no access to money or editing. Turns on once door check-ins sync online.'
        )}
      </div>
      <Button variant="primary" size="lg" block onClick={c.toGuest}>
        Switch to going out
      </Button>
      {note('Same account in both modes. Your passes and plans are in going-out mode.')}
    </div>
  );
}

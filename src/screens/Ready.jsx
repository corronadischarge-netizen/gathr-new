import { BeforeYouGoCard } from '../cards/BeforeYouGoCard';
import { APP_URL } from '../config';
import { VENUES } from '../data/listings';
import { ActionBar, CrowdMeter, IconButton } from '../design-system';
import { shareToast } from '../lib/utils';
import { Share } from '../services/share';
import { eyebrow, fav, note, statusChip, stop } from '../ui/helpers';

export function Ready(p) {
  var c = p.ctx,
    S = c.S,
    e = c.plan || c.ev,
    v = VENUES[e.venue];
  var grp = S.gp && S.gp.stage === 'booked' && S.gp.booked === e.id;
  return (
    <div className="full col pad-top" style={{ gap: '28px', paddingTop: '52px' }}>
      <div className="rowc between">
        <IconButton icon="arrow-left" label="Back" variant="solid" onClick={c.back} />
        <IconButton
          icon="share"
          label="Share the night details"
          variant="solid"
          onClick={() =>
            Share.link(
              e.title,
              e.title +
                '\n' +
                v.name +
                ', ' +
                v.area +
                '\n' +
                e.date +
                ' · starts ' +
                e.time +
                '\nMap: https://www.google.com/maps/search/?api=1&query=' +
                v.lat +
                ',' +
                v.lng,
              APP_URL + '#e=' + e.id
            ).then(
              (r) => {
                var t = shareToast(r, 'Night details');
                if (t) c.toast(t);
              },
              () => c.toast('Couldn’t share. Try again')
            )
          }
        />
      </div>
      <div>
        {eyebrow(e.date + ' · ' + v.name)}
        {stop('starts at ' + e.time)}
      </div>
      <div className="rowc" style={{ gap: '8px' }}>
        <CrowdMeter booked={v.booked} cap={v.cap} level={v.crowd} />
      </div>
      {grp ? (
        <div className="col" style={{ gap: '14px' }}>
          <span className="g-section-title">Going with you</span>
          <div className="crew">
            {S.gp.members.map((n) => (
              <div key={n} className="crew-item">
                {fav(n, 56)}
                <span className="meta" style={{ color: 'var(--ink)' }}>
                  {n}
                </span>
                {statusChip('Has pass', 'ok')}
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <BeforeYouGoCard e={e} />
      {note('Bookings are sample data')}
      <div className="bottom-stack" style={{ alignItems: 'stretch' }}>
        {/* showing a pass doesn't book anything, so the main button is white */}
        <ActionBar
          icons={[
            { icon: 'navigation', label: 'Get directions', onClick: () => Share.directions(v) },
            { icon: 'calendar-plus', label: 'Add to calendar', onClick: () => Share.calendar(e, v) }
          ]}
          main={{ label: 'Show my pass', icon: 'ticket', variant: 'primary', onClick: () => c.go('pass') }}
        />
      </div>
    </div>
  );
}

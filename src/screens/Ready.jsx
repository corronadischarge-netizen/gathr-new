import { BeforeYouGoCard } from '../cards/BeforeYouGoCard';
import { APP_URL } from '../config';
import { VENUES } from '../data/listings';
import { Button, CrowdMeter, IconButton } from '../design-system';
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
          label="Send the night details on WhatsApp"
          variant="solid"
          onClick={() =>
            Share.whatsapp(
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
                v.lng +
                '\n' +
                APP_URL +
                '#e=' +
                e.id
            )
          }
        />
      </div>
      <div>
        {eyebrow(e.date + ' · ' + v.name)}
        {stop('starts at ' + e.time)}
      </div>
      <div className="rowc" style={{ gap: '8px' }}>
        <CrowdMeter level={v.crowd} line="Expected on the night" />
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
      {note('Crowd is sample data.')}
      <div className="bottom-stack" style={{ alignItems: 'stretch' }}>
        <div className="rowc" style={{ gap: '8px' }}>
          <div style={{ flex: 1 }}>
            <Button variant="subtle" block icon="navigation" onClick={() => Share.directions(v)}>
              Directions
            </Button>
          </div>
          <div style={{ flex: 1 }}>
            <Button
              variant="subtle"
              block
              icon="calendar"
              onClick={() => {
                Share.ics(e, v);
                c.toast('Calendar file downloaded. Open it to add the night');
              }}
            >
              Add to calendar
            </Button>
          </div>
        </div>
        <Button variant="primary" size="lg" block icon="ticket" onClick={() => c.go('pass')}>
          Show my pass
        </Button>
      </div>
    </div>
  );
}

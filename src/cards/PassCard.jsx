import { QRCode } from '../components/QRCode';
import { APP_URL } from '../config';
import { priceTxt, rupees } from '../data/format';
import { DOOR_OK, levelOf, nightsCount, passCode } from '../data/sample';
import { Badge, Button } from '../design-system';
import { passPayload } from '../lib/passQr';
import { poss } from '../lib/utils';
import { Share } from '../services/share';
import { i3, meta, thumb } from '../ui/helpers';

/* Pass: the booked night, the entry code and, for 2+ passes, sending friends theirs */
export function PassCard(p) {
  var c = p.ctx,
    S = c.S,
    e = p.e,
    v = p.v;
  // a guest-list pass: free entry from the host or a promoter, for you and your named plus-ones
  var gl = S.myBookings && S.myBookings[e.id] && S.myBookings[e.id].guests ? S.myBookings[e.id] : null;
  var from = gl && (S.myGuestLists || []).filter((g) => g.bookingId === gl.id)[0];
  if (gl && from) gl = Object.assign({ listOwner: from.owner, plusOnes: from.plusOnes }, gl);
  return (
    <div className="g-card card col pass-card" style={{ marginTop: '24px', padding: '20px', gap: '16px' }}>
      {i3('wristband', 96, 'pass-ic')}
      <div className="rowc" style={{ gap: '8px', flexWrap: 'wrap', paddingRight: '64px' }}>
        <Badge tone="go">{gl ? 'Guest list · free entry' : e.rsvp ? 'RSVP confirmed' : 'Booked'}</Badge>
        <Badge tone="neutral">{levelOf(nightsCount(S))[0]}</Badge>
        {DOOR_OK[v.id] ? <Badge tone="neutral">Door confirmed</Badge> : null}
      </div>
      <div className="rowc" style={{ gap: '12px' }}>
        {thumb(e, 56)}
        <div className="col" style={{ gap: '4px' }}>
          <span style={{ fontSize: '17px', lineHeight: '22px', fontWeight: 600 }}>{e.title}</span>
          {meta(
            e.time +
              (e.gates ? ' · gates ' + e.gates : '') +
              ' · ' +
              (gl
                ? (gl.listOwner ? poss(gl.listOwner) + ' guest list' : 'guest list') +
                  (gl.plusOnes && gl.plusOnes.length ? ' · you + ' + gl.plusOnes.join(', ') : '')
                : e.price
                  ? S.paidSplit
                    ? '₹' + e.price.toLocaleString('en-IN') + ' paid (your share)'
                    : '₹' + (e.price * S.guests).toLocaleString('en-IN') + ' paid'
                  : priceTxt(e))
          )}
        </div>
      </div>
      <div style={{ height: 0, borderTop: '1px dashed var(--line)' }} />
      <div className="col" style={{ alignItems: 'center', gap: '10px' }}>
        <QRCode
          text={passPayload(e.id, passCode(S, e), S.guests || 1)}
          size={184}
          label={'Pass QR code for ' + e.title + '. Booking ' + passCode(S, e)}
        />
        <span className="pass-code">{passCode(S, e)}</span>
        {meta(
          S.payId && !/^demo_/.test(S.payId)
            ? 'Show this and your ID at the door'
            : 'Show this and your ID at the door · demo booking'
        )}
      </div>
      {S.guests > 1 ? <GuestPasses ctx={c} e={e} v={v} /> : null}
    </div>
  );
}

/* The friends' passes: who has one, send them on WhatsApp, ask to be paid back on UPI */
function GuestPasses(p) {
  var c = p.ctx,
    S = c.S,
    e = p.e,
    v = p.v;
  var grp = S.gp && S.gp.stage === 'booked' && S.gp.booked === e.id,
    names = grp ? ['Riya'].concat(S.gp.members) : null;
  return (
    <div className="col" style={{ gap: '10px' }}>
      <div style={{ height: 0, borderTop: '1px dashed var(--line)' }} />
      <div className="rowc between">
        <span className="title15">{S.guests + ' passes'}</span>
        {meta(S.sent ? 'Everyone has theirs' : '1 of ' + S.guests + ' with you')}
      </div>
      <div className="rowc" style={{ gap: '8px', flexWrap: 'wrap' }}>
        {Array.from({ length: S.guests }, (_, i) => (
          <span key={i} className={'pass-chip' + (i === 0 || S.sent ? '' : ' wait')}>
            {i === 0
              ? 'You ✓'
              : names
                ? names[i] + (S.sent ? ' ✓' : '')
                : S.sent
                  ? 'Pass ' + (i + 1) + ' · sent'
                  : 'Pass ' + (i + 1)}
          </span>
        ))}
      </div>
      <Button
        variant="subtle"
        block
        icon="share"
        onClick={() => {
          Share.whatsapp(
            'I got you a pass for ' +
              e.title +
              ' at ' +
              v.name +
              ', ' +
              e.date +
              ' · ' +
              e.time +
              '. Booking ' +
              passCode(S, e) +
              ' is under my name, so we go in together. Bring your ID.\n' +
              APP_URL +
              '#e=' +
              e.id
          );
          c.set({ sent: true });
        }}
      >
        {S.sent
          ? 'Send the passes again'
          : 'Send ' + (S.guests - 1) + (S.guests === 2 ? ' pass' : ' passes') + ' on WhatsApp'}
      </Button>
      {e.price && !grp ? (
        <button
          type="button"
          className="link-btn"
          style={{ alignSelf: 'center' }}
          onClick={() => {
            var upi = S.me.upi;
            Share.whatsapp(
              'Your share for ' +
                e.title +
                ' is ' +
                rupees(e.price) +
                '.' +
                (upi
                  ? ' Pay me on UPI: upi://pay?pa=' +
                    encodeURIComponent(upi) +
                    '&pn=' +
                    encodeURIComponent(S.me.name || 'gathr') +
                    '&am=' +
                    e.price +
                    '&cu=INR&tn=' +
                    encodeURIComponent(e.title)
                  : '')
            );
            if (!upi) c.toast('Tip: add your UPI ID in Edit profile to include a pay link');
          }}
        >
          Ask friends to pay you back on UPI
        </button>
      ) : null}
    </div>
  );
}

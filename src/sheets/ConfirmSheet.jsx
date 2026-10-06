import { srcName } from '../data/format';
import { VENUES } from '../data/listings';
import { Button, Sheet } from '../design-system';
import { cancelBooking, remoteOn, sayError } from '../services/remote';

/* "Are you sure?" for cancelling a booking (sheet 'cancel') or logging out (sheet 'logout') */
export function ConfirmSheet(p) {
  var c = p.ctx,
    S = c.S,
    close = p.close;
  var pe = c.plan || c.ev,
    isCancel = S.sheet === 'cancel';
  return (
    <Sheet
      title={isCancel ? 'Cancel your booking?' : 'Log out of gathr?'}
      subtitle={
        isCancel
          ? pe.title + ' · ' + VENUES[pe.venue].name + ' · ' + pe.date
          : 'Your passes and plans come back when you log in again.'
      }
      onClose={close}
    >
      <p className="body muted" style={{ margin: 0 }}>
        {isCancel
          ? "You'll lose your spot" +
            (S.guests > 1 ? ' and your friends’ spots' : '') +
            '. Refunds follow the organiser’s policy on ' +
            srcName(pe) +
            '.'
          : 'Log back in any time with Google or your email.'}
      </p>
      <div className="col" style={{ gap: '10px' }}>
        <Button variant="primary" size="lg" block onClick={close}>
          {isCancel ? 'Keep my booking' : 'Stay logged in'}
        </Button>
        <Button
          variant="ghost"
          block
          style={{ color: 'var(--limit-text)' }}
          onClick={() => {
            if (isCancel) {
              var held = S.myBookings && S.myBookings[pe.id];
              // a booking saved in Supabase is cancelled there first (it fails if they're already checked in)
              if (remoteOn && held && !S.busy) {
                c.set({ busy: 'cancel' });
                cancelBooking(held.id).then(
                  () => {
                    var mine = Object.assign({}, S.myBookings);
                    delete mine[pe.id];
                    c.set({ busy: null, myBookings: mine });
                    cancelled();
                  },
                  (err) => {
                    c.set({ busy: null });
                    c.toast(sayError(err));
                  }
                );
              } else if (!S.busy) cancelled();
            } else {
              c.signOut();
            }
          }}
        >
          {isCancel ? (S.busy === 'cancel' ? 'Cancelling…' : 'Cancel booking') : 'Log out'}
        </Button>
      </div>
    </Sheet>
  );
  function cancelled() {
    c.set((o) => ({
      planned: null,
      onList: false,
      sent: false,
      payId: null,
      stack: ['plans'],
      sheet: null,
      dir: 'tab',
      gp:
        o.gp && o.gp.booked === o.planned ? Object.assign({}, o.gp, { stage: 'voting', booked: null }) : o.gp
    }));
    c.toast('Booking cancelled');
  }
}

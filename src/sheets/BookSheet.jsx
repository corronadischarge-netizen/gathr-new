import { useRef, useState } from 'react';
import { AuthForm } from '../components/AuthForm';
import { Switch } from '../components/Switch';
import { rupees } from '../data/format';
import { Button, Sheet } from '../design-system';
import { haptic } from '../lib/haptics';
import { useMachine } from '../lib/machine';
import { Pay } from '../services/payments';
import { meta, svgIcon } from '../ui/helpers';

/* Booking runs as one line of steps: idle → sending code → code entry (both in AuthForm, first time only)
   → paying → success or error. Paying can only start from ready or after an error, so a second tap
   can never charge twice; an error keeps everything you chose and offers "Try again". */
const PAY_FLOW = {
  ready: { PAY: 'paying' },
  paying: { PAID: 'success', FAIL: 'error' },
  error: { PAY: 'paying' },
  success: {}
};

/* One-sheet booking: guests, rules, price, pay (and phone, first time only) */
export function BookSheet(p) {
  var c = p.ctx,
    S = c.S,
    e = c.ev,
    v = c.ven,
    close = () => {
      if (!S.busy) c.set({ sheet: null });
    };
  var gpb = S.gp && S.gpBook === e.id,
    crew = gpb ? ['Riya'].concat(S.gp.members) : null;
  var n = gpb ? crew.length : S.guests,
    each = e.door ? 0 : e.price || 0,
    gross = each * n;
  const [useCredit, setUseCredit] = useState(false);
  var pay = useMachine(PAY_FLOW, 'ready', { err: null });
  // the pass count rolls up or down to its new number, and the total rolls with it
  var lastN = useRef(n),
    rollDir = useRef('');
  if (n !== lastN.current) {
    rollDir.current = n > lastN.current ? 'roll-up' : 'roll-down';
    lastN.current = n;
  }
  var roll = rollDir.current;
  var credit = each && S.credit > 0 && useCredit ? Math.min(S.credit, gross) : 0,
    total = gross - credit;
  var payLabel = e.rsvp
    ? 'RSVP for ' + n
    : each
      ? total
        ? 'Pay ' + rupees(total)
        : 'Book with credit'
      : 'Get on the list for ' + n;
  function done(payId) {
    var earned = n >= 3 && each ? 50 : 0;
    c.set((o) => ({
      busy: null,
      celebrate: Date.now(), // the pass screen plays the booking tick only right after booking
      onList: true,
      planned: e.id,
      guests: n,
      sent: gpb,
      sheet: null,
      payId: payId || null,
      credit: o.credit - credit + earned,
      gp: gpb ? Object.assign({}, o.gp, { stage: 'booked', booked: e.id, fresh: false }) : o.gp,
      gpBook: null
    }));
    haptic.success();
    c.go('pass');
    if (earned)
      setTimeout(() => {
        c.toast('+' + rupees(earned) + ' planner credit for booking your group');
      }, 900);
  }
  function book() {
    if (!pay.send('PAY', { err: null })) return;
    if (!total) {
      pay.send('PAID');
      done(null);
      return;
    }
    c.set({ busy: 'pay' });
    Pay.charge({
      amount: total,
      title: e.title + ' · ' + n + (n === 1 ? ' pass' : ' passes'),
      email: S.email,
      phone: S.phone
    }).then(
      (r) => {
        pay.send('PAID');
        done(r.id);
      },
      (err) => {
        pay.send('FAIL', { err: err.message || 'The payment didn’t go through. You haven’t been charged.' });
        c.set({ busy: null });
        haptic.error();
      }
    );
  }
  return (
    <Sheet title={e.title} subtitle={v.name + ' · ' + e.date + ' · ' + e.time} onClose={close}>
      <div className="rowc between" style={{ gap: '12px' }}>
        <div className="col" style={{ gap: '2px' }}>
          <span className="title16">Passes</span>
          {meta(
            gpb
              ? 'One each for your group'
              : n === 1
                ? 'Just you'
                : 'You + ' + (n - 1) + ' · send theirs after'
          )}
        </div>
        {gpb ? (
          <span className="step-n">{n}</span>
        ) : (
          <div className="rowc" style={{ gap: '16px' }}>
            <button
              type="button"
              className="g-ibtn g-ibtn-solid step"
              aria-label="One fewer pass"
              disabled={n <= 1 || !!S.busy}
              onClick={() => c.set({ guests: Math.max(1, n - 1) })}
            >
              {svgIcon(['M5 12h14'])}
            </button>
            <span
              key={n}
              className={'step-n ' + roll}
              aria-live="polite"
              aria-label={n + (n === 1 ? ' pass' : ' passes')}
            >
              {n}
            </span>
            <button
              type="button"
              className="g-ibtn g-ibtn-solid step"
              aria-label="One more pass"
              disabled={n >= 6 || !!S.busy}
              onClick={() => c.set({ guests: Math.min(6, n + 1) })}
            >
              {svgIcon(['M5 12h14', 'M12 5v14'])}
            </button>
          </div>
        )}
      </div>
      {each && S.credit > 0 && S.signedIn ? (
        <div className="rowc between" style={{ gap: '12px' }}>
          <div className="col" style={{ gap: '2px' }}>
            <span className="title15">Use planner credit</span>
            {meta(rupees(S.credit) + ' available')}
          </div>
          <Switch on={useCredit} label="Use planner credit" onClick={() => setUseCredit(!useCredit)} />
        </div>
      ) : null}
      <div className="rowc between total-row">
        <span className="title15">
          {e.rsvp
            ? 'Free with RSVP'
            : each
              ? credit
                ? 'Total after ' + rupees(credit) + ' credit'
                : 'Total'
              : 'Pay at the door'}
        </span>
        <span key={total} className={'price-big ' + roll}>
          {e.rsvp
            ? '₹0'
            : each
              ? rupees(total)
              : e.door && e.price
                ? rupees(e.price) + ' each'
                : 'Not listed'}
        </span>
      </div>
      {pay.state === 'error' ? (
        <p className="meta err-txt pay-err" role="alert" style={{ margin: 0 }}>
          {pay.data.err + ' Your passes are still saved here, so you can try again.'}
        </p>
      ) : null}
      {S.signedIn ? (
        <Button
          variant="primary"
          size="lg"
          block
          icon="ticket"
          disabled={pay.state === 'paying' || pay.state === 'success' || !!S.busy}
          onClick={book}
        >
          {pay.state === 'paying' ? 'Paying…' : pay.state === 'error' ? 'Try again · ' + payLabel : payLabel}
        </Button>
      ) : (
        <div className="col" style={{ gap: '8px' }}>
          <span className="title15">Sign in to keep your passes</span>
          <AuthForm
            ctx={c}
            id="bk"
            compact
            payIcon
            emailLabel="Email, for your passes and receipt"
            verifyLabel={'Verify · then ' + payLabel.charAt(0).toLowerCase() + payLabel.slice(1)}
            resume={{ cur: e.id, guests: n }}
            onDone={() => setTimeout(book, 0)}
          />
        </div>
      )}
      <p className="note" style={{ textAlign: 'center' }}>
        {(e.rsvp || !each
          ? 'Your spot is saved on gathr · '
          : (Pay.live ? 'Secure payment by Razorpay · ' : 'Demo payment · no money is taken · ') +
            'no extra fees · ') + 'refunds follow the organiser’s policy'}
      </p>
    </Sheet>
  );
}

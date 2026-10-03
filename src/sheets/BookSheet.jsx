import { useState } from 'react';
import { AuthForm } from '../components/AuthForm';
import { Switch } from '../components/Switch';
import { rupees } from '../data/format';
import { Button, Sheet } from '../design-system';
import { Pay } from '../services/payments';
import { meta, svgIcon } from '../ui/helpers';

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
    c.go('pass');
    if (earned)
      setTimeout(() => {
        c.toast('+' + rupees(earned) + ' planner credit for booking your group');
      }, 900);
  }
  function book() {
    if (S.busy) return;
    if (!total) {
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
        done(r.id);
      },
      (err) => {
        c.set({ busy: null });
        c.toast(err.message);
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
              className="step-n tick"
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
        <span className="price-big">
          {e.rsvp
            ? '₹0'
            : each
              ? rupees(total)
              : e.door && e.price
                ? rupees(e.price) + ' each'
                : 'Not listed'}
        </span>
      </div>
      {S.signedIn ? (
        <Button variant="primary" size="lg" block icon="ticket" disabled={!!S.busy} onClick={book}>
          {S.busy ? 'Opening payment…' : payLabel}
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

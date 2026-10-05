import { useRef, useState } from 'react';
import { AuthForm } from '../components/AuthForm';
import { Switch } from '../components/Switch';
import { rupees } from '../data/format';
import { Button, Sheet } from '../design-system';
import { haptic } from '../lib/haptics';
import { useMachine } from '../lib/machine';
import { Pay } from '../services/payments';
import { book as bookInDb, remoteOn, sayError } from '../services/remote';
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
  /* A night hosted on gathr is booked in the database, which needs the party: couples, guys and girls.
     That's how the night's stag rule and promoter pay work. Listed nights keep a simple pass count. */
  var dbNight = remoteOn && e.remote && !gpb;
  const [party, setParty] = useState({ couples: 1, stags: 0, girls: 0 });
  var partyErr =
    e.stag === 'groups' && party.stags > 0 && !party.couples && !party.girls
      ? 'This night is couples and mixed groups only. Add a couple or a girl.'
      : null;
  var n = gpb ? crew.length : dbNight ? party.couples * 2 + party.stags + party.girls : S.guests,
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
      : 'Book ' + n + (n === 1 ? ' pass' : ' passes') + ' · pay at the door';
  function done(payId, booking) {
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
      myBookings: booking ? Object.assign({}, o.myBookings, { [e.id]: booking }) : o.myBookings,
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
  /* after paying (or straight away for free and pay-at-door nights): a gathr night is booked in the database */
  function finish(payId) {
    if (!dbNight) {
      pay.send('PAID');
      done(payId);
      return;
    }
    c.set({ busy: 'pay' });
    bookInDb(e.id, party.couples, party.stags, party.girls, payId).then(
      (b) => {
        pay.send('PAID');
        done(payId, b);
      },
      (err) => {
        // with real payments this case needs a refund: the server-side payment check (planned) closes it
        pay.send('FAIL', {
          err:
            sayError(err) +
            (payId && !/^demo_/.test(payId)
              ? ' Your payment reference is ' + payId + '; we’ll refund it.'
              : '')
        });
        c.set({ busy: null });
        haptic.error();
      }
    );
  }
  function book() {
    if (partyErr || n < 1) return;
    if (!pay.send('PAY', { err: null })) return;
    if (!total) {
      finish(null);
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
        finish(r.id);
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
      {dbNight ? (
        <div className="col" style={{ gap: '4px' }}>
          {[
            ['couples', 'Couples', '2 passes each'],
            ['stags', 'Guys', e.stag === 'none' ? 'No stag entry tonight' : 'Coming without a partner'],
            ['girls', 'Girls', '1 pass each']
          ].map((r) => {
            var k = r[0],
              val = party[k],
              closed = k === 'stags' && e.stag === 'none',
              room = n + (k === 'couples' ? 2 : 1) <= 20;
            return (
              <div key={k} className="rowc between party-row" style={{ gap: '12px' }}>
                <div className="col" style={{ gap: '2px' }}>
                  <span className="title15">{r[1]}</span>
                  {meta(r[2])}
                </div>
                <div className="rowc" style={{ gap: '16px' }}>
                  <button
                    type="button"
                    className="g-ibtn g-ibtn-solid step"
                    aria-label={'One fewer: ' + r[1]}
                    disabled={val <= 0 || !!S.busy}
                    onClick={() => setParty(Object.assign({}, party, { [k]: val - 1 }))}
                  >
                    {svgIcon(['M5 12h14'])}
                  </button>
                  <span
                    key={val}
                    className={'step-n ' + roll}
                    aria-live="polite"
                    aria-label={val + ' ' + r[1]}
                  >
                    {val}
                  </span>
                  <button
                    type="button"
                    className="g-ibtn g-ibtn-solid step"
                    aria-label={'One more: ' + r[1]}
                    disabled={closed || !room || !!S.busy}
                    onClick={() => setParty(Object.assign({}, party, { [k]: val + 1 }))}
                  >
                    {svgIcon(['M5 12h14', 'M12 5v14'])}
                  </button>
                </div>
              </div>
            );
          })}
          {meta(n + (n === 1 ? ' pass' : ' passes') + (n > 1 ? ' · send the others theirs after' : ''))}
          {partyErr ? (
            <p className="meta err-txt" role="alert" style={{ margin: 0 }}>
              {partyErr}
            </p>
          ) : null}
        </div>
      ) : (
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
      )}
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
          disabled={pay.state === 'paying' || pay.state === 'success' || !!S.busy || !!partyErr || n < 1}
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

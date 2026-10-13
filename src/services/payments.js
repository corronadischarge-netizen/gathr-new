import { CFG } from '../config';
import { log } from '../lib/log';
import { loadScript, store, token } from '../lib/utils';

/* Payments: test mode by default (no money moves), Razorpay Checkout when a key is added.

   Every payment carries a request id (rid). The payment service answers each id once: asking again with the same
   id while it's open joins the same payment, and asking after it's done returns the same answer. So a double tap,
   a retry after a slow network or a restart while paying can't charge twice (interactions spec 2.4, 7).

   Test mode answers like a bank would. Pick how it answers with ?pay= in the address:
     ok        paid after about a second (the default)
     fail      declined
     failonce  the first payment is declined, the next one goes through
     slow      no answer for 26 s (so the app says "Checking with your bank"), then paid
     slowfail  no answer for 26 s, then declined */
const TEST = (/[?&]pay=(\w+)/.exec(location.search) || [])[1] || 'ok';
const QUICK = 1200,
  SLOW = 26000;

/* the payments this phone has asked for, by request id: { outcome, id, at, doneAt }. Kept on the phone, so a
   restart mid-payment asks about the same payment instead of starting a new one */
function ledger() {
  return store('gathr.payLedger') || {};
}
function record(rid, x) {
  var l = ledger();
  l[rid] = Object.assign({}, l[rid], x);
  // keep the last 30
  var keys = Object.keys(l);
  if (keys.length > 30)
    keys
      .sort((a, b) => (l[a].at || 0) - (l[b].at || 0))
      .slice(0, keys.length - 30)
      .forEach((k) => delete l[k]);
  store('gathr.payLedger', l);
  return l[rid];
}

var open = {}; // request id → the promise of a payment still in progress (this session)

function declined() {
  return new Error('Your bank declined it. You haven’t been charged');
}

/* wait for a test payment's answer: resolves { id } when paid, rejects when declined */
function answer(rid) {
  return new Promise((ok, no) => {
    function check() {
      var x = ledger()[rid];
      if (!x) return no(declined());
      var left = x.doneAt - Date.now();
      if (left > 0) return setTimeout(check, Math.min(left, 1000));
      x.outcome === 'paid' ? ok({ id: x.id }) : no(declined());
    }
    check();
  });
}

export const Pay = {
  live: CFG.payments && CFG.payments.provider === 'razorpay' && !!CFG.payments.razorpayKeyId,
  test: TEST,
  /* o: { rid, amount (rupees), title, email, phone } → resolves { id } or rejects with a plain-words error */
  charge: (o) => {
    var rid = o.rid,
      seen = ledger()[rid];
    if (open[rid]) return open[rid]; // already in progress: the same payment, not a second one
    if (seen && seen.outcome) {
      // already answered (or the bank is still deciding): the same answer, never a new charge
      return (open[rid] = answer(rid).finally(() => delete open[rid]));
    }
    log('pay_start', { rid: rid, amount: o.amount, mode: Pay.live ? 'razorpay' : 'test:' + TEST });
    var p = Pay.live ? razorpay(o) : testCharge(o);
    open[rid] = p.finally(() => delete open[rid]);
    return open[rid];
  },
  /* what the bank said about a request id: 'paid' | 'failed' | 'unknown' (still deciding) | 'none' (never sent) */
  status: (rid) => {
    var x = ledger()[rid];
    if (!x) return Promise.resolve({ status: 'none' });
    if (!x.outcome || (x.doneAt && Date.now() < x.doneAt)) return Promise.resolve({ status: 'unknown' });
    return Promise.resolve({ status: x.outcome, id: x.id });
  }
};

function testCharge(o) {
  var l = ledger(),
    slow = TEST === 'slow' || TEST === 'slowfail',
    paid = TEST === 'ok' || TEST === 'slow' || (TEST === 'failonce' && Object.values(l).some((x) => x.outcome === 'failed'));
  var now = Date.now();
  // the bank's answer is decided now and arrives later, like a real one
  record(o.rid, {
    at: now,
    doneAt: now + (slow ? SLOW : QUICK),
    outcome: paid ? 'paid' : 'failed',
    id: paid ? 'test_' + now.toString(36) : null,
    amount: o.amount
  });
  return answer(o.rid);
}

function razorpay(o) {
  record(o.rid, { at: Date.now(), amount: o.amount });
  return loadScript('https://checkout.razorpay.com/v1/checkout.js')
    .catch(() => {
      record(o.rid, { outcome: 'failed', doneAt: Date.now() });
      throw new Error('Couldn’t open the payment window. Check your internet connection. You haven’t been charged');
    })
    .then(
      () =>
        new Promise((ok, no) => {
          var fail = (msg) => {
            record(o.rid, { outcome: 'failed', doneAt: Date.now() });
            no(new Error(msg));
          };
          var rz = new window.Razorpay({
            key: CFG.payments.razorpayKeyId,
            amount: Math.round(o.amount * 100),
            currency: 'INR',
            name: 'gathr',
            description: o.title,
            // the request id travels with the payment, so the server check (planned) can refuse a repeat
            notes: { request_id: o.rid },
            prefill: { email: o.email || '', contact: o.phone ? '+91' + o.phone : '' },
            theme: { color: token('brand') },
            handler: (r) => {
              record(o.rid, { outcome: 'paid', id: r.razorpay_payment_id, doneAt: Date.now() });
              ok({ id: r.razorpay_payment_id });
            },
            modal: {
              ondismiss: () => fail('Payment cancelled. You haven’t been charged')
            }
          });
          rz.on('payment.failed', (r) => fail((r.error && r.error.description) || 'Payment failed. You haven’t been charged'));
          rz.open();
        })
    );
}

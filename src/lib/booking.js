/* The booking state machine (interactions spec 7). Pure: no app imports, so every row of the table is tested.

   idle → selecting → (codeSent → codeEntry →) selecting → paying → success | failed | pending
   plus blocked (the door says no for this group) and the free path (list nights: selecting → success, no paying).

   Each state lists the events it accepts; anything else is ignored. That is what makes a double charge
   impossible on the phone: PAY is only accepted from selecting or failed, so a second tap while paying
   (or pending) does nothing. The payment itself also carries a request id (rid) that the payment service
   answers only once (services/payments.js). */
export const BOOKING = {
  idle: { OPEN: 'selecting', OPEN_BLOCKED: 'blocked' },
  // the door says no: Pay is disabled with the reason and a "Try {night}" link; changing the group can unblock it
  blocked: { REGROUP: 'selecting', CLOSE: 'idle' },
  selecting: {
    PASSES: 'selecting',
    BLOCK: 'blocked',
    PAY_SIGNED_OUT: 'codeSent',
    PAY: 'paying',
    FREE: 'success',
    CLOSE: 'idle'
  },
  // sign in first: the sheet's content slides to the email field; "Send code" → "Sending code"
  codeSent: { CODE_SENT: 'codeEntry', BACK: 'selecting', CLOSE: 'idle' },
  codeEntry: { WRONG: 'codeEntry', RESEND: 'codeEntry', RIGHT: 'selecting', CHANGE_EMAIL: 'codeSent', BACK: 'selecting', CLOSE: 'idle' },
  // paying: the sheet can't be swiped away; ✕ asks "Stop paying?" and closing only hides it (the answer still comes)
  paying: { PAID: 'success', FAILED: 'failed', TIMEOUT: 'pending' },
  // no answer in 20 s: "Checking with your bank"; it polls the same request id until it hears yes or no
  pending: { PAID: 'success', FAILED: 'failed' },
  // everything chosen is kept; Try again starts a new attempt
  failed: { PAY: 'paying', PASSES: 'selecting', BLOCK: 'blocked', CLOSE: 'idle' },
  success: { CLOSE: 'idle' }
};

/* how long paying waits before saying "Checking with your bank" */
export const PENDING_AFTER = 20000;
/* how often pending asks again */
export const POLL_EVERY = 3000;
/* wrong codes before "Send a new code" */
export const MAX_TRIES = 3;

/* the next state for an event, or null if this state doesn't accept it */
export function nextState(state, ev) {
  return (BOOKING[state] || {})[ev] || null;
}

/* a booking record (kept in app state and on the phone, so closing the sheet, the background and a restart
   all resume it): { ev, state, rid, n, total, at, err, tries } → the record after an event, or null */
export function bookingStep(bk, ev, data) {
  var cur = bk || { state: 'idle' },
    to = nextState(cur.state, ev);
  if (!to) return null;
  var next = Object.assign({}, cur, data || {}, { state: to });
  if (to === 'paying') {
    next.at = (data && data.at) || Date.now();
    next.err = null;
  }
  if (ev === 'WRONG') next.tries = (cur.tries || 0) + 1;
  if (ev === 'RESEND' || ev === 'RIGHT' || ev === 'BACK' || ev === 'CHANGE_EMAIL') next.tries = 0;
  return next;
}

/* states where money may be moving: the sheet can't be swiped closed and a new payment can't start */
export function inFlight(bk) {
  return !!bk && (bk.state === 'paying' || bk.state === 'pending');
}

/* a fresh request id for one payment attempt: the payment service treats a repeated id as the same payment */
export function requestId() {
  return 'rq_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

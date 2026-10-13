import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BOOKING, MAX_TRIES, PENDING_AFTER, bookingStep, inFlight, nextState, requestId } from './booking.js';

/* every row of interactions spec section 7, in the table's order */
function run(events, start) {
  var bk = start || null;
  events.forEach((x) => {
    var ev = Array.isArray(x) ? x[0] : x,
      next = bookingStep(bk, ev, Array.isArray(x) ? x[1] : null);
    assert.ok(next, ev + ' should be accepted in ' + (bk ? bk.state : 'idle'));
    bk = next;
  });
  return bk;
}

test('idle → tap "Get n passes" → selecting', () => {
  assert.equal(run(['OPEN']).state, 'selecting');
});

test('selecting → change passes → selecting', () => {
  assert.equal(run(['OPEN', 'PASSES', 'PASSES']).state, 'selecting');
});

test('selecting → Pay, not signed in → codeSent → code arrives → codeEntry', () => {
  assert.equal(run(['OPEN', 'PAY_SIGNED_OUT']).state, 'codeSent');
  assert.equal(run(['OPEN', 'PAY_SIGNED_OUT', 'CODE_SENT']).state, 'codeEntry');
});

test('codeEntry → wrong code → codeEntry, counting tries; a new code resets them', () => {
  var bk = run(['OPEN', 'PAY_SIGNED_OUT', 'CODE_SENT', 'WRONG', 'WRONG', 'WRONG']);
  assert.equal(bk.state, 'codeEntry');
  assert.equal(bk.tries, MAX_TRIES);
  assert.equal(run(['RESEND'], bk).tries, 0);
});

test('codeEntry → right code → selecting, with everything kept', () => {
  var bk = run(['OPEN', ['PASSES', { n: 4 }], 'PAY_SIGNED_OUT', 'CODE_SENT', 'RIGHT']);
  assert.equal(bk.state, 'selecting');
  assert.equal(bk.n, 4);
});

test('selecting → Pay (signed in) → paying, timed from the tap', () => {
  var bk = run(['OPEN', ['PAY', { rid: 'r1', at: 1000 }]]);
  assert.equal(bk.state, 'paying');
  assert.equal(bk.at, 1000);
  assert.ok(inFlight(bk));
});

test('paying → success', () => {
  assert.equal(run(['OPEN', ['PAY', { rid: 'r1' }], 'PAID']).state, 'success');
});

test('paying → declined → failed, choices kept; Try again → paying', () => {
  var bk = run(['OPEN', ['PAY', { rid: 'r1', n: 3, total: 1500 }], ['FAILED', { err: 'Declined' }]]);
  assert.equal(bk.state, 'failed');
  assert.equal(bk.n, 3);
  assert.equal(bk.total, 1500);
  var again = run([['PAY', { rid: 'r2' }]], bk);
  assert.equal(again.state, 'paying');
  assert.equal(again.err, null);
});

test('paying → no answer in 20 s → pending → resolves to success or failed', () => {
  assert.equal(PENDING_AFTER, 20000);
  var p = run(['OPEN', ['PAY', { rid: 'r1' }], 'TIMEOUT']);
  assert.equal(p.state, 'pending');
  assert.ok(inFlight(p));
  assert.equal(run(['PAID'], p).state, 'success');
  assert.equal(run(['FAILED'], p).state, 'failed');
});

test('never charges twice: Pay is ignored while paying or pending, and after success', () => {
  var paying = run(['OPEN', ['PAY', { rid: 'r1' }]]);
  assert.equal(bookingStep(paying, 'PAY', { rid: 'r2' }), null);
  var pending = run(['TIMEOUT'], paying);
  assert.equal(bookingStep(pending, 'PAY', { rid: 'r3' }), null);
  assert.equal(bookingStep(run(['PAID'], pending), 'PAY'), null);
  // and the money states can't be closed out of or edited
  ['CLOSE', 'PASSES', 'BACK', 'OPEN'].forEach((ev) => {
    assert.equal(nextState('paying', ev), null, ev + ' while paying');
    assert.equal(nextState('pending', ev), null, ev + ' while pending');
  });
});

test('any → app goes to background → same state (the record is plain data, kept on the phone)', () => {
  var bk = run(['OPEN', ['PAY', { rid: 'r1', at: 5 }], 'TIMEOUT']);
  var back = JSON.parse(JSON.stringify(bk));
  assert.deepEqual(back, bk);
  assert.equal(run(['PAID'], back).state, 'success');
});

test('success → close → idle (Share passes happens on the pass, outside the machine)', () => {
  assert.equal(run(['OPEN', ['PAY', { rid: 'r1' }], 'PAID', 'CLOSE']).state, 'idle');
});

test('verdict = no → blocked: Pay is not accepted; a new group unblocks it', () => {
  var bk = run(['OPEN_BLOCKED']);
  assert.equal(bk.state, 'blocked');
  assert.equal(bookingStep(bk, 'PAY'), null);
  assert.equal(bookingStep(bk, 'PAY_SIGNED_OUT'), null);
  assert.equal(run(['REGROUP'], bk).state, 'selecting');
  assert.equal(run(['OPEN', 'BLOCK']).state, 'blocked');
  // after a failed payment too: a no means no Try again
  assert.equal(run(['OPEN', ['PAY', { rid: 'r1' }], 'FAILED', 'BLOCK']).state, 'blocked');
});

test('free list nights: the same machine without paying', () => {
  assert.equal(run(['OPEN', 'FREE']).state, 'success');
  assert.equal(nextState('paying', 'FREE'), null);
});

test('every state named in the table exists, and every target is a state', () => {
  ['idle', 'selecting', 'codeSent', 'codeEntry', 'paying', 'success', 'failed', 'pending', 'blocked'].forEach((s) =>
    assert.ok(BOOKING[s], s)
  );
  Object.values(BOOKING).forEach((evs) => Object.values(evs).forEach((to) => assert.ok(BOOKING[to], to)));
});

test('request ids are unique per attempt', () => {
  var a = requestId(),
    b = requestId();
  assert.notEqual(a, b);
  assert.match(a, /^rq_/);
});

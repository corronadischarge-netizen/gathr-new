import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ME, PLAN, UNDO_FOR, closesText, defaultDeadline, leaders, planStep, tally } from './plan.js';

/* every row of interactions spec section 8 */
const T = Date.parse('2026-10-16T13:00:00+05:30'); // Fri 1 pm, India time
const H = 3600000;
function plan(x) {
  return Object.assign(
    { name: 'Friday plan', opts: ['a', 'b', 'c'], votes: { a: [], b: [], c: [] }, members: ['Zoya', 'Aman', 'Kavya'], stage: 'draft' },
    x
  );
}

test('draft → share link → voting, deadline 8 pm by default', () => {
  var gp = planStep(plan(), 'SHARE', { nights: [Date.parse('2026-10-16T23:00:00+05:30')] }, T);
  assert.equal(gp.stage, 'voting');
  assert.equal(gp.deadlineAt, Date.parse('2026-10-16T20:00:00+05:30'));
});

test('the default deadline is 2 h before the earliest night when that is sooner, never under 30 min away', () => {
  assert.equal(defaultDeadline([Date.parse('2026-10-16T21:00:00+05:30')], T), Date.parse('2026-10-16T19:00:00+05:30'));
  assert.equal(defaultDeadline([T + H], T), T + 30 * 60000);
  // after 8 pm: tomorrow's 8 pm
  var late = Date.parse('2026-10-16T21:00:00+05:30');
  assert.equal(defaultDeadline([], late), Date.parse('2026-10-17T20:00:00+05:30'));
});

test('voting → vote / change vote → voting; others\' votes arrive (REMOTE); your vote counts once', () => {
  var gp = planStep(plan(), 'SHARE', { nights: [] }, T);
  assert.equal(planStep(gp, 'VOTE', { id: 'b' }, T).stage, 'voting');
  assert.equal(planStep(gp, 'VOTE', { id: 'zzz' }, T), null);
  gp = planStep(gp, 'REMOTE', { votes: { a: ['Zoya'], b: ['Aman', ME] } }, T);
  var t = tally(gp, 'b');
  assert.deepEqual(t.b, ['Aman', ME]);
  assert.deepEqual(leaders(gp, 'b'), ['b']);
  assert.deepEqual(leaders(gp, 'a'), ['a']);
});

test('voting → deadline or planner closes → closed, winner = most votes', () => {
  var gp = planStep(planStep(plan(), 'SHARE', {}, T), 'REMOTE', { votes: { a: ['Zoya', 'Aman'], b: ['Kavya'] } }, T);
  var c = planStep(gp, 'CLOSE', { me: 'a' }, T);
  assert.equal(c.stage, 'closed');
  assert.equal(c.winner, 'a');
  assert.equal(c.tied, null);
});

test('a tie → the planner picks from the tied nights only', () => {
  var gp = planStep(planStep(plan(), 'SHARE', {}, T), 'REMOTE', { votes: { a: ['Zoya'], b: ['Aman'] } }, T);
  var c = planStep(gp, 'CLOSE', {}, T);
  assert.deepEqual(c.tied, ['a', 'b']);
  assert.equal(c.winner, null);
  assert.equal(planStep(c, 'BOOK', {}, T), null, "can't book before picking");
  assert.equal(planStep(c, 'PICK', { id: 'c' }, T), null, 'c is not tied');
  var p = planStep(c, 'PICK', { id: 'b' }, T);
  assert.equal(p.winner, 'b');
  assert.equal(p.stage, 'closed');
});

test('closed → planner taps Book → booking → success → booked; closing the sheet goes back to closed', () => {
  var c = planStep(planStep(planStep(plan(), 'SHARE', {}, T), 'REMOTE', { votes: { a: ['Zoya'] } }, T), 'CLOSE', {}, T);
  var b = planStep(c, 'BOOK', {}, T);
  assert.equal(b.stage, 'booking');
  assert.equal(planStep(b, 'BACK', {}, T).stage, 'closed');
  var done = planStep(b, 'SUCCESS', {}, T);
  assert.equal(done.stage, 'booked');
  assert.equal(done.booked, 'a');
});

test('voting → planner cancels → cancelled, undoable for 5 s only', () => {
  var gp = planStep(plan(), 'SHARE', {}, T);
  var x = planStep(gp, 'CANCEL', {}, T);
  assert.equal(x.stage, 'cancelled');
  assert.equal(planStep(x, 'UNDO', {}, T + UNDO_FOR).stage, 'voting');
  assert.equal(planStep(x, 'UNDO', {}, T + UNDO_FOR + 1), null);
  assert.equal(planStep(x, 'VOTE', { id: 'a' }, T), null, 'no voting on a cancelled plan');
  // after the vote closed (before booking) the planner can still cancel, and undo back to closed
  var closed = planStep(gp, 'CLOSE', {}, T);
  assert.equal(planStep(planStep(closed, 'CANCEL', {}, T), 'UNDO', {}, T).stage, 'closed');
});

test('any → a member leaves → same stage, count updated, their vote gone; undoable for 5 s', () => {
  var gp = planStep(planStep(plan(), 'SHARE', {}, T), 'REMOTE', { votes: { a: ['Zoya', 'Aman'] } }, T);
  var l = planStep(gp, 'LEAVE', { who: 'Aman' }, T);
  assert.equal(l.stage, 'voting');
  assert.equal(l.members.length, 2);
  assert.deepEqual(l.votes.a, ['Zoya']);
  var back = planStep(l, 'UNDO_LEAVE', { who: 'Aman' }, T + 4000);
  assert.equal(back.members.length, 3);
  assert.deepEqual(back.votes.a, ['Zoya', 'Aman']);
  assert.equal(planStep(l, 'UNDO_LEAVE', { who: 'Aman' }, T + UNDO_FOR + 1), null);
  ['closed', 'booking', 'booked'].forEach((s) => assert.equal(PLAN[s].LEAVE, s));
});

test('countdown text: a time, then minutes in the last hour, no seconds', () => {
  var gp = { deadlineAt: Date.parse('2026-10-16T20:00:00+05:30') };
  assert.equal(closesText(gp, T), 'closes 8 pm');
  assert.equal(closesText(gp, gp.deadlineAt - 20 * 60000), 'closes in 20 min');
  assert.equal(closesText(gp, gp.deadlineAt - 59 * 60000 - 30000), 'closes in 60 min');
  assert.equal(closesText(gp, gp.deadlineAt + 1), 'closed');
  assert.equal(closesText(gp, T - 24 * H), 'closes Fri 8 pm');
  assert.equal(closesText({ deadline: 'Thu 6 pm' }, T), 'closes Thu 6 pm');
});

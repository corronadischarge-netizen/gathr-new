/* getDoorVerdict: every branch of home spec 5.3, and the 5.4 copy. Run: npm test */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getDoorVerdict, sourceLine, verdictText } from './door.js';
import { agePhrase, couples, groupFromPlan, groupLabel, stags } from '../data/group.js';

const T = Date.parse('2026-10-13T12:00:00+05:30');
const door = (o) =>
  Object.assign(
    { minAge: 18, stag: 'allowed', stagFee: null, mixedOnly: false, dress: null, dressStrict: false, arriveBy: null, source: 'host' },
    o
  );
const guys = (n, o) => Object.assign({ type: 'guys', size: n, under21: false, source: 'manual' }, o);
const girls = (n, o) => Object.assign({ type: 'girls', size: n, under21: false, source: 'manual' }, o);
const couple = { type: 'couple', size: 2, under21: false, source: 'manual' };
const mixed = (w, m, o) => Object.assign({ type: 'mixed', size: w + m, women: w, men: m, under21: false, source: 'manual' }, o);
const verdict = (d, g, age) => getDoorVerdict(d, g, age || null, T);

test('group maths: stags, couples, label, age phrase', () => {
  assert.equal(stags(guys(4)), 4);
  assert.equal(stags(girls(3)), 0);
  assert.equal(stags(couple), 0);
  assert.equal(stags(mixed(2, 3)), 1);
  assert.equal(stags(mixed(3, 2)), 0);
  assert.equal(couples(mixed(2, 3)), 2);
  assert.equal(groupLabel(guys(4)), '4 guys');
  assert.equal(groupLabel(guys(1)), 'you');
  assert.equal(groupLabel(girls(1)), 'you');
  assert.equal(groupLabel(couple), 'a couple');
  assert.equal(groupLabel(mixed(2, 3)), '2 couples + 1 guys');
  assert.equal(groupLabel(mixed(1, 1)), '1 couple');
  assert.equal(groupLabel({ type: 'mixed', size: 5 }), '5 friends');
  assert.equal(groupLabel(null), 'you');
  assert.equal(agePhrase(guys(4)), 'all 21+');
  assert.equal(agePhrase(guys(4, { under21: true })), 'someone under 21');
  assert.equal(agePhrase(guys(4), '18 to 20'), 'someone under 21');
});

test('a plan fills the group: everyone who joined plus you', () => {
  var g = groupFromPlan({ members: ['Zoya', 'Aman', 'Kavya', 'Kabir'], groupType: 'guys' });
  assert.equal(g.size, 5);
  assert.equal(g.source, 'plan');
  assert.equal(groupLabel(groupFromPlan({ members: ['Zoya', 'Aman'] })), '3 friends');
});

test('guys: stags OK → yes, with what to bring', () => {
  var v = verdict(door({ minAge: 18 }), guys(4));
  assert.equal(v.state, 'yes');
  assert.deepEqual(v.reasons, ['ID needed']);
  assert.equal(verdict(door({ minAge: 21 }), guys(4)).reasons[0], '21+ with ID');
});

test('guys: no stag entry, couples only, mixed groups only → no', () => {
  assert.deepEqual(verdict(door({ stag: 'not_allowed' }), guys(4)).reasons, ['No stag entry']);
  assert.deepEqual(verdict(door({ stag: 'couples_only' }), guys(4)).reasons, ['Couples only tonight']);
  var v = verdict(door({ mixedOnly: true }), guys(4));
  assert.equal(v.state, 'no');
  assert.deepEqual(v.reasons, ['Mixed groups only']);
});

test('guys: stag rule missing → unknown', () => {
  var v = verdict(door({ stag: null }), guys(4));
  assert.equal(v.state, 'unknown');
  assert.deepEqual(v.reasons, ['Stag rules not listed']);
});

test('girls: stag rules don\'t apply', () => {
  assert.equal(verdict(door({ stag: 'not_allowed' }), girls(3)).state, 'yes');
  assert.equal(verdict(door({ stag: 'couples_only' }), girls(3)).state, 'yes');
  assert.equal(verdict(door({ stag: null }), girls(3)).state, 'yes');
  assert.equal(verdict(door({ mixedOnly: true }), girls(3)).state, 'yes');
});

test('couple: gets into couples-only and no-stag nights', () => {
  assert.equal(verdict(door({ stag: 'couples_only' }), couple).state, 'yes');
  assert.equal(verdict(door({ stag: 'not_allowed' }), couple).state, 'yes');
  assert.equal(verdict(door({ mixedOnly: true }), couple).state, 'yes');
});

test('mixed with stags: treated like stags for stag rules', () => {
  assert.equal(verdict(door({ stag: 'couples_only' }), mixed(2, 3)).state, 'no');
  assert.equal(verdict(door({ stag: null }), mixed(2, 3)).state, 'unknown');
  var v = verdict(door({ stag: 'fee', stagFee: 500 }), mixed(2, 3));
  assert.equal(v.state, 'if');
  assert.deepEqual(v.reasons, ['stags ₹500']);
});

test('mixed without stags: fits couples-only and mixed-only nights', () => {
  assert.equal(verdict(door({ stag: 'couples_only' }), mixed(3, 2)).state, 'yes');
  assert.equal(verdict(door({ mixedOnly: true }), mixed(3, 2)).state, 'yes');
  assert.equal(verdict(door({ stag: null }), mixed(3, 2)).state, 'yes');
});

test('under 21: a 21+ night is no; an unknown age limit is unknown', () => {
  var v = verdict(door({ minAge: 21 }), guys(4, { under21: true }));
  assert.equal(v.state, 'no');
  assert.deepEqual(v.reasons, ['21+ only']);
  assert.equal(verdict(door({ minAge: 18 }), guys(4, { under21: true })).state, 'yes');
  assert.deepEqual(verdict(door({ minAge: null }), girls(2, { under21: true })).reasons, ['Age limit not listed']);
  // all 21+: an unknown age limit doesn't matter
  assert.equal(verdict(door({ minAge: null }), girls(2)).state, 'yes');
});

test('under 25 on a 25+ night is no; your own profile age counts', () => {
  assert.deepEqual(verdict(door({ minAge: 25 }), guys(2, { under25: true })).reasons, ['25+ only']);
  assert.equal(verdict(door({ minAge: 25 }), girls(2), '21 to 24').state, 'no');
  assert.equal(verdict(door({ minAge: 21 }), girls(2), '18 to 20').state, 'no');
  assert.equal(verdict(door({ minAge: 25 }), girls(2), '25 or older').state, 'yes');
});

test('age is checked before stag rules', () => {
  assert.deepEqual(verdict(door({ minAge: 21, stag: 'not_allowed' }), guys(4, { under21: true })).reasons, ['21+ only']);
});

test('if: strict dress, arrive by and stag fee, at most two, most important first', () => {
  var v = verdict(door({ dress: 'Formals', dressStrict: true, arriveBy: '22:30', stag: 'fee', stagFee: 1000 }), guys(4));
  assert.equal(v.state, 'if');
  assert.deepEqual(v.reasons, ['formals only', 'before 10:30']);
  assert.deepEqual(v.kinds, ['dress', 'arrive']);
  // a dress line that isn't enforced isn't a condition
  assert.equal(verdict(door({ dress: 'Smart casuals', dressStrict: false }), guys(4)).state, 'yes');
  assert.deepEqual(verdict(door({ arriveBy: '23:00' }), girls(2)).reasons, ['before 11:00']);
});

test('group not set: the rule in plain words, never "Lets you in"', () => {
  var cases = [
    [door({ stag: 'allowed' }), 'Stags OK'],
    [door({ stag: 'couples_only' }), 'Couples only'],
    [door({ mixedOnly: true }), 'Mixed groups only'],
    [door({ stag: 'not_allowed' }), 'No stag entry'],
    [door({ stag: null }), 'Stag rules not listed']
  ];
  cases.forEach(([d, rule]) => {
    var v = verdict(d, null);
    assert.equal(v.state, 'unknown');
    assert.equal(v.plain, true);
    assert.deepEqual(v.reasons, [rule]);
    assert.doesNotMatch(verdictText(v, null, 'pill').text, /Lets/);
  });
  // your own age still applies with no group set
  assert.equal(verdict(door({ minAge: 21 }), null, '18 to 20').state, 'no');
  assert.deepEqual(verdict(door({ minAge: null }), null, '18 to 20').reasons, ['Age limit not listed']);
});

test('a gathr check older than 30 days counts as not known', () => {
  var fresh = door({ stag: 'couples_only', source: 'gathr', checkedAt: '2026-10-10' });
  var stale = door({ stag: 'couples_only', source: 'gathr', checkedAt: '2026-09-01' });
  assert.equal(verdict(fresh, guys(4)).state, 'no');
  var v = verdict(stale, guys(4));
  assert.equal(v.state, 'unknown');
  assert.deepEqual(v.reasons, ['Stag rules not listed']);
  assert.equal(v.source, null);
});

test('guest answers count from 5', () => {
  var few = door({ stag: 'not_allowed', source: 'guests', guestAnswers: 4 });
  var enough = door({ stag: 'not_allowed', source: 'guests', guestAnswers: 5 });
  assert.equal(verdict(few, guys(2)).state, 'unknown');
  assert.equal(verdict(enough, guys(2)).state, 'no');
});

test('copy: pill and line text, icons (5.4)', () => {
  var g = guys(4);
  var yes = verdict(door({ minAge: 18 }), g);
  assert.deepEqual(verdictText(yes, g, 'pill'), { state: 'yes', text: 'Lets 4 guys in · ID needed', icon: 'check' });
  assert.equal(verdictText(yes, g, 'line').text, 'Lets you in · 18+');
  assert.equal(verdictText(verdict(door({ minAge: 21 }), g), g, 'line').text, 'Lets you in');
  var cond = verdict(door({ dress: 'Formals', dressStrict: true, arriveBy: '22:30' }), g);
  assert.equal(verdictText(cond, g, 'pill').text, 'Lets 4 guys in · formals only, before 10:30');
  assert.deepEqual(verdictText(cond, g, 'line'), { state: 'if', text: 'Formals only', icon: 'shirt' });
  assert.equal(verdictText(verdict(door({ arriveBy: '22:00' }), g), g, 'line').icon, 'clock');
  assert.equal(verdictText(verdict(door({ stag: 'fee', stagFee: 500 }), g), g, 'line').icon, 'indian-rupee');
  assert.deepEqual(verdictText(verdict(door({ stag: null }), g), g, 'line'), {
    state: 'unknown',
    text: 'Stag rules not listed',
    icon: 'info'
  });
  assert.deepEqual(verdictText(verdict(door({ stag: 'couples_only' }), g), g, 'pill'), {
    state: 'no',
    text: 'Couples only tonight',
    icon: 'x'
  });
  // no UI line ends with a full stop
  [yes, cond].forEach((v) => assert.doesNotMatch(verdictText(v, g, 'pill').text, /\.$/));
});

test('source line', () => {
  var g = guys(2);
  assert.equal(sourceLine(verdict(door({ source: 'host' }), g), T), 'Set by the host');
  assert.equal(sourceLine(verdict(door({ source: 'gathr', checkedAt: '2026-10-10' }), g), T), 'Checked by gathr · 3 days ago');
  assert.equal(sourceLine(verdict(door({ source: 'gathr', checkedAt: '2026-10-10' }), g), T, true), 'Checked by gathr');
  assert.equal(sourceLine(verdict(door({ source: 'guests', guestAnswers: 12 }), g), T), 'From 12 guests');
  assert.equal(sourceLine(verdict(door({ source: null }), g), T), null);
});

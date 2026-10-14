/* getDoorVerdict: every branch of home spec 5.3, and the 5.4 copy. Run: npm test */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getDoorVerdict, sourceLine, verdictText } from './door.js';
import { ageLine, agePhrase, countsTitle, couples, fitFriends, groupFromPlan, groupLabel, groupTitle, namesLine, stags, toggleFriend, waitingLine } from '../data/group.js';

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
  assert.equal(groupLabel(mixed(2, 3)), '2 couples + 1 guy');
  assert.equal(groupLabel(mixed(1, 4)), '1 couple + 3 guys');
  assert.equal(groupLabel(mixed(1, 1)), '1 couple');
  assert.equal(groupLabel({ type: 'mixed', size: 5 }), '5 friends');
  assert.equal(groupLabel(null), 'you');
  assert.equal(groupLabel({ type: 'solo', size: 1 }), 'you');
  assert.equal(stags({ type: 'solo', size: 1 }), 1);
  assert.equal(agePhrase(guys(4)), 'all 21+');
  assert.equal(agePhrase(guys(4, { under21: true })), 'someone under 21');
  assert.equal(agePhrase(guys(4), '18 to 20'), 'someone under 21');
});

test('a plan fills the group: everyone who joined plus you', () => {
  var g = groupFromPlan({ members: ['Dev', 'Arjun', 'Meera', 'Kabir'], groupType: 'guys' });
  assert.equal(g.size, 5);
  assert.equal(g.source, 'plan');
  assert.equal(groupLabel(groupFromPlan({ members: ['Dev', 'Arjun'] })), '3 friends');
});

test('guys: stags OK → yes, with what to bring', () => {
  var v = verdict(door({ minAge: 18 }), guys(4));
  assert.equal(v.state, 'yes');
  assert.deepEqual(v.reasons, ['ID needed']);
  assert.equal(verdict(door({ minAge: 21 }), guys(4)).reasons[0], '21+ with ID');
});

test('guys: no stag entry, couples only, mixed groups only → no', () => {
  assert.deepEqual(verdict(door({ stag: 'not_allowed' }), guys(4)).reasons, ['No stags']);
  assert.deepEqual(verdict(door({ stag: 'couples_only' }), guys(4)).reasons, ['Couples only']);
  var v = verdict(door({ mixedOnly: true }), guys(4));
  assert.equal(v.state, 'no');
  assert.deepEqual(v.reasons, ['Mixed groups only']);
});

test('guys: stag rule missing → unknown', () => {
  var v = verdict(door({ stag: null }), guys(4));
  assert.equal(v.state, 'unknown');
  assert.deepEqual(v.reasons, ['Stag rules unknown']);
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
  assert.deepEqual(v.reasons, ['Stags ₹500']);
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
  assert.deepEqual(verdict(door({ minAge: null }), girls(2, { under21: true })).reasons, ['Age limit unknown']);
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
  assert.deepEqual(v.reasons, ['Formals only', 'Before 10:30']);
  assert.deepEqual(v.kinds, ['dress', 'arrive']);
  // a dress line that isn't enforced isn't a condition
  assert.equal(verdict(door({ dress: 'Smart casuals', dressStrict: false }), guys(4)).state, 'yes');
  assert.deepEqual(verdict(door({ arriveBy: '23:00' }), girls(2)).reasons, ['Before 11:00']);
});

test('group not set: the rule in plain words, never "Lets you in"', () => {
  var cases = [
    [door({ stag: 'allowed' }), 'Stags OK'],
    [door({ stag: 'couples_only' }), 'Couples only'],
    [door({ mixedOnly: true }), 'Mixed groups only'],
    [door({ stag: 'not_allowed' }), 'No stags'],
    [door({ stag: null }), 'Stag rules unknown']
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
  assert.deepEqual(verdict(door({ minAge: null }), null, '18 to 20').reasons, ['Age limit unknown']);
});

test('a gathr check older than 30 days counts as not known', () => {
  var fresh = door({ stag: 'couples_only', source: 'gathr', checkedAt: '2026-10-10' });
  var stale = door({ stag: 'couples_only', source: 'gathr', checkedAt: '2026-09-01' });
  assert.equal(verdict(fresh, guys(4)).state, 'no');
  var v = verdict(stale, guys(4));
  assert.equal(v.state, 'unknown');
  assert.deepEqual(v.reasons, ['Stag rules unknown']);
  assert.equal(v.source, null);
});

test('guest answers count from 5', () => {
  var few = door({ stag: 'not_allowed', source: 'guests', guestAnswers: 4 });
  var enough = door({ stag: 'not_allowed', source: 'guests', guestAnswers: 5 });
  assert.equal(verdict(few, guys(2)).state, 'unknown');
  assert.equal(verdict(enough, guys(2)).state, 'no');
});

test('copy (r25): short, the same on pill and line, the group never repeated', () => {
  var g = guys(4);
  var yes = verdict(door({ minAge: 18 }), g);
  assert.deepEqual(verdictText(yes, g, 'pill'), { state: 'yes', text: 'Lets you in', icon: 'check' });
  assert.equal(verdictText(yes, g, 'line').text, 'Lets you in');
  assert.equal(verdictText(verdict(door({ minAge: 25 }), g), g, 'pill').text, 'Lets you in · 25+');
  assert.equal(verdictText(verdict(door({ minAge: 21 }), g), g, 'pill').text, 'Lets you in · 21+');
  assert.equal(verdictText(verdict(door({ minAge: null }), g), g, 'pill').text, 'Lets you in');
  var cond = verdict(door({ dress: 'Formals', dressStrict: true, arriveBy: '22:30' }), g);
  assert.deepEqual(verdictText(cond, g, 'pill'), { state: 'if', text: 'Formals only', icon: 'shirt' });
  assert.deepEqual(verdictText(cond, g, 'line'), { state: 'if', text: 'Formals only', icon: 'shirt' });
  assert.equal(verdictText(verdict(door({ arriveBy: '22:30' }), g), g, 'pill').text, 'Before 10:30');
  assert.equal(verdictText(verdict(door({ stag: 'fee', stagFee: 500 }), g), g, 'pill').text, 'Stags ₹500');
  assert.equal(verdictText(verdict(door({ arriveBy: '22:00' }), g), g, 'line').icon, 'clock');
  assert.equal(verdictText(verdict(door({ stag: 'fee', stagFee: 500 }), g), g, 'line').icon, 'indian-rupee');
  assert.deepEqual(verdictText(verdict(door({ stag: null }), g), g, 'line'), {
    state: 'unknown',
    text: 'Stag rules unknown',
    icon: 'info'
  });
  assert.deepEqual(verdictText(verdict(door({ stag: 'couples_only' }), g), g, 'pill'), {
    state: 'no',
    text: 'Couples only',
    icon: 'x'
  });
  assert.equal(verdictText(verdict(door({ stag: 'not_allowed' }), g), g, 'pill').text, 'No stags');
  assert.equal(verdictText(verdict(door({ mixedOnly: true }), g), g, 'pill').text, 'Mixed groups only');
  assert.equal(verdictText(verdict(door({ minAge: 21 }), guys(4, { under21: true })), g, 'pill').text, '21+ only');
  assert.equal(verdictText(verdict(door({ minAge: null }), girls(2, { under21: true })), g, 'pill').text, 'Age limit unknown');

  // no UI line ends with a full stop
  [yes, cond].forEach((v) => assert.doesNotMatch(verdictText(v, g, 'pill').text, /\.$/));
});

test('copy (r25): every verdict is 20 characters at most, and never names the group', () => {
  var groups = [guys(4), guys(4, { under21: true }), girls(3), couple, mixed(2, 3), mixed(3, 2), null];
  var doors = [
    door({ minAge: 18 }),
    door({ minAge: 21 }),
    door({ minAge: 25 }),
    door({ minAge: null }),
    door({ stag: 'not_allowed' }),
    door({ stag: 'couples_only' }),
    door({ stag: 'fee', stagFee: 1000 }),
    door({ stag: null }),
    door({ mixedOnly: true }),
    door({ dress: 'Formals', dressStrict: true, arriveBy: '22:30', stag: 'fee', stagFee: 1000 })
  ];
  groups.forEach((g) =>
    doors.forEach((d) => {
      var t = verdictText(verdict(d, g), g, 'pill').text;
      assert.ok(t.length <= 20, t);
      assert.doesNotMatch(t, /guys|girls|couple |friends|Lets [0-9]/, t);
    })
  );
});

test('GroupPill copy (r25): who and what is next, never the make-up', () => {
  assert.equal(namesLine(['Riya Shah']), 'Riya');
  assert.equal(namesLine(['Riya', 'Dev']), 'Riya, Dev');
  assert.equal(namesLine(['Riya', 'Dev', 'Dev', 'Arjun']), 'Riya, Dev + 2');
  assert.equal(countsTitle(guys(4)), 'You + 3 guys');
  assert.equal(countsTitle(girls(2)), 'You + 1 girl');
  assert.equal(countsTitle(couple), 'You and your date');
  assert.equal(countsTitle(mixed(2, 3)), 'You + 4 friends');
  assert.equal(countsTitle(guys(1)), 'Just you');
  assert.equal(countsTitle({ type: 'solo', size: 1 }), 'Just you');
  assert.equal(ageLine(guys(4)), null);
  assert.equal(ageLine(guys(4, { under21: true })), 'Someone under 21');
  assert.equal(ageLine(guys(4), '18 to 20'), 'Someone under 21');
  assert.equal(waitingLine(['Arjun'], '8 pm'), 'Waiting on Arjun · 8 pm');
  assert.equal(waitingLine(['Arjun', 'Dev'], '8 pm'), 'Waiting on 2 · 8 pm');
  // one line each, about 28 characters
  [countsTitle(mixed(4, 5)), waitingLine(['Meera'], 'Thu 6 pm'), "You're in with " + namesLine(['Dev', 'Arjun', 'Meera', 'Kabir'])].forEach(
    (t) => assert.ok(t.length <= 30, t)
  );
});

test('Add friends (r25): names for the pill, the door untouched', () => {
  var dev = { id: 'dev', name: 'Dev' },
    arjun = { id: 'arjun', name: 'Arjun' },
    meera = { id: 'meera', name: 'Meera' };
  var g = toggleFriend(toggleFriend(guys(4), dev), arjun);
  assert.equal(groupTitle(g), 'You, Dev, Arjun + 1');
  assert.equal(groupTitle(guys(4)), 'You + 3 guys');
  assert.equal(groupTitle(toggleFriend(couple, arjun)), 'You and Arjun');
  // picking more friends than the group holds grows guys and girls; a couple or a mixed group has no room
  assert.equal(toggleFriend(toggleFriend(toggleFriend(guys(2), dev), arjun), meera).size, 4);
  assert.equal(toggleFriend(toggleFriend(couple, dev), arjun), null);
  assert.equal(toggleFriend(mixed(1, 1, { friends: [dev] }), arjun), null);
  // unpick
  assert.deepEqual(toggleFriend(g, dev).friends, [arjun]);
  // a smaller group drops the last picked; just me drops them all
  assert.deepEqual(fitFriends(Object.assign({}, g, { size: 2 })).friends, [dev]);
  assert.deepEqual(fitFriends(Object.assign({}, g, { type: 'solo', size: 1 })).friends, []);
  // the door reads type, size and age only
  assert.deepEqual(verdict(door({ stag: 'couples_only' }), g), verdict(door({ stag: 'couples_only' }), guys(4)));
  // a plan fills names in by itself
  assert.equal(groupTitle(groupFromPlan({ members: ['Dev', 'Arjun', 'Meera', 'Kabir'], groupType: 'guys' })), 'You, Dev, Arjun + 2');
});

test('source line', () => {
  var g = guys(2);
  assert.equal(sourceLine(verdict(door({ source: 'host' }), g), T), 'Set by host');
  assert.equal(sourceLine(verdict(door({ source: 'gathr', checkedAt: '2026-10-10' }), g), T), 'Checked 3d ago');
  assert.equal(sourceLine(verdict(door({ source: 'gathr', checkedAt: '2026-10-13' }), g), T), 'Checked today');
  assert.equal(sourceLine(verdict(door({ source: 'gathr', checkedAt: '2026-10-10' }), g), T, true), 'Checked by gathr');
  assert.equal(sourceLine(verdict(door({ source: 'guests', guestAnswers: 12 }), g), T), 'From 12 guests');
  assert.equal(sourceLine(verdict(door({ source: null }), g), T), null);
});

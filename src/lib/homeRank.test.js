/* Hero ranking (home spec 5.5) and rail contents and order (5.6). Run: npm test */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { heroPick, heroScore, notForYou, railFor, railItems, weekRails } from './homeRank.js';

const DAY = '2026-10-16';
const H = 3600000;
const T0 = Date.parse('2026-10-16T18:00:00+05:30');
let n = 0;
const night = (o) =>
  Object.assign(
    {
      id: 'n' + ++n,
      start: T0,
      day: DAY,
      verdict: { state: 'yes' },
      friends: 0,
      crowd: null,
      soldOut: false,
      over: false,
      soundMatch: false,
      mins: null,
      price: 500,
      promoted: false
    },
    o
  );

test('score: friends (up to 3), yes, crowd, sound, distance', () => {
  assert.equal(heroScore(night({ friends: 2 })), 6 + 2);
  assert.equal(heroScore(night({ friends: 5 })), 9 + 2);
  assert.equal(heroScore(night({ verdict: { state: 'if' } })), 0);
  assert.equal(heroScore(night({ crowd: 'packed' })), 3);
  assert.equal(heroScore(night({ crowd: 'buzzing' })), 3);
  assert.equal(heroScore(night({ crowd: 'warming' })), 2.5);
  assert.equal(heroScore(night({ crowd: 'quiet' })), 2);
  assert.equal(heroScore(night({ soundMatch: true })), 3);
  assert.equal(heroScore(night({ mins: 45 })), 1);
  assert.equal(heroScore(night({ mins: 40 })), 2);
});

test('hero: best score wins; only yes or if; never sold out, over or promoted', () => {
  var a = night({ friends: 1 }),
    b = night({ friends: 3, verdict: { state: 'unknown' } }),
    c = night({ friends: 3, verdict: { state: 'no' } }),
    d = night({ friends: 3, soldOut: true }),
    e = night({ friends: 3, over: true }),
    f = night({ friends: 3, promoted: true }),
    g = night({ day: '2026-10-17', friends: 3 });
  assert.equal(heroPick([a, b, c, d, e, f, g], DAY).id, a.id);
  assert.equal(heroPick([b, c], DAY), null);
});

test('hero ties: soonest start, then lower price', () => {
  var late = night({ start: T0 + 2 * H }),
    early = night({ start: T0 }),
    cheap = night({ start: T0, price: 200 });
  assert.equal(heroPick([late, early], DAY).id, early.id);
  assert.equal(heroPick([late, early, cheap], DAY).id, cheap.id);
  var r = heroPick([early], DAY);
  assert.equal(r.score, 2);
});

test('rail: no "no" verdicts, no hero, yes → if → unknown, friends first, then soonest', () => {
  var hero = night({ friends: 3 }),
    no = night({ verdict: { state: 'no' } }),
    unk = night({ verdict: { state: 'unknown' }, start: T0 - H }),
    cond = night({ verdict: { state: 'if' }, start: T0 - H }),
    yesLate = night({ start: T0 + H }),
    yesFriends = night({ start: T0 + 2 * H, friends: 1 });
  var r = railItems([hero, no, unk, cond, yesLate, yesFriends], DAY, hero.id);
  assert.deepEqual(
    r.tiles.map((x) => x.id),
    [yesFriends.id, yesLate.id, cond.id, unk.id]
  );
  assert.deepEqual(notForYou([hero, no, unk], DAY).map((x) => x.id), [no.id]);
});

test('rail: one promoted night at most, where it falls', () => {
  var p1 = night({ promoted: true, start: T0 + H }),
    p2 = night({ promoted: true, start: T0 + 2 * H }),
    x = night({ start: T0 });
  var r = railItems([p1, p2, x], DAY);
  assert.deepEqual(r.tiles.map((t) => t.id), [x.id, p1.id]);
});

test('rail: at most 10 tiles, then the See all end tile', () => {
  var many = Array.from({ length: 13 }, (_, i) => night({ start: T0 + i * 60000 }));
  var r = railItems(many, DAY);
  assert.equal(r.tiles.length, 10);
  assert.equal(r.more, 13);
  assert.equal(railItems(many.slice(0, 10), DAY).more, 0);
});

test('rails: the window day, the next 6 days, then next week', () => {
  var rails = weekRails('2026-10-16');
  assert.equal(rails.length, 8);
  assert.deepEqual(rails[0].days, ['2026-10-16']);
  assert.deepEqual(rails[1].days, ['2026-10-17']);
  assert.deepEqual(rails[6].days, ['2026-10-22']);
  assert.equal(rails[7].key, 'next');
  assert.deepEqual(rails[7].days[0], '2026-10-23');
  assert.equal(rails[7].days.length, 7);
  var later = night({ day: '2026-10-24' });
  assert.equal(railFor([later], rails[7]).tiles[0].id, later.id);
});

test('group not set: plain house rules can be the hero; an age no or a missing age limit can\'t', () => {
  var plain = night({ verdict: { state: 'unknown', plain: true } }),
    ageNo = night({ verdict: { state: 'no' }, friends: 3 }),
    ageUnknown = night({ verdict: { state: 'unknown', plain: false }, friends: 3 });
  assert.equal(heroPick([plain, ageNo, ageUnknown], DAY).id, plain.id);
});

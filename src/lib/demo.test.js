/* The demo set (specs/demo-data.md): dated from today, every verdict state, the host's six nights, the guest's plans.
   Run: npm test */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildDemo, demoGuest, demoHostStats, demoRecord, DEMO_FRIENDS, DEMO_REQUEST, DEMO_VENUES } from '../data/demo.js';
import { getDoorVerdict } from './door.js';

const day = (iso) => new Date(Date.parse(iso) + 330 * 60000).toISOString().slice(0, 10);
const HOST_STAG = { welcome: 'allowed', groups: 'allowed', none: 'not_allowed', fee: 'fee', couples: 'couples_only' };
const guys4 = { type: 'guys', size: 4, under21: false, source: 'manual' };

test('every date counts from tonight, so next week shows the same states', () => {
  ['2026-10-14', '2026-10-21', '2027-01-01'].forEach((today) => {
    var d = buildDemo(today),
      add = (n) => new Date(Date.parse(today + 'T00:00:00Z') + n * 86400000).toISOString().slice(0, 10);
    assert.equal(day(d.events.kikiafterdark.iso), today);
    assert.equal(day(d.events.houseofacai.iso), add(1));
    assert.equal(day(d.events.gamenightretro.iso), add(9));
    assert.equal(day(d.events.retrorewind.iso), add(-2));
    assert.equal(d.feed.filter((x) => x.night.id === 'bollywoodbash')[0].night.date, today);
    var host = Object.fromEntries(d.hostNights.map((o) => [o.id, o]));
    assert.equal(host['ah-mills'].date, today);
    assert.equal(host['ah-launch'].date, add(-6));
    assert.equal(host['ah-aftermidnight'].date, add(15));
  });
});

test('tonight has three nights; times read like the app ("9:30 pm"), the late licence ends at 3 am', () => {
  var d = buildDemo('2026-10-14');
  var tonight = Object.values(d.events)
    .filter((e) => day(e.iso) === '2026-10-14')
    .map((e) => e.id)
    .concat(d.feed.filter((x) => x.night.date === '2026-10-14').map((x) => x.night.id))
    .concat(d.hostNights.filter((o) => o.date === '2026-10-14' && o.status === 'live').map((o) => o.id));
  assert.deepEqual(tonight.sort(), ['ah-mills', 'bollywoodbash', 'kikiafterdark']);
  assert.equal(d.events.kikiafterdark.time, '9:30 pm');
  assert.equal(d.events.empiresaturdays.end, '3 am');
});

test('for 4 guys, all 21+, every verdict state shows up at least twice', () => {
  var d = buildDemo('2026-10-14'),
    t = Date.parse('2026-10-14T15:00:00+05:30'),
    count = { yes: 0, if: 0, unknown: 0, no: 0 },
    upcoming = (iso) => Date.parse(iso) > t - 6 * 3600000;
  Object.values(d.events)
    .filter((e) => upcoming(e.iso))
    .forEach((e) => {
      var v = getDoorVerdict(Object.assign({ minAge: e.age }, d.door[e.id]), guys4, null, t);
      count[v.state]++;
    });
  d.feed
    .map((x) => x.night)
    .concat(d.hostNights.filter((o) => o.status === 'live' && o.date >= '2026-10-14'))
    .forEach((o) => {
      var door = { minAge: +o.age, stag: HOST_STAG[o.stag], stagFee: o.stagFee || null, dress: o.dress || null, dressStrict: !!o.dressStrict, source: 'host' };
      count[getDoorVerdict(door, guys4, null, t).state]++;
    });
  Object.keys(count).forEach((k) => assert.ok(count[k] >= 2, k + ': ' + count[k]));
  // the spec's examples
  var v = (id) => getDoorVerdict(Object.assign({ minAge: d.events[id].age }, d.door[id]), guys4, null, t);
  assert.equal(v('kikiafterdark').state, 'no');
  assert.deepEqual(v('houseofacai').reasons, ['Stags ₹1,000']);
  assert.equal(v('reggaetonthursdays').state, 'unknown');
  assert.deepEqual(v('rooftopafterdark').reasons, ['Before 10:30']);
  assert.equal(v('sunsetsession').state, 'yes');
});

test('the host: 1 live, 2 in review, 1 draft (no poster), 2 past; numbers for the live and past nights', () => {
  var d = buildDemo('2026-10-14'),
    t = Date.parse('2026-10-14T22:30:00+05:30'),
    st = (o) => (o.status === 'live' && o.date < '2026-10-14' ? 'past' : o.status);
  var by = {};
  d.hostNights.forEach((o) => (by[st(o)] = (by[st(o)] || 0) + 1));
  assert.deepEqual(by, { live: 1, review: 2, draft: 1, past: 2 });
  assert.ok(d.hostNights.filter((o) => o.status === 'draft')[0].poster.indexOf('posters/') >= 0); // every night has a poster, the draft too
  d.hostNights.forEach((o) => assert.equal(o.demo, true)); // demo nights never auto-approve
  var mills = demoHostStats('ah-mills', t);
  assert.equal(mills.guests.length, 186);
  assert.equal(mills.cap, 240);
  assert.equal(Object.keys(mills.ci).length, 142);
  var launch = demoHostStats('ah-launch', t);
  assert.deepEqual([launch.views, launch.interested, launch.guests.length, Object.keys(launch.ci).length], [1840, 410, 212, 184]);
  assert.equal(launch.guests.filter((g) => g.booked === 'Walk-in').length, 22);
  assert.equal(Object.keys(demoHostStats('ah-discoinferno', t).ci).length, 131);
  assert.equal(demoHostStats('bollywoodbash', t), null);
});

test('the guest: tonight booked with Dev and Arjun, Friday vote at 2 of 4, a free list night, saves, 4 past nights', () => {
  var g = demoGuest('2026-10-14', Date.parse('2026-10-14T22:30:00+05:30'));
  assert.equal(g.planned, 'bollywoodbash');
  assert.equal(g.myBookings.bollywoodbash.passes, 4);
  assert.deepEqual(g.myBookings.bollywoodbash.with, ['Dev', 'Arjun']);
  assert.equal(g.myBookings.sunsetsession.passes, 2);
  var voted = Object.values(g.gp.votes).reduce((a, v) => a + v.length, 0);
  assert.equal(voted, 2);
  assert.equal(g.gp.members.length + 1, 4);
  assert.equal(g.vote, null);
  assert.equal(g.gp.deadlineAt, Date.parse('2026-10-16T20:00:00+05:30'));
  assert.deepEqual(Object.keys(g.saved).sort(), ['empiresaturdays', 'epitomelive']);
  assert.deepEqual(g.pastNights, ['retrorewind', 'reggaetonsundays', 'ah-launch', 'kikifridays']);
  assert.equal(g.dayAfter.retrorewind, undefined); // Retro Rewind's day-after card is still waiting
  assert.equal(demoRecord('2026-10-14').length, 4);
});

test('13 venues, friends with pictures, and Neha (not Arjun) asking to be friends', () => {
  assert.equal(Object.keys(DEMO_VENUES).length, 13);
  assert.deepEqual(DEMO_FRIENDS.map((f) => f.name), ['Dev', 'Arjun', 'Meera', 'Riya', 'Kabir', 'Tanvi']);
  DEMO_FRIENDS.forEach((f) => assert.match(f.photo, /avatars\/[a-z]+\.jpg$/));
  assert.equal(DEMO_REQUEST.name, 'Neha');
  // the Mills group pin: every venue in it has a position; Bailamos is in Balewadi / Baner
  var mills = Object.values(DEMO_VENUES).filter((v) => v.cluster === 'mills');
  assert.ok(['acai', 'toyroom', 'dimora'].every((k) => DEMO_VENUES[k].cluster === 'mills'));
  mills.forEach((v) => assert.ok(v.lat && v.lng, v.id));
  assert.equal(DEMO_VENUES.bailamos.area, 'Balewadi, Baner');
  Object.values(DEMO_VENUES).forEach((v) => assert.ok(v.lat && v.lng, v.id + ' has a map position'));
});

test('every night has a poster from public/posters/', () => {
  var d = buildDemo('2026-10-14');
  Object.values(d.events).forEach((e) => assert.match(e.img, /posters\/[a-z0-9-]+\.jpg$/, e.id));
  d.feed.forEach((x) => assert.match(x.night.poster, /posters\/[a-z0-9-]+\.jpg$/, x.night.id));
  d.hostNights.forEach((o) => assert.match(o.poster, /posters\/[a-z0-9-]+\.jpg$/, o.id));
});

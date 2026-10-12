/* The clock: India-time days, the 2 am to 6 am rule, and the ?now= demo clock. Run: npm test */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addDays, homeWindow, istDay, nightDay, parseNow, weekdayOf } from './clock.js';

const at = (s) => Date.parse(s + '+05:30');

test('India-time calendar day, whatever the device time zone', () => {
  assert.equal(istDay(at('2026-10-16T23:30:00')), '2026-10-16');
  assert.equal(istDay(at('2026-10-17T00:10:00')), '2026-10-17');
  assert.equal(addDays('2026-10-31', 1), '2026-11-01');
  assert.equal(weekdayOf('2026-10-16'), 5); // Friday
});

test('a night starting after midnight belongs to the evening before', () => {
  assert.equal(nightDay(at('2026-10-16T22:00:00')), '2026-10-16');
  assert.equal(nightDay(at('2026-10-17T00:30:00')), '2026-10-16');
  assert.equal(nightDay(at('2026-10-17T07:00:00')), '2026-10-17');
});

test('home window: before 2 am is still tonight; 2 am to 6 am looks at tomorrow', () => {
  assert.deepEqual(homeWindow(at('2026-10-16T19:00:00')), { day: '2026-10-16', when: 'tonight' });
  assert.deepEqual(homeWindow(at('2026-10-17T01:30:00')), { day: '2026-10-16', when: 'tonight' });
  assert.deepEqual(homeWindow(at('2026-10-17T03:00:00')), { day: '2026-10-17', when: 'tomorrow' });
  assert.deepEqual(homeWindow(at('2026-10-17T06:00:00')), { day: '2026-10-17', when: 'tonight' });
});

test('?now= demo clock reads India time unless a zone is given', () => {
  assert.equal(parseNow('?now=2026-10-16T19:00'), at('2026-10-16T19:00:00'));
  assert.equal(parseNow('?review&now=2026-10-16'), at('2026-10-16T19:00:00'));
  assert.equal(parseNow('?now=2026-10-16T13:30:00Z'), Date.parse('2026-10-16T13:30:00Z'));
  assert.equal(parseNow('?home=classic'), null);
  assert.equal(parseNow('?now=nonsense'), null);
});

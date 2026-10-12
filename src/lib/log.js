/* A small local log of what people do on the home (home spec section 10), read later from the phone:
   localStorage 'gathr.log' holds the last 500 events, oldest first: { at, event, ...details }.
   No analytics service is connected; nothing leaves the phone. */
import { now } from './clock';
import { store } from './utils';

const KEY = 'gathr.log';
const MAX = 500;

export function log(event, details) {
  try {
    var all = store(KEY) || [];
    all.push(Object.assign({ at: new Date(now()).toISOString(), event: event }, details || {}));
    store(KEY, all.slice(-MAX));
  } catch (e) {
    /* logging never gets in the way */
  }
}

export function readLog() {
  return store(KEY) || [];
}

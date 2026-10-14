import { reportCount } from '../services/guestReports';
import { DEMO } from './listings';

/* Door rules for every night, in one shape (home spec 5.2), for getDoorVerdict().
   Listed nights only publish an age limit and sometimes a dress line; the rest below is
   SAMPLE data (sample: true) until gathr calls venues or guests answer, and screens label it "Sample data".
   Nights hosted on gathr use what the host set in the night form. */

/* SAMPLE: what gathr's calls and guests' answers might say, so every verdict state shows up (the demo set, data/demo.js) */
const SAMPLE = DEMO.door;

/* the host form's stag choice → the door's stag rule */
const HOST_STAG = { welcome: 'allowed', groups: 'allowed', none: 'not_allowed', fee: 'fee', couples: 'couples_only' };

function blank() {
  return {
    minAge: null,
    stag: null,
    stagFee: null,
    mixedOnly: null,
    dress: null,
    dressStrict: false,
    arriveBy: null,
    source: null,
    checkedAt: null,
    guestAnswers: 0,
    maxPasses: null,
    sample: false
  };
}

export function doorOf(e) {
  var d = blank();
  if (!e) return d;
  if (e.org) {
    // a night hosted on gathr: the host's own rules
    return Object.assign(d, {
      minAge: e.age || 18,
      stag: HOST_STAG[e.stag] || null,
      stagFee: e.stagFee || null,
      mixedOnly: e.stag === 'groups' || !!e.mixedOnly,
      dress: e.dress || null,
      dressStrict: !!e.dressStrict,
      arriveBy: e.arriveBy || null,
      maxPasses: e.maxPasses || null,
      source: 'host'
    });
  }
  // a listed night: the age limit and dress line it published (all ages = nothing above 18 to check)
  d.minAge = e.age || (e.allAges ? 18 : null);
  d.dress = e.dress || null;
  var s = SAMPLE[e.id];
  if (s) Object.assign(d, s, { dress: s.dress || d.dress, sample: true });
  // your day-after answer counts toward "From {n} guests" (spec 6.12)
  if (d.source === 'guests') d.guestAnswers += reportCount(e.id);
  return d;
}

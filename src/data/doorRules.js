import { reportCount } from '../services/guestReports';

/* Door rules for every night, in one shape (home spec 5.2), for getDoorVerdict().
   Listed nights (District, Sort My Scene) only publish an age limit and sometimes a dress line; the rest below is
   SAMPLE data (sample: true) until gathr calls venues or guests answer, and screens label it "Sample data".
   Nights hosted on gathr use what the host set in the night form. */

/* SAMPLE: what gathr's calls and guests' answers might say, so every verdict state shows up */
const SAMPLE = {
  illegal: { stag: 'fee', stagFee: 500, source: 'guests', guestAnswers: 12 },
  gossip: { stag: 'not_allowed', source: 'gathr', checkedAt: '2026-10-09' },
  dearwed: { stag: 'allowed', source: 'gathr', checkedAt: '2026-10-10' },
  twilight: { stag: 'allowed', arriveBy: '22:30', source: 'guests', guestAnswers: 7 },
  lavish: { stag: 'couples_only', dress: 'Formals', dressStrict: true, source: 'gathr', checkedAt: '2026-10-08' },
  bollywood: { stag: 'allowed', source: 'gathr', checkedAt: '2026-10-11' },
  scandalous: { stag: 'allowed', mixedOnly: true, source: 'gathr', checkedAt: '2026-08-20' },
  twin: { stag: 'allowed', arriveBy: '22:00', source: 'gathr', checkedAt: '2026-10-10' },
  resign: { stag: 'fee', stagFee: 1000, dressStrict: true, source: 'guests', guestAnswers: 3 },
  ladiesnight: { stag: 'not_allowed', source: 'gathr', checkedAt: '2026-10-12' },
  offmenu: { stag: 'allowed', source: 'gathr', checkedAt: '2026-10-07' },
  basstapri: { mixedOnly: true, stag: 'allowed', source: 'guests', guestAnswers: 9 },
  jamming: { stag: 'allowed', source: 'guests', guestAnswers: 6 },
  dandiyaunited: { stag: 'allowed', source: 'gathr', checkedAt: '2026-10-11' },
  royalraas: { stag: 'couples_only', source: 'gathr', checkedAt: '2026-10-11' },
  punedandiya: { stag: 'allowed', source: 'gathr', checkedAt: '2026-10-12' },
  jasmin: { stag: 'fee', stagFee: 1000, arriveBy: '23:00', source: 'gathr', checkedAt: '2026-10-12' }
  // yellow, drexo, chuckberry: nothing known yet beyond the listing
};

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

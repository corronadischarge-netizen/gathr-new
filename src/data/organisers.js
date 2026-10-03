import { MO, WD } from './dates';
import { EVENTS, ORDER, VENUES } from './listings';
import { passCode } from './sample';
import { store } from '../lib/utils';

/* ================= ORGANISERS =================
     Organisers list their own nights. Saved on this device for now; with Supabase on, these become the
     organisers / venues / events tables, and only nights gathr approves reach the feed. */
export const ORG_KEY = 'gathr.org';

export const AREA_XY = {
  'Koregaon Park': [18.5362, 73.893],
  'The Mills': [18.5356, 73.8779],
  'Kalyani Nagar': [18.5475, 73.9025],
  Baner: [18.5635, 73.778],
  'Shivaji Nagar': [18.5306, 73.8478],
  'Viman Nagar': [18.5679, 73.9143],
  'FC Road': [18.5236, 73.8414],
  'Sinhgad Road': [18.48, 73.825]
};

export const KINDS = [
  ['club', 'Club night', 'discoball'],
  ['girls', 'Girls’ night', 'cocktail'],
  ['themed', 'Themed party', 'sunglasses'],
  ['live', 'Live gig', 'speaker']
];

export const SOUNDS = [
  'Bollywood',
  'Commercial',
  'Hip-hop',
  'Techno',
  'House',
  'EDM',
  'Afro',
  'Live band',
  'Indie'
];

export const STAGS = [
  ['welcome', 'Stags welcome'],
  ['groups', 'Couples and mixed groups only'],
  ['none', 'No stag entry']
];

export function orgLoad() {
  var o = store(ORG_KEY);
  return o && o.events ? o : { profile: null, events: [], checkins: {} };
}

function fmtTime(t) {
  if (!t) return '';
  var m = /^(\d{1,2}):(\d{2})$/.exec(t);
  if (!m) return t;
  var hh = +m[1],
    mm = m[2],
    ap = hh >= 12 ? 'pm' : 'am';
  hh = hh % 12 || 12;
  return hh + (mm === '00' ? '' : ':' + mm) + ' ' + ap;
}

export function stagTxt(k) {
  var x = STAGS.filter((s2) => s2[0] === k)[0];
  return x ? x[1] : null;
}

/* an organiser's night, in the same shape as a listed one, so every screen can show it */
export function orgToEvent(o, prof) {
  var d = new Date(o.date + 'T' + (o.start || '21:00') + ':00+05:30'),
    kind = KINDS.filter((k) => k[0] === o.kind)[0] || KINDS[0];
  var tags = (o.sounds || []).map((x) =>
    x
      .toLowerCase()
      .replace(/[^a-z]/g, '')
      .replace('liveband', 'live')
  );
  tags.push({ club: 'commercial', girls: 'ladies', themed: 'themed', live: 'live' }[o.kind]);
  if (o.entry === 'free') tags.push('free');
  return {
    id: o.id,
    src: 'gathr',
    org: true,
    title: o.title,
    venue: o.venueId,
    day: WD[d.getDay()].slice(0, 3).toLowerCase(),
    date: WD[d.getDay()].slice(0, 3) + ' ' + d.getDate() + ' ' + MO[d.getMonth()],
    time: fmtTime(o.start),
    end: o.end ? fmtTime(o.end) : null,
    leave: '',
    genre: (o.sounds || []).join(', ') || kind[1],
    tags: tags,
    kindKey: o.kind,
    price: o.entry === 'paid' ? +o.price || 0 : o.entry === 'door' ? +o.price || null : 0,
    rsvp: o.entry === 'free',
    door: o.entry === 'door',
    age: +o.age || 18,
    dress: o.dress || null,
    stag: o.stag,
    about: o.about || '',
    capacity: +o.capacity || null,
    img: o.poster || '',
    url: '',
    friends: [],
    nFriends: 0,
    iso: d.toISOString(),
    host: prof ? prof.name : ''
  };
}

export function syncOrg(org) {
  Object.keys(EVENTS).forEach((k) => {
    if (EVENTS[k].org) delete EVENTS[k];
  });
  for (var i = ORDER.length - 1; i >= 0; i--) if (!EVENTS[ORDER[i]]) ORDER.splice(i, 1);
  var p = org.profile;
  if (p && p.newVenue && p.venueId && !VENUES[p.venueId]) {
    var xy = AREA_XY[p.newVenue.area] || [18.53, 73.87];
    VENUES[p.venueId] = {
      id: p.venueId,
      name: p.newVenue.name,
      area: p.newVenue.area,
      crowd: 'quiet',
      lat: xy[0] + 0.0012,
      lng: xy[1] + 0.0012,
      ic: 'spotlight',
      hue: 'violet'
    };
  }
  (org.events || []).forEach((o) => {
    if (o.status === 'live' && VENUES[o.venueId]) {
      EVENTS[o.id] = orgToEvent(o, p);
      ORDER.push(o.id);
    }
  });
  ORDER.sort((a, b) => new Date(EVENTS[a].iso) - new Date(EVENTS[b].iso));
}

syncOrg(orgLoad());

export function hashN(str, lo, hi) {
  var n = 7;
  for (var i = 0; i < str.length; i++) n = (n * 31 + str.charCodeAt(i)) >>> 0;
  return lo + (n % (hi - lo + 1));
}

const SAMPLE_GUESTS = [
  'Zoya Shaikh',
  'Aman Joshi',
  'Kavya Rao',
  'Kabir Mehta',
  'Ishaan Patil',
  'Neha Kulkarni',
  'Rohan Desai',
  'Sana Khan',
  'Arjun Nair',
  'Meera Iyer',
  'Dev Bhosale',
  'Tara Singh',
  'Vikram Rao',
  'Ananya Das'
];

/* numbers an organiser sees for one night: sample for listed nights, real device activity for their own */
export function orgStats(S, id) {
  var e = EVENTS[id],
    views = store('gathr.views') || {},
    org = S.org || orgLoad(),
    ci = (org.checkins || {})[id] || {};
  var guests;
  if (e && e.org) {
    guests =
      S.planned === id
        ? [
            {
              name: (S.me && S.me.name) || S.email || 'Guest',
              passes: S.guests || 1,
              booked: 'Booked on gathr',
              code: passCode(S, e)
            }
          ]
        : [];
    guests = guests.concat((org.walkins || {})[id] || []);
    var n = views[id] || 0,
      interested = S.saved[id] ? 1 : 0;
    return {
      sample: false,
      views: n,
      interested: interested + guests.length,
      guests: guests,
      checkedIn: guests.filter((g) => ci[g.name]).length,
      ci: ci,
      cap: e.capacity
    };
  }
  var v = hashN(id, 900, 2400),
    it = Math.round((v * hashN(id + 'i', 14, 22)) / 100),
    gl = Math.min(SAMPLE_GUESTS.length, Math.max(6, Math.round(it * 0.08)));
  guests = SAMPLE_GUESTS.slice(0, gl).map((nm, i) => ({
    name: nm,
    passes: 1 + hashN(nm + id, 0, 3),
    booked: i % 3 ? 'Booked on gathr' : 'Group plan',
    code:
      'G-' +
      hashN(nm + id + 'k', 1e8, 2e9)
        .toString(36)
        .toUpperCase()
        .slice(0, 6)
  }));
  if (S.planned === id)
    guests.unshift({
      name: (S.me && S.me.name) || S.email || 'You',
      passes: S.guests || 1,
      booked: 'Booked on gathr',
      code: passCode(S, e)
    });
  guests = guests.concat((org.walkins || {})[id] || []);
  var sampleCi = {};
  guests.forEach((g, i) => {
    if (hashN(g.name + id + 'c', 0, 9) < 7) sampleCi[g.name] = 1;
  });
  var merged = Object.assign({}, sampleCi, ci);
  return {
    sample: true,
    views: v,
    interested: it,
    guests: guests,
    checkedIn: guests.filter((g) => merged[g.name]).length,
    ci: merged,
    cap: null
  };
}

export function passCount(list) {
  return list.reduce((a, g) => a + g.passes, 0);
}

export function orgSave(c, org) {
  store(ORG_KEY, org);
  syncOrg(org);
  c.set({ org: org });
}

/* 3 · the dashboard: totals and every night with its status */
export const ST_LBL = {
  draft: ['Draft', 'wait'],
  review: ['In review', 'wait'],
  live: ['Live', 'ok'],
  past: ['Past', 'wait']
};

export function setCheckin(c, id, name, on) {
  var cur = orgLoad();
  cur.checkins = cur.checkins || {};
  var m = Object.assign({}, cur.checkins[id] || {});
  m[name] = on ? Date.now() : 0;
  cur.checkins[id] = m;
  store(ORG_KEY, cur);
  c.set({ org: cur });
}

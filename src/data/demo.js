/* The demo set (specs/demo-data.md, 14 Oct 2026): 13 real Pune venues, their nights, a host (Afterhours Collective),
   friends and a guest's history. Every date counts from tonight (day 0), so the demo never goes stale.
   SAMPLE data: crowd, door checks, friends, votes and host numbers show the "Sample data" note.
   The nights are made up; the venues are real places (positions are area-level until each spot is confirmed).
   Every night has a poster from public/posters/ (named after its poster; a venue's series and Afterhours share one);
   friends' pictures are in public/avatars/ (the initials show if one is missing). Pure: no app imports, so it can be tested on its own. */
import { addDays, demoToday } from '../lib/clock.js';

const BASE = (import.meta.env && import.meta.env.BASE_URL) || './';
const poster = (f) => BASE + 'posters/' + f;
const avatar = (f) => BASE + 'avatars/' + f;

/* ---------------------------------------------------------------- venues
   lat/lng: area-level. The Mills: Shubh confirmed Game Palacio, Kiki, The Millers, Epitome and 2BHK are there
   (with Acai, Toyroom and Dimora: one group pin that splits on zoom). Xclusive and Bastian Empire: Koregaon Park
   Annexe. Bailamos: Balewadi / Baner. */
export const DEMO_VENUES = {
  palacio: { name: 'The Game Palacio', area: 'The Mills, Sangamwadi', lat: 18.5356, lng: 73.8796, ic: 'spotlight', hue: 'yellow', vibe: 'Big night out', cluster: 'mills', booked: 430, cap: 480, saved: 1890, lastHour: 41 },
  kiki: { name: 'Kiki', area: 'The Mills, Sangamwadi', lat: 18.5361, lng: 73.8786, ic: 'cocktail', hue: 'pink', vibe: 'Dressy', cluster: 'mills', booked: 120, cap: 300, saved: 940, lastHour: 12 },
  acai: { name: 'Acai', area: 'Raja Bahadur Mills, Sangamwadi', lat: 18.5351, lng: 73.8771, ic: 'vinyl', hue: 'green', vibe: 'Deep and late', cluster: 'mills', booked: 40, cap: 260, saved: 620, lastHour: 4 },
  bailamos: { name: 'Bailamos', area: 'Balewadi, Baner', lat: 18.5702, lng: 73.7786, ic: 'shaker', hue: 'red', vibe: 'Latin, sweaty', booked: 30, cap: 220, saved: 310, lastHour: 3 },
  twobhk: { name: '2BHK Diner & Key Club', area: 'The Mills, Sangamwadi', lat: 18.5366, lng: 73.8773, ic: 'champagne', hue: 'violet', vibe: 'Members-club feel', cluster: 'mills', booked: 36, cap: 200, saved: 540, lastHour: 2 },
  themillers: { name: 'The Millers', area: 'The Mills, Sangamwadi', lat: 18.5341, lng: 73.879, ic: 'mic', hue: 'blue', vibe: 'Warm, live', cluster: 'mills', booked: 28, cap: 180, saved: 410, lastHour: 2 },
  toyroom: { name: 'Toyroom', area: 'Sheraton Grand, Bund Garden Rd, Sangamwadi', lat: 18.5362, lng: 73.876, ic: 'boombox', hue: 'yellow', vibe: 'Loud, packed floor', cluster: 'mills', booked: 210, cap: 300, saved: 1320, lastHour: 22 },
  bastian: { name: 'Bastian Empire', area: 'The Westin, Mundhwa Rd, Koregaon Park Annexe', lat: 18.5398, lng: 73.9062, ic: 'champagne', hue: 'violet', vibe: 'Dressy, late', booked: 400, cap: 400, saved: 2210, lastHour: 0 },
  antisocial: { name: 'Anti Social', area: 'Shivaji Nagar', lat: 18.5306, lng: 73.8478, ic: 'headphones', hue: 'red', vibe: 'Gritty', booked: 30, cap: 250, saved: 290, lastHour: 3 },
  dimora: { name: 'Dimora Dance & Kitchen', area: 'The Mills, Raja Bahadur Mill Rd, Sangamwadi', lat: 18.534, lng: 73.8712, ic: 'disco-ball', hue: 'pink', vibe: 'Glam', cluster: 'mills', booked: 186, cap: 240, saved: 880, lastHour: 26 },
  highspirits: { name: 'High Spirits', area: 'Koregaon Park', lat: 18.5366, lng: 73.8936, ic: 'sunglasses', hue: 'green', vibe: 'Laid back', booked: 20, cap: 150, saved: 760, lastHour: 2 },
  xclusive: { name: 'Xclusive Superclub', area: 'Koregaon Park Annexe', lat: 18.539, lng: 73.907, ic: 'speaker', hue: 'blue', vibe: 'Big room', booked: 150, cap: 400, saved: 690, lastHour: 9 },
  epitome: { name: 'Epitome', area: 'The Mills, Sangamwadi', lat: 18.5346, lng: 73.8779, ic: 'vinyl', hue: 'violet', vibe: 'Warm, chatty', cluster: 'mills', booked: 40, cap: 350, saved: 460, lastHour: 4 }
};
Object.keys(DEMO_VENUES).forEach((k) => (DEMO_VENUES[k].id = k));

/* ---------------------------------------------------------------- friends (section 5.1) */
export const DEMO_FRIENDS = [
  { id: 'dev', name: 'Dev', photo: avatar('dev.jpg'), from: 'From your contacts', together: '6 nights together' },
  { id: 'arjun', name: 'Arjun', photo: avatar('arjun.jpg'), from: 'From your contacts', together: '5 nights together' },
  { id: 'meera', name: 'Meera', photo: avatar('meera.jpg'), from: 'Joined from your plan link', together: '3 nights together' },
  { id: 'riya', name: 'Riya', photo: avatar('riya.jpg'), from: 'From your contacts', together: '2 nights together' },
  { id: 'kabir', name: 'Kabir', photo: avatar('kabir.jpg'), from: 'Added by QR at Bailamos', together: '2 nights together' },
  { id: 'tanvi', name: 'Tanvi', photo: avatar('tanvi.jpg'), from: 'Joined from your plan link', together: '1 night together' }
];
/* the pending request in Updates (Neha, not Arjun: Arjun is already a friend) */
export const DEMO_REQUEST = { id: 'neha', name: 'Neha', photo: avatar('neha.jpg'), from: 'Wants to add you', together: 'New' };

/* ---------------------------------------------------------------- nights
   d: days from tonight · t: start 'HH:MM' · end 'HH:MM' · price in ₹ (0 = free RSVP) · tags: the app's sound keys */
const LISTED = [
  { id: 'kikiafterdark', title: 'Andre Power', img: 'andre-power.jpg', venue: 'kiki', d: 0, t: '21:30', end: '01:30', price: 999, age: 21, genre: 'Commercial, hip-hop', tags: ['commercial', 'hiphop'], door: { stag: 'couples_only', source: 'gathr', ago: 3 }, crowd: [120, 300] },
  { id: 'houseofacai', title: 'Lovefest', img: 'lovefest.jpg', venue: 'acai', d: 1, t: '21:00', end: '01:30', price: 799, age: 21, genre: 'House', tags: ['edm'], door: { stag: 'fee', stagFee: 1000, source: 'guests', guestAnswers: 9 } },
  { id: 'reggaetonthursdays', title: 'Bad Bunny Night', img: 'bad-bunny-night.jpg', venue: 'bailamos', d: 1, t: '20:30', end: '01:30', price: 399, age: 21, genre: 'Latin, reggaeton', tags: ['commercial'], door: { stag: null } },
  { id: 'rooftopafterdark', title: 'Rooftop After Dark', venue: 'toyroom', d: 2, t: '22:00', end: '01:30', price: 999, age: 21, genre: 'Hip-hop', tags: ['hiphop'], img: 'rooftop-after-dark.jpg', door: { stag: 'allowed', arriveBy: '22:30', source: 'gathr', ago: 1 }, crowd: [210, 300] },
  { id: 'empiresaturdays', title: 'Sambuca Saturdays', img: 'sambuca-saturdays.jpg', venue: 'bastian', d: 3, t: '22:00', end: '03:00', price: 1999, age: 25, genre: 'Commercial, house', tags: ['commercial', 'edm'], door: { stag: 'couples_only', source: 'gathr', ago: 2 }, crowd: [400, 400] },
  { id: 'sunsetsession', title: 'Sunset Session', venue: 'highspirits', d: 4, t: '17:00', end: '23:00', price: 0, age: 21, genre: 'Live set, rooftop', tags: ['live'], img: 'sunset-session.jpg', door: { stag: 'allowed', source: 'gathr', ago: 4 } },
  { id: 'epitomelive', title: 'Sunday Morning', img: 'sunday-morning.jpg', venue: 'epitome', d: 4, t: '20:00', end: '23:30', price: 1299, age: 21, genre: 'Live gig', tags: ['live'], door: { stag: 'allowed', source: 'gathr', ago: 2 } },
  { id: 'dimoraladiesnight', title: 'Classico', img: 'classico.jpg', venue: 'dimora', d: 5, t: '21:00', end: '01:30', price: 0, age: 21, genre: 'Commercial, Bollywood', tags: ['ladies', 'commercial', 'bollywood'], door: { stag: 'not_allowed', source: 'gathr', ago: 5 } },
  { id: 'technotuesday', title: 'Funky Night', img: 'funky-night.jpg', venue: 'antisocial', d: 6, t: '21:00', end: '01:30', price: 699, age: 21, genre: 'Funk, disco', tags: ['retro'], door: { stag: null } },
  { id: 'gamenightretro', title: 'Game Night Retro', img: 'social-house.jpg', venue: 'palacio', d: 9, t: '21:00', end: '01:30', price: 349, age: 18, genre: 'Retro, Bollywood', tags: ['retro', 'bollywood'], door: { stag: 'allowed', source: 'guests', guestAnswers: 6 }, crowd: [40, 480] },
  // the guest's past nights (P1, P2, P4; P3 is the host's Launch Night)
  { id: 'retrorewind', title: 'Retro Rewind', img: 'funky-night.jpg', venue: 'themillers', d: -2, t: '21:00', end: '01:30', price: 499, age: 18, genre: 'Retro', tags: ['retro'], door: { stag: 'allowed', source: 'gathr', ago: 6 } },
  { id: 'reggaetonsundays', title: 'Reggaeton Sundays', img: 'bad-bunny-night.jpg', venue: 'bailamos', d: -5, t: '21:00', end: '01:30', price: 399, age: 21, genre: 'Latin, reggaeton', tags: ['commercial'], door: { stag: 'allowed', source: 'guests', guestAnswers: 8 } },
  { id: 'kikifridays', title: 'Kiki Fridays', img: 'andre-power.jpg', venue: 'kiki', d: -12, t: '21:30', end: '01:30', price: 999, age: 21, genre: 'Commercial', tags: ['commercial'], door: { stag: 'couples_only', source: 'gathr', ago: 13 } }
];

/* nights hosted on gathr by other venues' teams (in the same shape as an organiser's night, for orgToEvent) */
const HOSTED = [
  { id: 'bollywoodbash', host: 'The Game Palacio', title: 'Social House', poster: 'social-house.jpg', venueId: 'palacio', d: 0, start: '21:00', end: '01:30', entry: 'paid', price: 499, capacity: 480, age: 18, stag: 'welcome', sounds: ['Bollywood', 'Commercial'], family: 'desi', kind: 'club', crowd: [430, 480] },
  { id: 'unscrupulousfriday', host: '2BHK Diner & Key Club', title: 'Unscrupulous Friday', venueId: 'twobhk', d: 2, start: '21:00', end: '01:30', entry: 'paid', price: 1499, capacity: 200, age: 25, stag: 'welcome', dress: 'Formals', dressStrict: true, sounds: ['Commercial', 'House'], family: 'commercial', kind: 'club', poster: 'unscrupulous-friday.jpg' },
  { id: 'millerssessions', host: 'The Millers', title: 'The Offspring', poster: 'the-offspring.jpg', venueId: 'themillers', d: 3, start: '20:00', end: '23:30', entry: 'paid', price: 599, capacity: 180, age: 18, stag: 'welcome', sounds: ['Live gigs', 'Rock'], family: 'live', kind: 'gig' },
  { id: 'desidrop', host: 'Xclusive Superclub', title: 'Fireboy DML Live', poster: 'fireboy-dml-live.jpg', venueId: 'xclusive', d: 3, start: '21:00', end: '01:30', entry: 'paid', price: 799, capacity: 400, age: 21, stag: 'fee', stagFee: 500, sounds: ['Afrobeats', 'Hip-hop'], family: 'hiphop', kind: 'club', crowd: [150, 400] }
];

/* the demo host: Afterhours Collective (owned by the demo account; host mode) */
const HOST_NIGHTS = [
  { id: 'ah-mills', title: 'Afterhours: Mills Edition', venueId: 'dimora', d: 0, start: '21:00', end: '01:30', entry: 'paid', price: 799, capacity: 240, age: 21, stag: 'fee', stagFee: 500, sounds: ['House', 'Commercial'], family: 'electronic', kind: 'club', status: 'live', poster: 'afterhours-mills-edition.jpg', crowd: [186, 240] },
  { id: 'ah-basstheory', title: 'Bass Theory', poster: 'rooftop-after-dark.jpg', venueId: 'toyroom', d: 8, start: '22:00', end: '01:30', entry: 'paid', price: 999, capacity: 300, age: 21, stag: 'none', sounds: ['Drum & bass'], family: 'electronic', kind: 'club', status: 'review' },
  { id: 'ah-cocktailclub', title: 'Cocktail Club', venueId: 'highspirits', d: 10, start: '17:00', end: '23:00', entry: 'free', price: 0, capacity: 150, age: 21, stag: 'welcome', sounds: ['Commercial'], family: 'commercial', kind: 'rooftop', status: 'review', poster: 'cocktail-club.jpg' },
  { id: 'ah-aftermidnight', title: 'Afterhours: After Midnight', poster: 'afterhours-mills-edition.jpg', venueId: 'bastian', d: 15, start: '22:00', end: '03:00', entry: 'paid', price: 1499, capacity: 400, age: 25, stag: 'welcome', dress: 'Formals', dressStrict: true, sounds: ['House'], family: 'electronic', kind: 'club', status: 'draft' },
  { id: 'ah-launch', title: 'Afterhours: Launch Night', poster: 'afterhours-mills-edition.jpg', venueId: 'acai', d: -6, start: '21:00', end: '01:30', entry: 'paid', price: 699, capacity: 260, age: 21, stag: 'welcome', sounds: ['House'], family: 'electronic', kind: 'club', status: 'live' },
  { id: 'ah-discoinferno', title: 'Death By Disco', poster: 'death-by-disco.jpg', venueId: 'antisocial', d: -13, start: '21:00', end: '01:30', entry: 'door', price: 500, capacity: 250, age: 21, stag: 'couples', sounds: ['Disco & funk'], family: 'retro', kind: 'themed', status: 'live' }
];
export const DEMO_HOST = { name: 'Afterhours Collective', type: 'collective', status: 'verified', insta: 'afterhours.pune' };

/* friends going, per night (shown only to the demo account: they're its friends) */
const GOING = {
  bollywoodbash: ['Dev', 'Arjun'],
  empiresaturdays: ['Riya'],
  desidrop: ['Kabir'],
  sunsetsession: ['Meera'],
  epitomelive: ['Tanvi'],
  retrorewind: ['Dev', 'Arjun'],
  reggaetonsundays: ['Kabir'],
  kikifridays: ['Riya', 'Tanvi']
};

/* ---------------------------------------------------------------- building it for a day */
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* "21:30" → "9:30 pm" */
function clock(t) {
  var m = /^(\d{1,2}):(\d{2})$/.exec(t),
    h = +m[1];
  return (h % 12 || 12) + (m[2] === '00' ? '' : ':' + m[2]) + (h < 12 ? ' am' : ' pm');
}

/* the day a night starts on: after midnight (before 6 am) it's the next calendar day of its evening */
function startIso(today, d, t) {
  var day = addDays(today, d + (+t.slice(0, 2) < 6 ? 1 : 0));
  return day + 'T' + t + ':00+05:30';
}

function dateTxt(iso) {
  var x = new Date(Date.parse(iso) + 330 * 60000);
  return WD[x.getUTCDay()] + ' ' + x.getUTCDate() + ' ' + MO[x.getUTCMonth()];
}

/* "leave by": half an hour before the start, "8:30" */
function leaveBy(t) {
  var mins = +t.slice(0, 2) * 60 + +t.slice(3) - 30,
    h = Math.floor(mins / 60);
  return (h % 12 || 12) + ':' + String(mins % 60).padStart(2, '0');
}

/* everything the demo needs, for tonight = today ('YYYY-MM-DD'); defaults to the real tonight */
export function buildDemo(today) {
  today = today || demoToday();
  var dayOf = (d) => addDays(today, d),
    events = {},
    door = {},
    crowd = {};
  LISTED.forEach((x) => {
    var iso = startIso(today, x.d, x.t);
    events[x.id] = {
      id: x.id,
      src: 'district',
      demo: true,
      title: x.title,
      venue: x.venue,
      day: x.d >= 0 && x.d < 7 ? WD[new Date(dayOf(x.d) + 'T00:00:00Z').getUTCDay()].toLowerCase() : 'later',
      date: dateTxt(iso),
      time: clock(x.t),
      end: clock(x.end),
      leave: leaveBy(x.t),
      genre: x.genre,
      tags: x.tags.concat(x.price ? [] : ['free']),
      price: x.price || 0,
      rsvp: !x.price,
      age: x.age,
      img: x.img ? poster(x.img) : '',
      url: '',
      friends: [],
      nFriends: 0,
      iso: iso
    };
    var rule = Object.assign({}, x.door);
    if (rule.ago != null) rule.checkedAt = dayOf(-rule.ago);
    delete rule.ago;
    if (!rule.source) delete rule.source;
    door[x.id] = rule;
    if (x.crowd) crowd[x.id] = x.crowd;
  });
  function hosted(x) {
    var o = Object.assign({}, x, {
      date: addDays(today, x.d + (+x.start.slice(0, 2) < 6 ? 1 : 0)),
      price: String(x.price || ''),
      capacity: String(x.capacity || ''),
      age: String(x.age),
      poster: x.poster ? poster(x.poster) : '',
      status: x.status || 'live',
      demo: true
    });
    delete o.d;
    delete o.crowd;
    if (x.crowd) crowd[x.id] = x.crowd;
    return o;
  }
  return {
    today: today,
    events: events,
    door: door,
    crowd: crowd,
    going: GOING,
    // other venues' hosted nights, for everyone's feed: [{ night, host }] like the Supabase feed
    feed: HOSTED.map((x) => ({ night: hosted(x), host: x.host })),
    // Afterhours Collective's nights: its own in host mode; the live and past ones are in everyone's feed too
    hostNights: HOST_NIGHTS.map(hosted)
  };
}

/* ---------------------------------------------------------------- host numbers (sample) */
const FIRST = ['Aarav', 'Ishita', 'Rohan', 'Sana', 'Kunal', 'Pooja', 'Vikram', 'Ananya', 'Nikhil', 'Tara', 'Yash', 'Diya', 'Omkar', 'Ritika', 'Siddharth', 'Neel', 'Aditi', 'Karan', 'Shreya', 'Varun'];
const LAST = ['Shah', 'Kulkarni', 'Desai', 'Khan', 'Joshi', 'Iyer', 'Rao', 'Patil', 'Mehta', 'Bhosale', 'Nair', 'Singh', 'Das', 'Gupta'];

function code(n) {
  return 'G-' + (n * 7919 + 104729).toString(36).toUpperCase().slice(-6).padStart(6, '7');
}

/* n guests (one pass each), the first `inN` checked in. The last five in arrived over the past half hour
   (the Door's "Just in"); the rest earlier. walkins: how many of the people in walked in */
function crowdOf(id, n, inN, walkins, now) {
  var guests = [],
    ci = {};
  for (var i = 0; i < n; i++) {
    var walk = i < walkins,
      name = FIRST[i % FIRST.length] + ' ' + LAST[(Math.floor(i / FIRST.length) + id.length) % LAST.length] + (i >= FIRST.length * LAST.length ? ' ' + (i + 1) : '');
    guests.push({ name: name, passes: 1, booked: walk ? 'Walk-in' : i % 3 ? 'Booked on gathr' : 'Group plan', code: code(i + id.length * 1000) });
    if (i < inN) ci[name] = now - (i < 5 ? (i + 1) * 6 : 40 + i) * 60000;
  }
  return { guests: guests, ci: ci };
}

/* what the host sees for one of Afterhours Collective's nights, or null for any other night */
export function demoHostStats(id, now) {
  var N = {
    'ah-mills': { views: 1310, interested: 402, n: 186, inN: 142, walkins: 0, cap: 240 },
    'ah-launch': { views: 1840, interested: 410, n: 212, inN: 184, walkins: 22, cap: 260 },
    'ah-discoinferno': { views: 1260, interested: 290, n: 160, inN: 131, walkins: 0, cap: 250 },
    'ah-basstheory': { views: 0, interested: 0, n: 0, inN: 0, walkins: 0, cap: 300 },
    'ah-cocktailclub': { views: 0, interested: 0, n: 0, inN: 0, walkins: 0, cap: 150 },
    'ah-aftermidnight': { views: 0, interested: 0, n: 0, inN: 0, walkins: 0, cap: 400 }
  }[id];
  if (!N) return null;
  var c = crowdOf(id, N.n, N.inN, N.walkins, now);
  return { sample: true, views: N.views, interested: N.interested, guests: c.guests, ci: c.ci, cap: N.cap };
}

/* ---------------------------------------------------------------- the guest's own state (section 7) */

/* the demo account's plans, bookings, saves and past nights, for the app's state */
export function demoGuest(today, now) {
  today = today || demoToday();
  var deadline = Date.parse(addDays(today, 2) + 'T20:00:00+05:30');
  return {
    planned: 'bollywoodbash',
    guests: 4,
    onList: true,
    myBookings: {
      bollywoodbash: { id: 'demo-bb', event: 'bollywoodbash', passes: 4, with: ['Dev', 'Arjun'], code: 'G-BB4D3M', demo: true },
      sunsetsession: { id: 'demo-ss', event: 'sunsetsession', passes: 2, code: 'G-SS2D3M', demo: true },
      retrorewind: { id: 'demo-rr', event: 'retrorewind', passes: 3, with: ['Dev', 'Arjun'], demo: true },
      reggaetonsundays: { id: 'demo-rs', event: 'reggaetonsundays', passes: 2, with: ['Kabir'], demo: true },
      'ah-launch': { id: 'demo-al', event: 'ah-launch', passes: 1, checkedInAt: Date.parse(addDays(today, -6) + 'T22:42:00+05:30'), demo: true },
      kikifridays: { id: 'demo-kf', event: 'kikifridays', passes: 3, with: ['Riya', 'Tanvi'], demo: true }
    },
    pastNights: ['retrorewind', 'reggaetonsundays', 'ah-launch', 'kikifridays'],
    saved: { empiresaturdays: 1, epitomelive: 1 },
    vote: null,
    gp: {
      name: 'Friday plan',
      opts: ['unscrupulousfriday', 'rooftopafterdark', 'desidrop'],
      deadline: '8 pm',
      deadlineAt: deadline,
      votes: { rooftopafterdark: ['Dev'], unscrupulousfriday: ['Arjun'], desidrop: [] },
      members: ['Dev', 'Arjun', 'Meera'],
      stage: 'voting',
      sharedAt: (now || Date.now()) - 20 * 3600000,
      booked: null,
      demo: true // the sample friends' scripted votes leave it alone: 2 of 4 have voted
    },
    // the day-after answers: Reggaeton Sundays and Launch Night answered; Retro Rewind's card is still waiting
    dayAfter: {
      reggaetonsundays: { in: 'yes', sound: 'great', crowd: 'packed', step: 'thanks', done: true },
      'ah-launch': { in: 'yes', sound: 'great', crowd: 'packed', step: 'thanks', done: true }
    }
  };
}

/* the past nights record (You, Wrapped): [venue, night, date, with] */
export function demoRecord(today) {
  var b = buildDemo(today),
    row = (id, venue, title, d, who) => [venue, title, dateTxt(addDays(b.today, d) + 'T21:00:00+05:30').slice(4), who];
  return [
    row('retrorewind', 'themillers', 'Retro Rewind', -2, 'Dev, Arjun'),
    row('reggaetonsundays', 'bailamos', 'Reggaeton Sundays', -5, 'Kabir'),
    row('ah-launch', 'acai', 'Afterhours: Launch Night', -6, ''),
    row('kikifridays', 'kiki', 'Kiki Fridays', -12, 'Riya, Tanvi')
  ];
}


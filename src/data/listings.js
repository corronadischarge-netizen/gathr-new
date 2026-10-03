/* Real data: Pune listings pulled from District and Sort My Scene on 29 Sep 2026.
   Crowd levels, friends and group votes are SAMPLE data: no live crowd feed exists yet. */
const SMS = 'https://assets.sortmyscene.com/img/event-hero/';

const DIS = 'https://cdn.district.in/assets/events/publisher/event_cover_image_horizontal/';

/* lat/lng are approximate venue locations (area-level), for the prototype map */
export const VENUES = {
  kukoo: {
    id: 'kukoo',
    name: 'Kukoo',
    area: 'The Mills, Sangamwadi',
    crowd: 'buzzing',
    lat: 18.5362,
    lng: 73.8764,
    ic: 'discoball',
    hue: 'pink',
    cluster: 'mills'
  },
  plunge: {
    id: 'plunge',
    name: 'Plunge',
    area: 'Koregaon Park',
    crowd: 'warming',
    lat: 18.5388,
    lng: 73.8934,
    ic: 'cocktail',
    hue: 'blue'
  },
  fml: {
    id: 'fml',
    name: 'FML',
    area: 'Kalyani Nagar',
    crowd: 'quiet',
    lat: 18.5475,
    lng: 73.9025,
    ic: 'headphones',
    hue: 'green'
  },
  opus: {
    id: 'opus',
    name: 'Opus Club & Lounge',
    area: 'Baner',
    crowd: 'packed',
    lat: 18.5635,
    lng: 73.778,
    ic: 'champagne',
    hue: 'violet'
  },
  ozone: {
    id: 'ozone',
    name: 'Ozone',
    area: 'Sinhgad Road',
    crowd: 'buzzing',
    lat: 18.48,
    lng: 73.825,
    ic: 'mic',
    hue: 'yellow'
  },
  kopa: {
    id: 'kopa',
    name: 'KOPA Mall',
    area: 'Koregaon Park',
    crowd: 'quiet',
    lat: 18.5352,
    lng: 73.8988,
    ic: 'speaker',
    hue: 'red'
  },
  epitome: {
    id: 'epitome',
    name: 'Epitome',
    area: 'The Mills, Sangamwadi',
    crowd: 'warming',
    lat: 18.5346,
    lng: 73.8779,
    ic: 'vinyl',
    hue: 'violet',
    cluster: 'mills'
  },
  palacio: {
    id: 'palacio',
    name: 'The Game Palacio',
    area: 'The Mills, Sangamwadi',
    crowd: 'full',
    lat: 18.5356,
    lng: 73.8796,
    ic: 'spotlight',
    hue: 'yellow',
    cluster: 'mills'
  },
  antisocial: {
    id: 'antisocial',
    name: 'Anti Social',
    area: 'Shivaji Nagar',
    crowd: 'quiet',
    lat: 18.5306,
    lng: 73.8478,
    ic: 'sunglasses',
    hue: 'red'
  }
};

export const EVENTS = {
  illegal: {
    id: 'illegal',
    src: 'sms',
    title: 'Almost Illegal Thursday',
    venue: 'kukoo',
    day: 'thu',
    date: 'Thu 1 Oct',
    time: '8 pm',
    end: '1:30 am',
    leave: '7:30',
    genre: 'Commercial, Bollywood, hip-hop',
    tags: ['bollywood', 'hiphop', 'commercial'],
    price: 500,
    img: SMS + 'almost-illegal-thursday1779528287015.webp',
    url: 'https://sortmyscene.com/event/almost-illegal-thursday-oct-01-2026',
    friends: ['Zoya', 'Aman', 'Kabir'],
    nFriends: 3
  },
  gossip: {
    id: 'gossip',
    src: 'sms',
    title: 'Gossip Gurl',
    venue: 'kukoo',
    day: 'wed',
    date: 'Wed 30 Sep',
    time: '8 pm',
    end: '1:30 am',
    leave: '7:30',
    genre: "Commercial, girls' night, DJ",
    tags: ['commercial', 'ladies'],
    price: 285,
    img: SMS + 'gossip-gurl1780903366584.webp',
    url: 'https://sortmyscene.com/event/gossip-gurl-sep-30-2026',
    friends: ['Kavya'],
    nFriends: 1
  },
  dearwed: {
    id: 'dearwed',
    src: 'sms',
    title: 'Dear Wednesday',
    venue: 'plunge',
    day: 'wed',
    date: 'Wed 30 Sep',
    time: '8 pm',
    end: '1:30 am',
    leave: '7:30',
    genre: 'Bollywood, BollyTech, Afro, EDM',
    tags: ['bollywood', 'edm', 'free'],
    price: 0,
    rsvp: true,
    img: SMS + 'dear-wednesday1786004527173.webp',
    url: 'https://sortmyscene.com/event/dear-wednesday-sep-30-2026',
    friends: [],
    nFriends: 0
  },
  twilight: {
    id: 'twilight',
    src: 'sms',
    title: 'Twilight Thursday',
    venue: 'fml',
    day: 'thu',
    date: 'Thu 1 Oct',
    time: '8 pm',
    end: null,
    leave: '7:30',
    genre: 'Bollywood, commercial, hip-hop',
    tags: ['bollywood', 'hiphop', 'commercial'],
    price: null,
    img: SMS + 'twilight-thursday1701868301511.webp',
    url: 'https://sortmyscene.com/event/twilight-thursday-oct-01-2026',
    friends: [],
    nFriends: 0
  },
  lavish: {
    id: 'lavish',
    src: 'sms',
    title: 'Lavish Friday',
    venue: 'opus',
    day: 'fri',
    date: 'Fri 2 Oct',
    time: '8 pm',
    end: null,
    leave: '7:30',
    genre: 'Bollywood, commercial, hip-hop',
    tags: ['bollywood', 'hiphop', 'commercial'],
    price: null,
    img: SMS + 'lavish-friday1701871052142.webp',
    url: 'https://sortmyscene.com/event/lavish-friday-oct-02-2026',
    friends: ['Aman', 'Zoya'],
    nFriends: 2
  },
  bollywood: {
    id: 'bollywood',
    src: 'sms',
    title: 'Bollywood Night',
    venue: 'ozone',
    day: 'fri',
    date: 'Fri 2 Oct',
    time: '8 pm',
    end: null,
    leave: '7:30',
    genre: 'Bollywood, hip-hop',
    tags: ['bollywood', 'hiphop'],
    price: null,
    img: SMS + 'bollywood-night1701343904313.webp',
    url: 'https://sortmyscene.com/event/bollywood-night-oct-02-2026',
    friends: ['Kavya'],
    nFriends: 1
  },
  scandalous: {
    id: 'scandalous',
    src: 'district',
    title: 'Scandalous Saturday',
    venue: 'palacio',
    day: 'sat',
    date: 'Sat 3 Oct',
    time: '10 pm',
    end: '11:59 pm',
    leave: '9:30',
    genre: 'Club night',
    tags: ['commercial'],
    price: 249,
    age: 18,
    img: DIS + '01KYPZZ1CX47PED4NEEVTT0BSG.jpg',
    url: 'https://www.district.in/events/scandalous-saturday-at-the-game-palacio-pune-aug8-2026-buy-tickets',
    friends: [],
    nFriends: 0
  },
  yellow: {
    id: 'yellow',
    src: 'district',
    title: 'The Yellow Diary: ICWF Tour',
    venue: 'kopa',
    day: 'sun',
    date: 'Sun 4 Oct',
    time: '6 pm',
    end: null,
    leave: '5:30',
    genre: 'Live gig',
    tags: ['live'],
    price: 799,
    age: 18,
    noReentry: true,
    img: DIS + '01M1KPVA1J8E0Z42801N14HQHN.jpg',
    url: 'https://www.district.in/events/the-yellow-diary-icwf-tour-pune-oct4-2026-buy-tickets',
    artist: 'The Yellow Diary',
    friends: ['Zoya', 'Kavya'],
    nFriends: 2
  },
  twin: {
    id: 'twin',
    src: 'district',
    title: 'Twin Strings: Karwaan Tour',
    venue: 'epitome',
    day: 'later',
    date: 'Fri 9 Oct',
    time: '9:30 pm',
    gates: '8:30 pm',
    end: null,
    leave: '8',
    genre: 'Indie pop, soft rock (live)',
    tags: ['live'],
    price: 1299,
    age: 21,
    idNote: 'Valid ID mandatory: Aadhaar, PAN, DL or passport',
    img: DIS + '01M1ZWCY1CQC5M2X9GG385WHE1.jpg',
    url: 'https://www.district.in/events/twin-strings-karwaan-india-tour-pune-oct9-2026-buy-tickets',
    artist: 'Twin Strings',
    friends: ['Aman'],
    nFriends: 1
  },
  resign: {
    id: 'resign',
    src: 'district',
    title: 'Fake Resignation Party',
    venue: 'antisocial',
    day: 'later',
    date: 'Fri 23 Oct',
    time: '9 pm',
    end: '1 am',
    leave: '8:30',
    genre: 'DJ lineup, themed party',
    tags: ['commercial', 'themed'],
    price: 1199,
    age: 21,
    dress: 'Formals with a twist',
    img: DIS + '01M1RNCQEBPSMX0B584KBDR86W.jpeg',
    url: 'https://www.district.in/events/fake-resignation-party-antisocial-pune-oct23-2026-buy-tickets',
    friends: ['Zoya', 'Aman', 'Kavya', 'Kabir'],
    nFriends: 4
  }
};

export const ORDER = [
  'gossip',
  'dearwed',
  'illegal',
  'twilight',
  'lavish',
  'bollywood',
  'scandalous',
  'yellow',
  'twin',
  'resign'
];

/* real start times (IST). Past nights drop off the feed on their own; "this week" is worked out from today. */
const ISO = {
  gossip: '2026-09-30T20:00',
  dearwed: '2026-09-30T20:00',
  illegal: '2026-10-01T20:00',
  twilight: '2026-10-01T20:00',
  lavish: '2026-10-02T20:00',
  bollywood: '2026-10-02T20:00',
  scandalous: '2026-10-03T22:00',
  yellow: '2026-10-04T18:00',
  twin: '2026-10-09T21:30',
  resign: '2026-10-23T21:00'
};

Object.keys(ISO).forEach((k) => {
  EVENTS[k].iso = ISO[k] + ':00+05:30';
});

ORDER.sort((a, b) => new Date(EVENTS[a].iso) - new Date(EVENTS[b].iso));

export function isPast(e) {
  return Date.now() > new Date(e.iso).getTime() + 6 * 3600000;
}

export function upcoming() {
  return ORDER.filter((k) => !isPast(EVENTS[k]));
}

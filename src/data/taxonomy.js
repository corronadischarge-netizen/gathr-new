/* What a night sounds like and what kind of night it is: one set of lists, used by the host's listing, the
   event page, the filters and Tune your week. The keys match the database (migration 20261008100000_genres). */

/* Genre families (a night must have one) and the exact genres in each (optional): [key, name, 3D icon, colour, genres].
   The icons are stand-ins until the family icons are made. */
export const FAMILIES = [
  [
    'electronic',
    'Electronic',
    'spotlight',
    'green',
    ['Techno', 'House', 'Tech house', 'Melodic techno', 'Afro house', 'Drum & bass', 'Psytrance', 'EDM']
  ],
  [
    'hiphop',
    'Hip-hop & R&B',
    'headphones',
    'yellow',
    ['Hip-hop', 'Desi hip-hop', 'R&B', 'Trap', 'Afrobeats']
  ],
  ['desi', 'Bollywood & desi', 'mic', 'pink', ['Bollywood', 'Punjabi', 'Bollywood remix', 'Sufi']],
  ['commercial', 'Commercial', 'discoball', 'violet', ['Chart hits', 'Pop', 'Latin / reggaeton', 'Mashups']],
  ['live', 'Live', 'speaker', 'blue', ['Indie / band', 'Rock', 'Jazz', 'Acoustic']],
  ['retro', 'Retro', 'vinyl', 'red', ['80s–90s', '2000s throwbacks', 'Retro Bollywood', 'Disco & funk']]
];

export function family(key) {
  return FAMILIES.filter((f) => f[0] === key)[0] || null;
}

/* Energy: how hard the night goes */
export const ENERGY = [
  ['chill', 'Chill'],
  ['groovy', 'Groovy'],
  ['high', 'High energy']
];

export function energyName(key) {
  var x = ENERGY.filter((e) => e[0] === key)[0];
  return x ? x[1] : null;
}

/* Kinds of night: [key, name, 3D icon]. Anything else is suggested to gathr, never typed onto a night. */
export const NIGHT_KINDS = [
  ['club', 'Club night', 'discoball'],
  ['ladies', 'Ladies night', 'cocktail'],
  ['brunch', 'Brunch party', 'champagne'],
  ['rooftop', 'Rooftop / sundowner', 'sunglasses'],
  ['gig', 'Live gig', 'speaker'],
  ['concert', 'Concert', 'mic'],
  ['karaoke', 'Karaoke', 'megaphone'],
  ['guestdj', 'Guest DJ / takeover', 'headphones'],
  ['themed', 'Theme party', 'sunglasses'],
  ['underground', 'Underground / warehouse', 'spotlight'],
  ['silent', 'Silent disco', 'headphones'],
  ['after', 'Afterparty', 'water']
];

export function nightKind(key) {
  // nights saved before the 12 kinds: girls' nights are ladies nights, live is a live gig
  key = { girls: 'ladies', live: 'gig' }[key] || key;
  return NIGHT_KINDS.filter((k) => k[0] === key)[0] || NIGHT_KINDS[0];
}

/* the kinds the database knew before migration 20261008100000, for saving to one that hasn't run it yet */
export function legacyKind(key) {
  return { ladies: 'girls', gig: 'live', concert: 'live', themed: 'themed' }[key] || 'club';
}

/* Pick by artist: well-known artists and where they sit, so a host who types one gets the family and genre
   suggested. [artist, family, genre] */
export const ARTISTS = [
  ['Anyma', 'electronic', 'Melodic techno'],
  ['Argy', 'electronic', 'Melodic techno'],
  ['Boris Brejcha', 'electronic', 'Techno'],
  ['Charlotte de Witte', 'electronic', 'Techno'],
  ['Amelie Lens', 'electronic', 'Techno'],
  ['Black Coffee', 'electronic', 'Afro house'],
  ['Keinemusik', 'electronic', 'Afro house'],
  ['Peggy Gou', 'electronic', 'House'],
  ['Fred again..', 'electronic', 'House'],
  ['John Summit', 'electronic', 'Tech house'],
  ['Martin Garrix', 'electronic', 'EDM'],
  ['Nucleya', 'electronic', 'EDM'],
  ['Lost Stories', 'electronic', 'EDM'],
  ['Ritviz', 'electronic', 'EDM'],
  ['Infected Mushroom', 'electronic', 'Psytrance'],
  ['Pendulum', 'electronic', 'Drum & bass'],
  ['DIVINE', 'hiphop', 'Desi hip-hop'],
  ['Seedhe Maut', 'hiphop', 'Desi hip-hop'],
  ['KR$NA', 'hiphop', 'Desi hip-hop'],
  ['Raftaar', 'hiphop', 'Desi hip-hop'],
  ['Travis Scott', 'hiphop', 'Trap'],
  ['Drake', 'hiphop', 'Hip-hop'],
  ['The Weeknd', 'hiphop', 'R&B'],
  ['Burna Boy', 'hiphop', 'Afrobeats'],
  ['Wizkid', 'hiphop', 'Afrobeats'],
  ['Diljit Dosanjh', 'desi', 'Punjabi'],
  ['Karan Aujla', 'desi', 'Punjabi'],
  ['AP Dhillon', 'desi', 'Punjabi'],
  ['Badshah', 'desi', 'Punjabi'],
  ['Arijit Singh', 'desi', 'Bollywood'],
  ['Vishal-Shekhar', 'desi', 'Bollywood'],
  ['DJ Chetas', 'desi', 'Bollywood remix'],
  ['DJ Lijo', 'desi', 'Bollywood remix'],
  ['Nooran Sisters', 'desi', 'Sufi'],
  ['Dua Lipa', 'commercial', 'Pop'],
  ['Calvin Harris', 'commercial', 'Chart hits'],
  ['Bad Bunny', 'commercial', 'Latin / reggaeton'],
  ['DJ Snake', 'commercial', 'Chart hits'],
  ['Prateek Kuhad', 'live', 'Acoustic'],
  ['The Local Train', 'live', 'Indie / band'],
  ['When Chai Met Toast', 'live', 'Indie / band'],
  ['Parvaaz', 'live', 'Rock'],
  ['Thermal and a Quarter', 'live', 'Rock'],
  ['Sanjeev Thomas', 'live', 'Jazz'],
  ['ABBA', 'retro', 'Disco & funk'],
  ['Daft Punk', 'retro', 'Disco & funk'],
  ['Backstreet Boys', 'retro', '80s–90s'],
  ['R.D. Burman', 'retro', 'Retro Bollywood']
];

/* artists whose name contains what was typed (start-of-word matches first) */
export function findArtists(q) {
  q = (q || '').trim().toLowerCase();
  if (q.length < 2) return [];
  var starts = [],
    has = [];
  ARTISTS.forEach((a) => {
    var n = a[0].toLowerCase();
    if (n.indexOf(q) === 0 || n.indexOf(' ' + q) >= 0) starts.push(a);
    else if (n.indexOf(q) >= 0) has.push(a);
  });
  return starts.concat(has).slice(0, 5);
}

export function artistInfo(name) {
  return ARTISTS.filter((a) => a[0].toLowerCase() === (name || '').trim().toLowerCase())[0] || null;
}

/* a Tune your week pick's name (a family or kind key; older picks were saved by name) */
export function pickName(k) {
  var f = family(k);
  if (f) return f[1];
  var n = NIGHT_KINDS.filter((x) => x[0] === k)[0];
  return n ? n[1] : k;
}

/* the This week filter key a family counts for (the tiles were Bollywood, Hip-hop and Live gigs) */
export const FAMILY_TAG = {
  desi: 'bollywood',
  hiphop: 'hiphop',
  live: 'live',
  electronic: 'edm',
  commercial: 'commercial',
  retro: 'retro'
};

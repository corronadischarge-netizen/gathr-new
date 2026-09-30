import { APP_URL } from '../config';

/* sample record of past nights: SAMPLE data, used for status, the record and Wrapped */
export const REC = [
  ['kukoo', 'Almost Illegal Thursday', '18 Sep', 'Zoya, Aman'],
  ['plunge', 'Dear Wednesday', '10 Sep', 'Kavya'],
  ['epitome', 'Indie night', '5 Sep', 'Aman'],
  ['kukoo', 'Gossip Gurl', '3 Sep', 'Zoya, Kavya'],
  ['opus', 'Lavish Friday', '29 Aug', 'Zoya, Aman, Kabir'],
  ['fml', 'Twilight Thursday', '21 Aug', 'Aman']
];

const LEVELS = [
  ['Newbie', 0, 'Your first nights out with gathr'],
  ['Regular', 3, 'Early ticket access · priority lane at door-confirmed venues'],
  ['Insider', 10, 'Everything Regular gets · reserved seating at partner venues · first look at new nights']
];

export const DOOR_OK = { kukoo: 1, epitome: 1, palacio: 1, plunge: 1 };

export const FRIEND_SHAPE = {
  Zoya: ['flower', 'pink'],
  Aman: ['arch', 'yellow'],
  Kavya: ['circle', 'green'],
  Kabir: ['pill', 'blue'],
  Riya: ['flower', 'violet']
};

export function nightsCount(S) {
  return REC.length + (S.checkedIn ? 1 : 0);
}

export function levelOf(n) {
  var l = LEVELS[0];
  LEVELS.forEach((x) => {
    if (n >= x[1]) l = x;
  });
  return l;
}

export function nextLevel(n) {
  for (var i = 0; i < LEVELS.length; i++) if (n < LEVELS[i][1]) return LEVELS[i];
  return null;
}

export function gpVoted(gp, vote) {
  var who = {};
  Object.keys(gp.votes).forEach((k) => {
    gp.votes[k].forEach((n) => {
      who[n] = k;
    });
  });
  if (vote) who.Riya = vote;
  return who;
}

export function gpWinner(gp, vote) {
  var best = gp.opts[0],
    bn = -1;
  gp.opts.forEach((k) => {
    var n = (gp.votes[k] || []).length + (vote === k ? 1 : 0);
    if (n > bn) {
      bn = n;
      best = k;
    }
  });
  return best;
}

export function passCode(S, e) {
  var x = S.payId || e.id + (S.email || 'guest'),
    n = 0;
  for (var i = 0; i < x.length; i++) n = (n * 31 + x.charCodeAt(i)) >>> 0;
  return 'G-' + n.toString(36).toUpperCase().slice(0, 6).padStart(6, '7');
}

export function planLink(gp, by) {
  return (
    APP_URL +
    '#plan=' +
    encodeURIComponent(gp.opts.join(',')) +
    '&n=' +
    encodeURIComponent(gp.name || 'Night out') +
    '&d=' +
    encodeURIComponent(gp.deadline || '') +
    '&by=' +
    encodeURIComponent((by || '').split(' ')[0] || 'A friend')
  );
}

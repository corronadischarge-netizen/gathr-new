import { APP_URL } from '../config';
import { WD } from '../data/dates';
import { goingWith } from '../data/group';
import { VENUES } from '../data/listings';
import { Share } from '../services/share';
import { storyImage } from './storyImage';
import { shareToast } from './utils';

/* "Thu · 9 pm" */
export function nightWhen(e) {
  return WD[new Date(e.iso).getDay()].slice(0, 3) + ' · ' + e.time;
}

/* a booked night's StoryCard props: the card after booking, in Plans, and the shared picture */
export function nightCard(S, e) {
  return {
    image: e.img,
    title: e.title,
    meta: nightWhen(e),
    place: VENUES[e.venue].name,
    status: e.rsvp ? "You're on the list" : "You're in",
    people: goingWith(S, e.id)
  };
}

/* Share (r25): the night's StoryCard as a picture for the group chat, "We're in. Kukoo, Thu 9 pm". On a phone it's
   the share sheet; elsewhere the picture downloads. If the picture can't be made, the link goes instead */
export function shareNight(c, e) {
  var text = "We're in. " + VENUES[e.venue].name + ', ' + nightWhen(e).replace(' · ', ' ');
  function done(r, what) {
    c.set({ busy: null });
    var t = shareToast(r, what);
    if (t) c.toast(t);
  }
  c.set({ busy: 'story' });
  return storyImage(nightCard(c.S, e))
    .then((blob) => Share.file(blob, 'gathr-' + e.id + '.png', text).then((r) => done(r)))
    .catch(() =>
      Share.link(e.title, text, APP_URL + '#e=' + e.id).then(
        (r) => done(r, 'Link'),
        () => {
          c.set({ busy: null });
          c.toast('Couldn’t share. Try again');
        }
      )
    );
}

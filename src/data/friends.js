/* Your friends on gathr. The Friends screen, Going as and the plan read this one list.
   The demo account (profiles.demo in Supabase) has the demo friends (data/demo.js), with Neha's request waiting;
   every other account has none until gathr has a friends service. S.friendReq: null (waiting), 'yes', 'no' */
import { DEMO_FRIENDS, DEMO_REQUEST } from './demo';

export function friendsOf(S) {
  if (!S.demo) return [];
  return S.friendReq === 'yes' ? DEMO_FRIENDS.concat(DEMO_REQUEST) : DEMO_FRIENDS;
}

/* the friend request waiting for an answer, or null */
export function friendRequest(S) {
  return S.demo && !S.friendReq ? DEMO_REQUEST : null;
}

/* a friend's picture, by first name (public/avatars/; the initials show when it's missing) */
export function friendPhoto(name) {
  var f = DEMO_FRIENDS.concat(DEMO_REQUEST).filter((x) => x.name === name)[0];
  return f ? f.photo : undefined;
}

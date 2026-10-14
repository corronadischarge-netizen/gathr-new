/* Going as: who's going tonight, so the door rules can be checked for the whole group (home spec 5.1).
   group = { type: 'guys' | 'girls' | 'mixed' | 'couple' | 'solo' (just me, board 04) | null, size, women, men, under21, under25, source: 'manual' | 'plan',
             friends?: [{ id, name }] (r25, optional: friends on gathr you picked, for the GroupPill's names only) }
   The door is checked from type, size and age only; friends never change a verdict.
   null (or no type) = not set. Stored on the phone as S.group. */

export function isSet(g) {
  return !!(g && g.type);
}

/* stags: guys without a partner in the group */
export function stags(g) {
  if (!isSet(g)) return 0;
  if (g.type === 'guys') return g.size || 1;
  // just me: we don't know your gender, so stag rules count (stricter, never a refused door)
  if (g.type === 'solo') return 1;
  if (g.type === 'mixed') return Math.max(0, (g.men || 0) - (g.women || 0));
  return 0;
}

export function couples(g) {
  if (!isSet(g)) return 0;
  if (g.type === 'couple') return 1;
  if (g.type === 'mixed') return Math.min(g.women || 0, g.men || 0);
  return 0;
}

function hasSplit(g) {
  return (g.women || 0) + (g.men || 0) === g.size && (g.women || 0) + (g.men || 0) > 0;
}

/* "4 guys", "you", "a couple", "1 couple + 2 guys", "5 friends" */
export function groupLabel(g) {
  if (!isSet(g) || g.type === 'solo') return 'you';
  var n = g.size || 1;
  if (g.type === 'guys') return n === 1 ? 'you' : n + ' guys';
  if (g.type === 'girls') return n === 1 ? 'you' : n + ' girls';
  if (g.type === 'couple') return 'a couple';
  if (!hasSplit(g)) return n + ' friends';
  var c = couples(g),
    extra = n - c * 2,
    who = (g.men || 0) > (g.women || 0) ? 'guys' : 'girls';
  if (!c) return n + ' ' + who;
  var cs = c + (c === 1 ? ' couple' : ' couples');
  return extra ? cs + ' + ' + extra + ' ' + (extra === 1 ? who.slice(0, -1) : who) : cs;
}

/* anyone under 21 / under 25: from the group, and from your own profile age (you're in the group) */
export function under21(g, profileAge) {
  return !!(isSet(g) && g.under21) || profileAge === '18 to 20';
}

export function under25(g, profileAge) {
  return !!(isSet(g) && g.under25) || profileAge === '18 to 20' || profileAge === '21 to 24';
}

export function agePhrase(g, profileAge) {
  return under21(g, profileAge) ? 'someone under 21' : 'all 21+';
}

/* a group plan fills Going as: everyone who joined plus you; the type and split come from the planner's choice */
export function groupFromPlan(gp) {
  if (!gp || !gp.members) return null;
  var size = Math.min(10, gp.members.length + 1),
    t = gp.groupType || 'mixed';
  return {
    type: t,
    size: t === 'couple' ? 2 : size,
    women: gp.women || 0,
    men: gp.men || 0,
    under21: !!gp.under21,
    under25: !!gp.under25,
    // r25: a plan fills names in by itself
    friends: gp.members.slice(0, t === 'couple' ? 1 : size - 1).map((n) => ({ id: firstName(n).toLowerCase(), name: firstName(n) })),
    source: 'plan'
  };
}

/* the group the door is checked for: only what you chose in Going as (Shubh, 13 Oct). A plan's group isn't applied
   by itself, so the home never shows a group you didn't pick; Going as can fill it in from your plan */
export function currentGroup(S) {
  if (S.groupOff) return null; // ?group=none: the home as if nothing were set
  return isSet(S.group) ? S.group : null;
}

/* GroupPill copy (r25): who and what's next, never the group's make-up ("4 guys, all 21+" lives in Going as) */

/* "Riya Shah" → "Riya" */
export function firstName(n) {
  return String(n || '').trim().split(/\s+/)[0];
}

/* first names, at most two, then "+ n": "Riya", "Riya, Dev", "Riya, Dev + 2" */
export function namesLine(names) {
  var n = (names || []).map(firstName).filter(Boolean),
    two = n.slice(0, 2).join(', ');
  return n.length > 2 ? two + ' + ' + (n.length - 2) : two;
}

/* who's going, from the counts in Going as: "You + 3 guys", "You + 2 girls", "You and your date", "You + 4 friends",
   "Just you" */
export function countsTitle(g) {
  if (!isSet(g) || g.type === 'solo' || (g.size || 1) < 2) return 'Just you';
  if (g.type === 'couple') return 'You and your date';
  var more = g.size - 1,
    word = g.type === 'guys' ? 'guy' : g.type === 'girls' ? 'girl' : 'friend';
  return 'You + ' + more + ' ' + word + (more === 1 ? '' : 's');
}

/* the pill's title for a set group: names when you picked friends ("You, Riya, Dev + 1", "You and Dev" for a couple),
   otherwise the counts ("You + 3 guys"). "+ n" is everyone else in the group, on gathr or not */
export function groupTitle(g) {
  var f = (isSet(g) && g.type !== 'solo' && g.friends) || [];
  if (!f.length) return countsTitle(g);
  if (g.type === 'couple') return 'You and ' + firstName(f[0].name);
  var shown = f.slice(0, 2).map((x) => firstName(x.name)),
    more = Math.max(0, (g.size || 1) - 1 - shown.length);
  return ['You'].concat(shown).join(', ') + (more ? ' + ' + more : '');
}

/* Going as, "Add friends": pick or unpick one friend. Guys and girls grow to fit (10 at most); a couple has room for
   one date and a mixed group for its counts, so a pick with no room returns null (the sheet buzzes, nothing changes) */
export function toggleFriend(g, f) {
  var list = g.friends || [];
  if (list.some((x) => x.id === f.id)) return Object.assign({}, g, { friends: list.filter((x) => x.id !== f.id) });
  var next = list.concat({ id: f.id, name: firstName(f.name) }),
    need = next.length + 1;
  if (need <= (g.size || 1)) return Object.assign({}, g, { friends: next });
  if ((g.type === 'guys' || g.type === 'girls') && need <= 10) return Object.assign({}, g, { friends: next, size: need });
  return null;
}

/* after the type or size changes: just me has no friends; a smaller group drops the last ones picked */
export function fitFriends(g) {
  if (!g.friends) return g;
  return Object.assign({}, g, { friends: g.type === 'solo' ? [] : g.friends.slice(0, Math.max(0, (g.size || 1) - 1)) });
}

/* the pill's age line, only when it changes things. The group keeps "anyone under 21" as yes/no, not a count */
export function ageLine(g, profileAge) {
  return under21(g, profileAge) ? 'Someone under 21' : null;
}

/* "Waiting on Arjun · 8 pm", "Waiting on 2 · 8 pm" */
export function waitingLine(names, when) {
  var who = names.length === 1 ? firstName(names[0]) : names.length;
  return 'Waiting on ' + who + (when ? ' · ' + when : '');
}

/* who you're going with to a night you booked, for its StoryCard: you first, then the plan's members (a plan booking)
   or the friends you picked in Going as. Four faces at most */
export function goingWith(S, evId) {
  var me = { name: (S.me && S.me.name) || 'You', image: S.me && S.me.photo },
    gp = S.gp,
    names =
      gp && gp.stage === 'booked' && gp.booked === evId
        ? gp.members
        : ((currentGroup(S) || {}).friends || []).map((f) => f.name);
  return [me].concat(names.map((n) => ({ name: firstName(n) }))).slice(0, 4);
}

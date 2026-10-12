/* Going as: who's going tonight, so the door rules can be checked for the whole group (home spec 5.1).
   group = { type: 'guys' | 'girls' | 'mixed' | 'couple' | 'solo' (just me, board 04) | null, size, women, men, under21, under25, source: 'manual' | 'plan' }
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
    source: 'plan'
  };
}

/* the group the home checks the door for: what you set in Going as wins; otherwise an active plan's group */
export function currentGroup(S) {
  if (isSet(S.group) && S.group.source === 'manual') return S.group;
  if (S.gp && (S.gp.stage === 'voting' || S.gp.stage === 'booked')) return groupFromPlan(S.gp);
  return isSet(S.group) ? S.group : null;
}

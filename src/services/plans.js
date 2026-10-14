import { log } from '../lib/log';

/* Group plans between phones (interactions spec 6.7, 8).

   The backend has no plan tables yet, so votes can't reach everyone in real time. Until they exist, the app asks
   for news every few seconds (POLL) through pull(), and this file answers with sample friends who vote (and one who
   leaves) over the first minute after you share. When the backend is ready, only pull() and send() change:
   - tables plans, plan_members and plan_votes (Supabase), each row readable by the plan's members only
   - Supabase Realtime on plan_votes and plan_members, so a vote appears for everyone at once (then POLL becomes a
     fallback for when the connection drops)
   - a server job that closes the vote at the deadline */
export const PlanSync = {
  live: false,
  POLL: 4000,
  /* what changed since you last looked: { votes, leave: [names] } or null */
  pull: (gp, now) => Promise.resolve(sample(gp, now)),
  /* your own actions (vote, close, cancel): sent to the other phones once the backend exists */
  send: (gp, ev, d) => {
    log('plan', { on: ev, plan: gp.name, id: d && d.id });
    return Promise.resolve();
  }
};

/* sample friends: after you share a plan, each one votes at their moment, and Kabir drops out.
   The demo account's own Friday plan (demo: true) is left as it is: 2 of 4 have voted */
const SCRIPT = [
  { after: 6000, who: 'Dev', pick: 0 },
  { after: 14000, who: 'Arjun', pick: -1 },
  { after: 26000, who: 'Meera', pick: 0 },
  { after: 40000, who: 'Kabir', leave: true }
];

function sample(gp, now) {
  if (!gp || gp.demo || !gp.sharedAt || (gp.stage !== 'voting' && gp.stage !== 'closed')) return null;
  var since = now - gp.sharedAt,
    voted = {},
    votes = null,
    leave = [];
  Object.keys(gp.votes).forEach((k) => gp.votes[k].forEach((n) => (voted[n] = k)));
  SCRIPT.forEach((s) => {
    if (since < s.after || gp.members.indexOf(s.who) < 0) return;
    if (s.leave) {
      if (gp.stage === 'voting') leave.push(s.who);
      return;
    }
    if (voted[s.who] || gp.stage !== 'voting') return;
    var k = gp.opts[s.pick < 0 ? gp.opts.length + s.pick : s.pick];
    if (!k) return;
    votes = votes || {};
    votes[k] = (votes[k] || gp.votes[k] || []).concat(s.who);
    voted[s.who] = k;
  });
  return votes || leave.length ? { votes: votes, leave: leave } : null;
}

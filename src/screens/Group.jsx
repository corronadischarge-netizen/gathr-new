import { BookedNightCard } from '../cards/BookedNightCard';
import { VoteOptionCard } from '../cards/VoteOptionCard';
import { EVENTS, VENUES } from '../data/listings';
import { gpVoted, gpWinner, planLink } from '../data/sample';
import { Button, IconButton } from '../design-system';
import { shareToast } from '../lib/utils';
import { Share } from '../services/share';
import { eyebrow, fav, i3, meta, note, statusChip, stop } from '../ui/helpers';

/* The group plan: vote → book → everyone paid → on the way → home */
export function Group(p) {
  var c = p.ctx,
    S = c.S,
    gp = S.gp;
  if (!gp)
    return (
      <div
        className="full col pad-top center-col"
        style={{ gap: '16px', paddingTop: '120px', textAlign: 'center' }}
      >
        {i3('champagne', 110)}
        {stop('no plan yet')}
        <Button
          variant="primary"
          onClick={() => c.go('newplan', { draft: { opts: [], deadline: 'Thu 6 pm', name: 'Friday plan' } })}
        >
          Start a group plan
        </Button>
      </div>
    );
  var who = gpVoted(gp, S.vote),
    all = ['Riya'].concat(gp.members),
    voted = all.filter((n) => who[n]).length;
  var win = gpWinner(gp, S.vote),
    booked = gp.stage === 'booked',
    be = booked ? EVENTS[gp.booked] : null;
  var memberStatus = (n) => {
    if (!booked) return who[n] ? statusChip('Voted', 'ok') : statusChip('Waiting', 'wait');
    return n === 'Riya' ? statusChip('Booked', 'ok') : statusChip('Has pass', 'ok');
  };
  return (
    <div className="full col pad-top" style={{ gap: '22px', paddingTop: '52px' }}>
      <div className="rowc between">
        <IconButton icon="arrow-left" label="Back" variant="solid" onClick={c.back} />
        <IconButton
          icon="share"
          label="Share the plan link"
          variant="solid"
          onClick={() =>
            Share.link(gp.name, 'Vote on ' + gp.name + ' with me on gathr', planLink(gp, S.me.name)).then(
              (r) => {
                var t = shareToast(r, 'Plan link');
                if (t) c.toast(t);
              }
            )
          }
        />
      </div>
      <div>
        {eyebrow(booked ? gp.name + ' · booked' : gp.name + ' · voting closes ' + gp.deadline)}
        {stop(booked ? 'we’re going to ' + VENUES[be.venue].name.toLowerCase() : 'where are we going')}
      </div>
      <div className="col" style={{ gap: '10px' }}>
        <div className="rowc between">
          <span className="g-section-title">The group</span>
          {meta(booked ? 'Everyone has a pass' : voted + ' of ' + all.length + ' voted')}
        </div>
        {meta('Everyone here joined from your invite link.')}
        <div className="crew">
          {all.map((n) => (
            <div key={n} className="crew-item">
              {fav(n, 52)}
              <span className="meta" style={{ color: 'var(--ink)' }}>
                {n === 'Riya' ? 'You' : n}
              </span>
              {memberStatus(n)}
            </div>
          ))}
        </div>
      </div>
      {booked ? (
        <div className="col" style={{ gap: '12px' }}>
          <BookedNightCard ctx={c} e={be} />
          <Button variant="primary" size="lg" block icon="arrow-right" onClick={() => c.go('ready')}>
            Get ready for the night
          </Button>
        </div>
      ) : (
        <div className="col" style={{ gap: '12px' }}>
          {gp.opts.map((k) => (
            <VoteOptionCard key={k} ctx={c} id={k} winner={win} groupSize={all.length} />
          ))}
        </div>
      )}
      {!booked
        ? meta(
            S.vote
              ? 'You voted. Close the vote now or wait for ' +
                  gp.deadline +
                  '. You book once, and everyone gets a pass.'
              : 'Tap a night to vote. Friends and votes are sample data.'
          )
        : note('Friends are sample data.')}
      {!booked ? (
        <div className="bottom-stack" style={{ alignItems: 'stretch' }}>
          <Button
            variant="subtle"
            block
            icon="share"
            onClick={() => {
              var left = all.filter((n) => !who[n] && n !== 'Riya');
              Share.whatsapp(
                (left.length ? left.join(', ') + ': ' : '') +
                  'vote on ' +
                  gp.name +
                  ' before ' +
                  gp.deadline +
                  '. Takes 5 seconds, no app needed.\n' +
                  planLink(gp, S.me.name)
              );
            }}
          >
            Remind who hasn’t voted
          </Button>
          <Button
            variant="primary"
            size="lg"
            block
            disabled={!S.vote}
            onClick={() =>
              c.set({
                guests: all.length,
                gpBook: win,
                cur: win,
                stack: S.stack.concat('event'),
                sheet: EVENTS[win].age >= 21 && !S.age ? 'age' : 'list',
                after: 'list',
                dir: 'fwd'
              })
            }
          >
            {S.vote
              ? 'Close vote · book ' + VENUES[EVENTS[win].venue].name + ' for ' + all.length
              : 'Vote to close the plan'}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

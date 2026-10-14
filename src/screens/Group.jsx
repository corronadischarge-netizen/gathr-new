import { friendPhoto } from '../data/friends';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { BookedNightCard } from '../cards/BookedNightCard';
import { VoteOptionCard } from '../cards/VoteOptionCard';
import { EVENTS, VENUES } from '../data/listings';
import { gpVoted, planLink } from '../data/sample';
import { Button, Chip, IconButton } from '../design-system';
import { now } from '../lib/clock';
import { ms, phoneScale, reducedMotion, useFlip, useSwap } from '../lib/motion';
import { ME, closesText, leaders, tally } from '../lib/plan';
import { shareToast } from '../lib/utils';
import { Share } from '../services/share';
import { eyebrow, fav, i3, meta, note, statusChip, stop } from '../ui/helpers';

/* The group plan (interactions spec 6.7, 8): vote → close → book → everyone's in. Every change goes through the plan
   machine (ctx.planSend); the others' votes arrive by polling (services/plans.js) and update the bars in place */
export function Group(p) {
  var c = p.ctx,
    S = c.S,
    gp = S.gp;
  // the countdown is text ("closes 8 pm", "closes in 20 min"); it's redrawn every 30 s, never ticking seconds
  const [, tick] = useState(0);
  useEffect(() => {
    var t = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, []);
  if (!gp || gp.stage === 'cancelled')
    return (
      <div className="full col pad-top center-col" style={{ gap: '16px', paddingTop: '120px', textAlign: 'center' }}>
        {i3('champagne', 110)}
        {stop('no plan yet')}
        <Button variant="primary" onClick={() => c.go('newplan', { draft: { opts: [], name: 'Friday plan' } })}>
          Start a group plan
        </Button>
      </div>
    );
  var who = gpVoted(gp, S.vote),
    all = [ME].concat(gp.members),
    voted = all.filter((n) => who[n]).length,
    t = now(),
    stage = gp.stage,
    voting = stage === 'voting',
    booked = stage === 'booked',
    deciding = stage === 'closed' || stage === 'booking',
    top = leaders(gp, S.vote),
    win = deciding ? gp.winner : top[0] || gp.opts[0],
    be = booked ? EVENTS[gp.booked] : null,
    we = win ? EVENTS[win] : null;
  var memberStatus = (n) => (!booked ? (who[n] ? ['Voted', 'ok'] : ['Waiting', 'wait']) : n === ME ? ['Booked', 'ok'] : ['Has pass', 'ok']);
  var line = booked
    ? gp.name + ' · booked'
    : voting
      ? gp.name + ' · voting ' + closesText(gp, t)
      : gp.name + ' · voting closed';
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
                var x = shareToast(r, 'Plan link');
                if (x) c.toast(x);
              },
              () => c.toast('Couldn’t share. Try again')
            )
          }
        />
      </div>
      <div>
        {eyebrow(line)}
        {stop(booked ? 'we’re going to ' + VENUES[be.venue].name.toLowerCase() : 'where are we going')}
      </div>
      <div className="col" style={{ gap: '10px' }}>
        <div className="rowc between">
          <span className="g-section-title">The group</span>
          {meta(booked ? 'Everyone has a pass' : voted + ' of ' + all.length + ' voted')}
        </div>
        {meta('Everyone here joined from your invite link')}
        <div className="crew">
          {all.map((n) => (
            <div key={n} className="crew-item">
              {fav(n, 52, n === ME ? S.me.photo : friendPhoto(n))}
              <span className="meta" style={{ color: 'var(--ink)' }}>
                {n === ME ? 'You' : n}
              </span>
              <Status s={memberStatus(n)} />
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
        <VoteList winner={win} sig={JSON.stringify(tally(gp, S.vote))}>
          {gp.opts.map((k) => (
            <VoteOptionCard key={k} ctx={c} id={k} winner={win} groupSize={all.length} open={voting} />
          ))}
        </VoteList>
      )}
      {deciding && gp.tied ? (
        /* a tie: the planner picks from the tied nights */
        <div className="col" style={{ gap: '10px' }}>
          <span className="title15">It's a tie. Pick the night</span>
          <div className="wrap" role="radiogroup" aria-label="Pick the night">
            {gp.tied.map((k) => (
              <Chip key={k} role="radio" aria-pressed={undefined} aria-checked={false} onClick={() => c.planSend('PICK', { id: k })}>
                {EVENTS[k].title}
              </Chip>
            ))}
          </div>
        </div>
      ) : null}
      {voting
        ? meta(
            S.vote
              ? 'You voted. Close the vote now or wait till it ' + closesText(gp, t) + '. You book once, and everyone gets a pass'
              : 'Tap a night to vote. Friends and votes are sample data'
          )
        : booked
          ? note('Friends are sample data')
          : null}
      {!booked ? (
        <div className="bottom-stack" style={{ alignItems: 'stretch' }}>
          {voting ? (
            <Button
              variant="subtle"
              block
              icon="share"
              onClick={() => {
                var left = all.filter((n) => !who[n] && n !== ME);
                Share.link(
                  gp.name,
                  (left.length ? left.join(', ') + ': ' : '') +
                    'vote on ' +
                    gp.name +
                    ' before it ' +
                    closesText(gp, t) +
                    '. Takes 5 seconds, no app needed',
                  planLink(gp, S.me.name)
                ).then(
                  (r) => {
                    var x = shareToast(r, 'Plan link');
                    if (x) c.toast(x);
                  },
                  () => c.toast('Couldn’t share. Try again')
                );
              }}
            >
              Remind who hasn’t voted
            </Button>
          ) : null}
          {voting ? (
            <Button variant="primary" size="lg" block disabled={!S.vote} onClick={c.planBook}>
              {S.vote && we ? 'Close and book for ' + all.length : 'Vote to close the plan'}
            </Button>
          ) : gp.winner ? (
            <Button variant="primary" size="lg" block icon="ticket" onClick={c.planBook}>
              {'Book ' + all.length + ' passes'}
            </Button>
          ) : null}
          <Button variant="ghost" onClick={c.planCancel}>
            Cancel plan
          </Button>
        </div>
      ) : null}
    </div>
  );
}

/* a member's status: a new one cross-fades in place (spec 6.7) */
function Status(p) {
  var n = useSwap(p.s[0]);
  return (
    <span key={n} className={n ? 'g-swap' : undefined}>
      {statusChip(p.s[0], p.s[1])}
    </span>
  );
}

/* The nights up for the vote. Faces glide from one bar to another when a vote changes (FLIP); when a different night
   takes the lead, the "Leading" badge travels from the old card to the new one (in a layer above the cards). */
function VoteList(p) {
  var box = useRef(null),
    layer = useRef(null),
    last = useRef(null);
  useFlip(box, p.sig);
  useLayoutEffect(() => {
    var el = box.current && box.current.querySelector('.vote-lead');
    if (!el) {
      last.current = null;
      return;
    }
    var b = box.current.getBoundingClientRect(),
      r = el.getBoundingClientRect(),
      k = phoneScale(),
      at = { x: (r.left - b.left) / k, y: (r.top - b.top) / k, id: p.winner },
      prev = last.current;
    last.current = at;
    if (!prev || prev.id === at.id || reducedMotion() || !el.animate) return;
    var fly = el.cloneNode(true);
    fly.className += ' vote-lead-fly';
    fly.style.left = at.x + 'px';
    fly.style.top = at.y + 'px';
    layer.current.appendChild(fly);
    el.style.visibility = 'hidden';
    var a = fly.animate(
      [{ transform: 'translate(' + (prev.x - at.x) + 'px, ' + (prev.y - at.y) + 'px)' }, { transform: 'none' }],
      { duration: ms('--motion-slow'), easing: 'cubic-bezier(0.2, 0, 0, 1)' }
    );
    a.onfinish = a.oncancel = () => {
      fly.remove();
      el.style.visibility = '';
    };
  }, [p.winner]);
  return (
    <div ref={box} className="col vote-list" style={{ gap: '12px' }}>
      {p.children}
      <div ref={layer} className="vote-fly" aria-hidden="true" />
    </div>
  );
}

import { blockedFor, priceTxt } from '../data/format';
import { EVENTS, VENUES, upcoming } from '../data/listings';
import { planLink } from '../data/sample';
import { Button, Chip, IconButton } from '../design-system';
import { now } from '../lib/clock';
import { clockText, defaultDeadline, planStep } from '../lib/plan';
import { shareToast } from '../lib/utils';
import { Share } from '../services/share';
import { eyebrow, i3, meta, note, stop, svgIcon, thumb } from '../ui/helpers';
import { Tap } from '../ui/Tap';

export function NewPlan(p) {
  var c = p.ctx,
    S = c.S,
    d = S.draft || { opts: [], deadline: 'Thu 6 pm', name: 'Friday plan' };
  // only nights that still exist (a link or an old draft can name one that's gone)
  d = Object.assign({}, d, { opts: d.opts.filter((k) => EVENTS[k]) });
  function upd(x) {
    c.set({ draft: Object.assign({}, d, x) });
  }
  function tog(k) {
    var o = d.opts.slice(),
      i = o.indexOf(k);
    if (i >= 0) o.splice(i, 1);
    else if (o.length < 4) o.push(k);
    else {
      c.toast('Up to 4 nights keeps the vote quick');
      return;
    }
    upd({ opts: o });
  }
  /* when the vote closes (spec 8): 8 pm or 2 h before the first night by default, or earlier */
  var t = now(),
    starts = d.opts.map((k) => new Date(EVENTS[k].iso).getTime()),
    first = starts.length ? Math.min.apply(null, starts) : null,
    dflt = defaultDeadline(starts, t),
    choices = [dflt]
      .concat(first ? [first - 4 * 3600000, first - 3600000] : [])
      .filter((x, i, a) => x >= t + 30 * 60000 && (!first || x < first) && a.indexOf(x) === i)
      .sort((a, b) => a - b),
    at = choices.indexOf(d.deadlineAt) >= 0 ? d.deadlineAt : dflt;
  var pool = upcoming().filter((k) => !blockedFor(EVENTS[k], S.age));
  return (
    <div className="full col pad-top plan-new" style={{ gap: '40px', paddingTop: '52px' }}>
      <div className="rowc between">
        <IconButton icon="arrow-left" label="Back" variant="solid" onClick={c.back} />
      </div>
      <div className="rel">
        {i3('champagne', 88, 'head-ic bob')}
        {eyebrow('Your group votes, you book once')}
        {stop('start a plan')}
      </div>
      <div className="col" style={{ gap: '12px' }}>
        <span className="g-section-title">Pick 2 to 4 nights</span>
        <div className="col" style={{ gap: '8px' }}>
          {pool.map((k) => {
            var e = EVENTS[k],
              on = d.opts.indexOf(k) >= 0;
            return (
              <Tap
                onClick={() => tog(k)}
                key={k}
                className={'tap rowc pick-row' + (on ? ' on' : '')}
                role="checkbox"
                aria-checked={on}
                aria-label={e.title}
              >
                {thumb(e, 48)}
                <div className="col" style={{ gap: '2px', flexGrow: 1, minWidth: 0 }}>
                  <span className="title15">{e.title}</span>
                  {meta(e.date + ' · ' + VENUES[e.venue].name + ' · ' + priceTxt(e))}
                </div>
                <span className="pick-box">{on ? svgIcon(['M5 12.5l4.5 4.5L19 7'], 16) : null}</span>
              </Tap>
            );
          })}
        </div>
      </div>
      <div className="col" style={{ gap: '12px' }}>
        <span className="g-section-title">Voting closes</span>
        <div className="wrap">
          {choices.map((x) => (
            <Chip key={x} icon="clock" selected={at === x} onClick={() => upd({ deadlineAt: x })}>
              {clockText(x, t)}
            </Chip>
          ))}
        </div>
        {meta('At the deadline, the top night wins and you book it for everyone')}
      </div>
      {/* home v3: asked once, so every night's door rules are checked for the whole group */}
      <div className="col" style={{ gap: '12px' }}>
        <span className="g-section-title">Who's going?</span>
        <div className="wrap" role="radiogroup" aria-label="Your group">
          {[
            ['guys', 'Guys'],
            ['girls', 'Girls'],
            ['mixed', 'Mixed group', 'users']
          ].map((x) => (
            <Chip
              key={x[0]}
              icon={x[2]}
              role="radio"
              aria-pressed={undefined}
              aria-checked={d.groupType === x[0]}
              selected={d.groupType === x[0]}
              onClick={() => upd({ groupType: x[0], women: x[0] === 'mixed' ? d.women || 2 : 0 })}
            >
              {x[1]}
            </Chip>
          ))}
        </div>
        {d.groupType === 'mixed' ? (
          <div className="wrap" role="radiogroup" aria-label="How many girls, you included">
            {[1, 2, 3, 4].map((k) => (
              <Chip
                key={k}
                role="radio"
                aria-pressed={undefined}
                aria-checked={d.women === k}
                selected={d.women === k}
                onClick={() => upd({ women: k })}
              >
                {k + (k === 1 ? ' girl' : ' girls')}
              </Chip>
            ))}
          </div>
        ) : null}
        <div className="wrap" role="radiogroup" aria-label="Anyone under 21?">
          <Chip role="radio" aria-pressed={undefined} aria-checked={!d.under21} selected={!d.under21} onClick={() => upd({ under21: false })}>
            No, all 21+
          </Chip>
          <Chip role="radio" aria-pressed={undefined} aria-checked={!!d.under21} selected={!!d.under21} onClick={() => upd({ under21: true })}>
            Someone is
          </Chip>
        </div>
        {meta('It checks every night’s door rules for the whole group')}
      </div>
      <div className="bottom-stack" style={{ alignItems: 'stretch' }}>
        <Button
          variant="primary"
          size="lg"
          block
          icon="share"
          disabled={d.opts.length < 2}
          onClick={() => {
            var votes = {};
            d.opts.forEach((k) => {
              votes[k] = [];
            });
            // draft → share link → voting: the plan machine sets the deadline and opens the vote (spec 8)
            var gp = planStep(
              {
                name: d.name,
                opts: d.opts,
                votes: votes,
                members: ['Dev', 'Arjun', 'Meera', 'Kabir'],
                // the group's make-up, for the door verdicts (5 with you: the 4 sample friends + you)
                groupType: d.groupType || null,
                women: d.groupType === 'mixed' ? d.women || 0 : 0,
                men: d.groupType === 'mixed' ? 5 - (d.women || 0) : 0,
                under21: !!d.under21,
                stage: 'draft',
                booked: null,
                news: []
              },
              'SHARE',
              { deadlineAt: at },
              t
            );
            gp.deadline = clockText(at, t);
            c.set({ gp: gp, vote: null, draft: null, stack: ['plans', 'group'], dir: 'fwd' });
            // the phone's own share sheet (WhatsApp is usually first)
            Share.link(
              d.name,
              'Where are we going? Vote on ' +
                d.name +
                ' by ' +
                gp.deadline +
                ':\n' +
                d.opts.map((k) => '· ' + EVENTS[k].title + ' (' + EVENTS[k].date + ')').join('\n'),
              planLink({ opts: d.opts, name: d.name, deadline: gp.deadline }, S.me.name)
            ).then(
              (r) => {
                var x = shareToast(r, 'Plan link');
                if (x) c.toast(x);
              },
              () => c.toast('Couldn’t share. Try again')
            );
          }}
        >
          {d.opts.length >= 2 ? 'Invite your group · ' + d.opts.length + ' nights' : 'Pick at least 2 nights'}
        </Button>
        {note('Friends open the link in their browser. No app needed to vote')}
      </div>
    </div>
  );
}

import { blockedFor, priceTxt } from '../data/format';
import { EVENTS, VENUES, upcoming } from '../data/listings';
import { planLink } from '../data/sample';
import { Button, Chip, IconButton } from '../design-system';
import { Share } from '../services/share';
import { eyebrow, i3, meta, note, stop, svgIcon, thumb } from '../ui/helpers';
import { Tap } from '../ui/Tap';

export function NewPlan(p) {
  var c = p.ctx,
    S = c.S,
    d = S.draft || { opts: [], deadline: 'Thu 6 pm', name: 'Friday plan' };
  function upd(x) {
    c.set({ draft: Object.assign({}, d, x) });
  }
  function tog(k) {
    var o = d.opts.slice(),
      i = o.indexOf(k);
    if (i >= 0) o.splice(i, 1);
    else if (o.length < 3) o.push(k);
    else {
      c.toast('Up to 3 options keeps the vote quick');
      return;
    }
    upd({ opts: o });
  }
  var pool = upcoming().filter((k) => !blockedFor(EVENTS[k], S.age));
  return (
    <div className="full col pad-top" style={{ gap: '24px', paddingTop: '52px' }}>
      <div className="rowc between">
        <IconButton icon="arrow-left" label="Back" variant="solid" onClick={c.back} />
      </div>
      <div className="rel">
        {i3('champagne', 88, 'head-ic bob')}
        {eyebrow('Your group votes, you book once')}
        {stop('start a plan')}
      </div>
      <div className="col" style={{ gap: '10px' }}>
        <span className="g-section-title">Pick up to 3 nights</span>
        <div className="col">
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
                <span className="pick-box">{on ? svgIcon(['M5 12.5l4.5 4.5L19 7'], 14) : null}</span>
              </Tap>
            );
          })}
        </div>
      </div>
      <div className="col" style={{ gap: '10px' }}>
        <span className="g-section-title">Voting closes</span>
        <div className="wrap">
          {['Tonight 10 pm', 'Thu 6 pm', 'Fri noon'].map((t) => (
            <Chip key={t} icon="clock" selected={d.deadline === t} onClick={() => upd({ deadline: t })}>
              {t}
            </Chip>
          ))}
        </div>
        {meta('At the deadline, the top night wins and you book it for everyone.')}
      </div>
      <div className="bottom-stack" style={{ alignItems: 'stretch' }}>
        <Button
          variant="primary"
          size="lg"
          block
          icon="share"
          disabled={d.opts.length < 1}
          onClick={() => {
            var votes = {};
            d.opts.forEach((k) => {
              votes[k] = [];
            });
            c.set({
              gp: {
                name: d.name,
                opts: d.opts,
                deadline: d.deadline,
                votes: votes,
                members: ['Zoya', 'Aman', 'Kavya', 'Kabir'],
                stage: 'voting',
                booked: null,
                fresh: true
              },
              vote: d.opts.length === 1 ? d.opts[0] : null,
              stack: ['plans', 'group'],
              dir: 'fwd'
            });
            Share.whatsapp(
              'Where are we going? Vote on ' +
                d.name +
                ' by ' +
                d.deadline +
                ':\n' +
                d.opts.map((k) => '· ' + EVENTS[k].title + ' (' + EVENTS[k].date + ')').join('\n') +
                '\n' +
                planLink({ opts: d.opts, name: d.name, deadline: d.deadline }, S.me.name)
            );
            setTimeout(() => {
              c.set((o) => {
                if (
                  !o.gp ||
                  !o.gp.fresh ||
                  o.gp.stage !== 'voting' ||
                  o.stack[o.stack.length - 1] !== 'group'
                )
                  return {};
                var v = Object.assign({}, o.gp.votes);
                v[d.opts[0]] = (v[d.opts[0]] || []).concat('Zoya');
                return { gp: Object.assign({}, o.gp, { votes: v }), toast: 'Zoya voted' };
              });
            }, 2200);
            setTimeout(() => {
              c.set((o) => {
                if (
                  !o.gp ||
                  !o.gp.fresh ||
                  o.gp.stage !== 'voting' ||
                  o.stack[o.stack.length - 1] !== 'group'
                )
                  return {};
                var v = Object.assign({}, o.gp.votes),
                  k = d.opts[d.opts.length - 1];
                v[k] = (v[k] || []).concat('Aman');
                return { gp: Object.assign({}, o.gp, { votes: v }), toast: 'Aman voted' };
              });
            }, 4600);
          }}
        >
          {d.opts.length
            ? 'Invite by WhatsApp · ' + d.opts.length + (d.opts.length === 1 ? ' night' : ' nights')
            : 'Pick at least one night'}
        </Button>
        {note('Friends open the link in their browser. No app needed to vote.')}
      </div>
    </div>
  );
}

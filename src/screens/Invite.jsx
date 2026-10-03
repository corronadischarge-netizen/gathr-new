import { useState } from 'react';
import { InviteOptionCard } from '../cards/InviteOptionCard';
import { EVENTS, VENUES } from '../data/listings';
import { Button, IconButton } from '../design-system';
import { Share } from '../services/share';
import { eyebrow, i3, note, stop } from '../ui/helpers';
import { Tonight } from './Tonight';

/* A friend opens a plan link: vote, then send the vote back on WhatsApp */
export function Invite(p) {
  var c = p.ctx,
    S = c.S,
    inv = S.invite;
  const [pick, setPick] = useState(null);
  if (!inv) return <Tonight ctx={c} />;
  return (
    <div className="full col pad-top" style={{ gap: '22px', paddingTop: '52px' }}>
      <div className="rowc between">
        <IconButton icon="arrow-left" label="Back" variant="solid" onClick={() => c.tab('tonight')} />
      </div>
      <div className="rel">
        {i3('champagne', 88, 'head-ic bob')}
        {eyebrow(inv.by + ' asked you to vote' + (inv.deadline ? ' · closes ' + inv.deadline : ''))}
        {stop(inv.name.toLowerCase())}
      </div>
      <div className="col" style={{ gap: '12px' }} role="radiogroup" aria-label="Pick a night">
        {inv.opts.map((k) => (
          <InviteOptionCard key={k} id={k} picked={pick === k} onPick={() => setPick(k)} />
        ))}
      </div>
      <div className="bottom-stack" style={{ alignItems: 'stretch' }}>
        <Button
          variant="primary"
          size="lg"
          block
          icon="share"
          disabled={!pick}
          onClick={() => {
            var e = EVENTS[pick];
            Share.whatsapp(
              'My vote for ' + inv.name + ': ' + e.title + ' at ' + VENUES[e.venue].name + ' (' + e.date + ')'
            );
            c.toast('Vote ready to send');
          }}
        >
          {pick ? 'Send my vote to ' + inv.by : 'Pick a night to vote'}
        </Button>
        <Button variant="ghost" onClick={() => c.tab('tonight')}>
          See everything on this week
        </Button>
      </div>
      {note('No account needed to vote.')}
    </div>
  );
}

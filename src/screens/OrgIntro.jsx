import { AuthForm } from '../components/AuthForm';
import { OrgBack } from '../components/OrgBack';
import { Button } from '../design-system';
import { eyebrow, i3, stop, tile } from '../ui/helpers';

/* 1 · why list on gathr, then sign in */
export function OrgIntro(p) {
  var c = p.ctx,
    S = c.S,
    org = S.org;
  function next() {
    c.go(org.profile ? 'orghome' : 'orgsetup');
  }
  var perks = [
    [
      'pass',
      'Who’s coming, live',
      'Who booked, how many passes, who turned up. Check people in at the door from your phone.'
    ],
    ['ticket', 'Free or paid, your call', 'Free RSVP, paid passes or pay at the door. No listing fee.'],
    ['heart', 'Know who’s interested', 'Saves, views and your crowd’s age mix and sounds, before the night.'],
    ['sunglasses', 'Fewer fights at the door', 'Your stag, age and dress rules show before anyone books.']
  ];
  return (
    <div className="full col pad-top" style={{ gap: '28px', paddingTop: '52px', paddingBottom: '32px' }}>
      <OrgBack c={c} />
      <div className="rel">
        {i3('spotlight', 96, 'head-ic bob')}
        {eyebrow('For venues, promoters and collectives')}
        {stop('host on gathr')}
      </div>
      <div className="col" style={{ gap: '18px' }}>
        {perks.map((r) => (
          <div key={r[1]} className="rowc" style={{ gap: '14px', alignItems: 'flex-start' }}>
            {tile(r[0], 'violet', 48)}
            <div className="col" style={{ gap: '2px' }}>
              <span className="title15">{r[1]}</span>
              <span className="meta">{r[2]}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="bottom-stack" style={{ alignItems: 'stretch' }}>
        {S.signedIn ? (
          <Button variant="primary" size="lg" block iconRight="arrow-right" onClick={next}>
            {org.profile ? 'Open your dashboard' : 'Set up your organiser profile'}
          </Button>
        ) : (
          <div className="g-card card col" style={{ gap: '10px' }}>
            <span className="title15">Sign in to start listing</span>
            <AuthForm ctx={c} id="org" compact verifyLabel="Verify and continue" onDone={next} />
          </div>
        )}
        <p className="note" style={{ textAlign: 'center' }}>
          Listing is free. gathr checks every organiser and every night before it goes live.
        </p>
      </div>
    </div>
  );
}

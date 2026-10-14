import { useEffect, useRef, useState } from 'react';
import { PassCard } from '../cards/PassCard';
import { VENUES } from '../data/listings';
import { Button, IconButton, StoryCard } from '../design-system';
import { haptic } from '../lib/haptics';
import { ms } from '../lib/motion';
import { nightCard, shareNight } from '../lib/shareNight';
import { eyebrow, stop } from '../ui/helpers';

export function Pass(p) {
  var c = p.ctx,
    e = c.plan || c.ev,
    v = VENUES[e.venue];
  /* right after booking (interactions spec 7): the tick draws itself, the phone gives the success buzz, "You're in",
     then the pass rises into place and the lanyard pass drops onto it. It plays once: the booking's mark is cleared
     as the pass opens, so coming back to the pass (or a restart) just shows it */
  var fresh = useRef(!!c.S.celebrate),
    head = useRef(null);
  /* r25: right after booking, the StoryCard first ("who am I going with?"), then the pass ("how do I get in?") */
  const [story, setStory] = useState(fresh.current);
  useEffect(() => {
    if (!fresh.current) return;
    c.set({ celebrate: null });
    // focus goes to the result, so a screen reader says it straight away
    if (head.current) head.current.focus({ preventScroll: true });
    var t = setTimeout(() => haptic.success(), ms('--motion-fast') + ms('--motion-slower')); // as the tick finishes
    return () => clearTimeout(t);
  }, []);
  var line = e.rsvp ? "you're on the list" : "you're in",
    busy = c.S.busy === 'story';
  return (
    <div className={'full col pad-top' + (story ? ' celebrate' : '')} style={{ paddingTop: '52px' }}>
      <div className="rowc" style={{ justifyContent: 'flex-end' }}>
        <IconButton icon="x" label="Close" variant="solid" onClick={() => c.tab('plans')} />
      </div>
      {story ? null : eyebrow(e.date + ' · ' + v.name, { marginTop: '8px' })}
      <div
        ref={head}
        tabIndex={-1}
        className="rowc pass-head"
        style={{ gap: '12px', marginTop: '6px' }}
        aria-label={story ? (e.rsvp ? "Booked. You're on the list" : "Booked. You're in") : undefined}
      >
        <span className="ok-tick" aria-hidden>
          <svg
            viewBox="0 0 24 24"
            width={20}
            height={20}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12.5l4.5 4.5L19 7" />
          </svg>
        </span>
        {stop(line)}
      </div>
      {story ? (
        <>
          <StoryCard className="pass-story" {...nightCard(c.S, e)} />
          <div className="bottom-stack" style={{ alignItems: 'stretch' }}>
            <Button variant="primary" size="lg" block icon="ticket" onClick={() => setStory(false)}>
              Show pass
            </Button>
            <Button variant="ghost" icon="share" disabled={busy} onClick={() => shareNight(c, e)}>
              {busy ? 'Making your card…' : 'Share'}
            </Button>
          </div>
        </>
      ) : (
        <>
          <PassCard ctx={c} e={e} v={v} />
          <div className="bottom-stack" style={{ alignItems: 'stretch' }}>
            <Button variant="primary" size="lg" block icon="arrow-right" onClick={() => c.go('ready')}>
              Get ready for the night
            </Button>
            <Button variant="ghost" onClick={() => c.set({ sheet: 'cancel' })}>
              Cancel booking
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

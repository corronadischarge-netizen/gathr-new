import { useRef } from 'react';
import { useRevealOnce } from '../lib/motion';
import { CROWD, crowdLevel, cx, fmtNum } from './utils';

/* Booked so far: eyebrow, level word, 60-dot grid (1 dot = 1/60 of the cap, lit from the bottom), the count */
export function CrowdBlock(p) {
  // the lit dots light from the bottom once, the first time they're seen (dur-slow in all, at most 8 ms apart)
  var box = useRef(null);
  useRevealOnce(box, '.g-cb-dots .is-on', [{ opacity: 0 }, { opacity: 1 }], 8);
  var cap = p.cap,
    booked = p.booked || 0;
  var lv = crowdLevel(booked, cap) || (CROWD[p.level] ? p.level : 'quiet'),
    c = CROWD[lv];
  if (cap == null && p.booked != null) {
    // walk-in venues: no cap, so no level and no dots, just the count
    return (
      <div className="g-cb is-nocap" role="img" aria-label={'Booked so far: ' + fmtNum(booked) + ' booked tonight'}>
        <span className="g-cb-eyebrow" aria-hidden="true">
          {p.eyebrow || 'Booked so far'}
        </span>
        <b className="g-cb-word" aria-hidden="true">
          {fmtNum(booked)}
        </b>
        <span className="g-cb-line" aria-hidden="true">
          booked tonight
        </span>
      </div>
    );
  }
  var lit = cap ? Math.min(60, Math.round((booked / cap) * 60)) : c.n * 12;
  var dots = [];
  for (var i = 0; i < 60; i++) {
    var row = Math.floor(i / 10),
      idx = (5 - row) * 10 + (i % 10);
    dots.push(<i key={i} className={idx < lit ? 'is-on' : null} data-o={idx < lit ? idx : undefined} />);
  }
  // under 50 bookings the count hides and the level line shows
  var showCount = cap && booked >= (p.revealAt == null ? 50 : p.revealAt);
  return (
    <div
      ref={box}
      className={cx('g-cb', 'g-cm-' + lv, p.className)}
      role="img"
      aria-label={
        'Booked so far: ' + c.label + '. ' + (showCount ? booked + ' of ' + cap + ' spots booked' : c.line)
      }
    >
      <span className="g-cb-eyebrow" aria-hidden="true">
        {p.eyebrow || 'Booked so far'}
      </span>
      <b className="g-cb-word" aria-hidden="true">
        {c.label}
      </b>
      <span className="g-cb-dots" aria-hidden="true">
        {dots}
      </span>
      <span className="g-cb-line" aria-hidden="true">
        {showCount ? (
          <>
            <b>{fmtNum(booked) + ' of ' + fmtNum(cap)}</b> spots booked
          </>
        ) : (
          c.line
        )}
      </span>
    </div>
  );
}

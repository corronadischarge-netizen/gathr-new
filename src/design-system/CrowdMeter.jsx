import { useRef } from 'react';
import { useRevealOnce } from '../lib/motion';
import { CrowdBlock } from './CrowdBlock';
import { Icon } from './Icon';
import { CROWD, LEVELS, crowdLevel, cx, fmtNum } from './utils';

/* Booked so far. Give booked + cap and the level is worked out; level alone works when there's no bookings data.
   row (default): five bars, the word and the line. widget: the 60-dot card, with the trust line when `updated` is set */
export function CrowdMeter(p) {
  // the bars fill to the level once, left to right, the first time they're seen; then they stay put
  var box = useRef(null);
  useRevealOnce(box, '.g-cm-seg.is-on', [{ transform: 'scaleY(0)' }, { transform: 'none' }]);
  var lv = crowdLevel(p.booked, p.cap) || (CROWD[p.level] ? p.level : 'quiet'),
    c = CROWD[lv];
  if (p.variant === 'widget') {
    return (
      <div className={cx('g-cm-widget2', p.className)}>
        <CrowdBlock booked={p.booked} cap={p.cap} level={lv} eyebrow={p.eyebrow} revealAt={p.revealAt} />
        {p.updated ? <TrustLine cap={p.cap} updated={p.updated} /> : null}
      </div>
    );
  }
  if (p.cap == null && p.booked != null) {
    // walk-in venues: no cap, so no level and no bars, just the count
    return (
      <div className={cx('g-cm', 'g-crowd', p.glass && 'is-glass', p.className)}>
        <span className="g-cm-words">
          <b>{fmtNum(p.booked)}</b>
          <span>booked tonight</span>
        </span>
      </div>
    );
  }
  var line = p.line || c.line;
  return (
    <div
      ref={box}
      className={cx('g-cm', 'g-crowd', 'g-cm-' + lv, p.glass && 'is-glass', p.compact && 'is-compact', p.className)}
      role="img"
      aria-label={'Booked so far: ' + c.label + '. ' + line}
    >
      <span className="g-cm-cell" aria-hidden="true">
        {LEVELS.map((l, i) => (
          <span key={l} className={cx('g-cm-seg', i < c.n && 'is-on')} />
        ))}
      </span>
      <span className="g-cm-words" aria-hidden="true">
        <b>{c.label}</b>
        {p.compact ? null : <span>{line}</span>}
      </span>
    </div>
  );
}

/* "Based on bookings on gathr. Cap of 480 verified by gathr. Packed means 85% or more is booked. Updated 6:40 pm" */
export function TrustLine(p) {
  return (
    <p className={cx('g-cb-trust', p.className)}>
      <Icon name="info" size={16} />
      <span>
        Based on <b>bookings on gathr</b>
        {p.cap ? (
          <>
            {'. Cap of ' + fmtNum(p.cap) + ' '}
            <b>verified by gathr</b>
            {'. Packed means 85% or more is booked'}
          </>
        ) : null}
        {p.updated ? '. Updated ' + p.updated : null}
      </span>
    </p>
  );
}

import { useEffect, useRef, useState } from 'react';
import { VENUES } from '../data/listings';
import { Chip, Icon } from '../design-system';
import { haptic } from '../lib/haptics';
import { ms } from '../lib/motion';
import { saveReport } from '../services/guestReports';
import { meta, thumb } from '../ui/helpers';

/* The day after (interactions spec 6.12): one card, not a form. One question at a time; each answer saves on tap with a
   small tick and the tap haptic, then the card moves to the next question. After the last: "Thanks. That helps the
   next group", and the card closes itself after 1.5 s. The answers count toward the door's "From {n} guests" */
const REASONS = [
  ['age', 'Age'],
  ['stag', 'Stag entry'],
  ['dress', 'Dress code'],
  ['list', 'Guest list']
];
const STEPS = ['in', 'sound', 'crowd', 'thanks'];

export function DayAfterCard(p) {
  var c = p.ctx,
    e = p.e,
    v = VENUES[e.venue],
    saved = (c.S.dayAfter || {})[e.id] || {};
  const [step, setStep] = useState(saved.step || 'in');
  const [no, setNo] = useState(false); // "No, because…" shows the four reasons
  const [ticked, setTicked] = useState(null); // the answer that just saved, with its tick
  const [gone, setGone] = useState(false);
  var moving = useRef(false);
  function answer(key, value, extra) {
    if (moving.current) return;
    moving.current = true;
    haptic.tap();
    setTicked(key + ':' + value);
    var next = STEPS[STEPS.indexOf(step) + 1],
      a = Object.assign({ [key]: value }, extra);
    saveReport(e.id, a);
    c.set((o) => ({ dayAfter: Object.assign({}, o.dayAfter, { [e.id]: Object.assign({}, saved, a, { step: next }) }) }));
    // the tick shows for a moment, then the next question slides in
    setTimeout(() => {
      moving.current = false;
      setTicked(null);
      setNo(false);
      setStep(next);
    }, ms('--motion-slow'));
  }
  function skip() {
    var next = STEPS[STEPS.indexOf(step) + 1];
    c.set((o) => ({ dayAfter: Object.assign({}, o.dayAfter, { [e.id]: Object.assign({}, saved, { step: next }) }) }));
    setStep(next);
  }
  // thanks, then the card closes itself after 1.5 s
  useEffect(() => {
    if (step !== 'thanks') return;
    var t = setTimeout(() => {
      setGone(true);
      setTimeout(() => c.set((o) => ({ dayAfter: Object.assign({}, o.dayAfter, { [e.id]: Object.assign({}, (o.dayAfter || {})[e.id], { done: true }) }) })), ms('--motion-normal'));
    }, 1500);
    return () => clearTimeout(t);
  }, [step]);
  if (saved.done) return null;

  function pick(key, value, label, extra) {
    var on = ticked === key + ':' + value;
    return (
      <Chip key={value} selected={on} onClick={() => answer(key, value, extra)}>
        {on ? (
          <span className="da-pick">
            <span className="da-tick" aria-hidden="true">
              <Icon name="check" size={16} />
            </span>
            {label}
          </span>
        ) : (
          label
        )}
      </Chip>
    );
  }

  return (
    <section className={'rel g-card card col da-card' + (gone ? ' is-gone' : '')} aria-label={'How was ' + e.title} aria-live="polite">
      <div className="rowc" style={{ gap: '12px' }}>
        {thumb(e, 48)}
        <div className="col">
          <span className="title15">{'How was ' + e.title + '?'}</span>
          {meta(v.name + ' · ' + e.date)}
        </div>
      </div>
      <div key={step} className={'col da-step' + (step !== 'in' ? ' w-next' : '')}>
        {step === 'in' ? (
          <>
            <span className="title15">Did they let your group in?</span>
            <div className="wrap">
              {pick('in', 'yes', 'Yes')}
              <Chip selected={no} aria-expanded={no} onClick={() => setNo(!no)}>
                No, because…
              </Chip>
            </div>
            {no ? (
              <div className="wrap fade-up" role="group" aria-label="Why not">
                {REASONS.map((r) => pick('why', r[0], r[1], { in: 'no' }))}
              </div>
            ) : null}
          </>
        ) : step === 'sound' ? (
          <>
            <span className="title15">Sound</span>
            <div className="wrap">
              {pick('sound', 'great', 'Great')}
              {pick('sound', 'fine', 'Fine')}
              {pick('sound', 'bad', 'Bad')}
            </div>
            <button type="button" className="link-btn da-skip" onClick={skip}>
              Skip
            </button>
          </>
        ) : step === 'crowd' ? (
          <>
            <span className="title15">Crowd</span>
            <div className="wrap">
              {pick('crowd', 'chill', 'Chill')}
              {pick('crowd', 'packed', 'Packed')}
            </div>
            <button type="button" className="link-btn da-skip" onClick={skip}>
              Skip
            </button>
          </>
        ) : (
          <span className="title15 da-thanks">Thanks. That helps the next group</span>
        )}
      </div>
    </section>
  );
}

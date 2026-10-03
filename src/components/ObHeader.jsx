import { Button, IconButton } from '../design-system';

/* Onboarding: one question per screen, progress on top, value first */
const OB = ['vibe', 'areas', 'age', 'phone'];

export function ObHeader(p) {
  var c = p.c,
    i = OB.indexOf(p.step);
  return (
    <div className="ob-head">
      <IconButton icon="arrow-left" label="Back" variant="solid" onClick={c.back} />
      <div
        className="ob-steps"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={OB.length}
        aria-valuenow={i + 1}
        aria-label={'Step ' + (i + 1) + ' of ' + OB.length}
      >
        {OB.map((s, k) => (
          <i key={s} className={k < i ? 'done' : k === i ? 'now' : ''} />
        ))}
      </div>
      {p.skip ? (
        <Button variant="ghost" size="sm" onClick={p.skip}>
          Skip
        </Button>
      ) : (
        <span style={{ width: '48px' }} />
      )}
    </div>
  );
}

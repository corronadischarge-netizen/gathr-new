import { AgeRulesCard } from '../cards/AgeRulesCard';
import { ObHeader } from '../components/ObHeader';
import { Button, Chip } from '../design-system';
import { i3 } from '../ui/helpers';

export function Age(p) {
  var c = p.ctx,
    S = c.S;
  return (
    <div className="full col pad-top" style={{ gap: '28px' }}>
      <ObHeader c={c} step="age" />
      <div className="rel">
        {i3('pass', 88, 'head-ic bob')}
        <h1 className="g-display disp">How old are you?</h1>
        <p className="body muted" style={{ marginTop: '10px' }}>
          Every door in Pune checks ID, so we only show nights that will let you in.
        </p>
      </div>
      <div className="col age-list" style={{ gap: '8px' }} role="radiogroup" aria-label="Age">
        {['18 to 20', '21 to 24', '25 or older'].map((a) => (
          <Chip
            key={a}
            role="radio"
            aria-checked={S.age === a}
            selected={S.age === a}
            onClick={() => c.set({ age: a })}
          >
            {a}
          </Chip>
        ))}
      </div>
      {/* keyed by age so the card fades in again when the answer changes */}
      {S.age ? <AgeRulesCard key={S.age} age={S.age} /> : null}
      <div className="bottom-stack">
        <Button variant="primary" size="lg" block disabled={!S.age} onClick={() => c.go('phone')}>
          Continue
        </Button>
      </div>
    </div>
  );
}

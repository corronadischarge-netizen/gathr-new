import { Button } from '../design-system';
import { meta } from '../ui/helpers';

/* Sign-in screen: shown instead of the form when you're already signed in */
export function SignedInCard(p) {
  return (
    <div className="g-card card col" style={{ gap: '10px' }}>
      <span className="title15">You’re signed in</span>
      {meta(p.email || '')}
      <Button variant="primary" block onClick={p.onContinue}>
        Go to this week
      </Button>
    </div>
  );
}

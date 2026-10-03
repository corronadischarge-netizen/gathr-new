import { SignedInCard } from '../cards/SignedInCard';
import { AuthForm } from '../components/AuthForm';
import { Button, IconButton } from '../design-system';
import { i3 } from '../ui/helpers';

export function Phone(p) {
  var c = p.ctx,
    S = c.S,
    login = !!S.login;
  function finish() {
    c.set({ stack: ['tonight'], sheet: null, dir: 'tab', seen: true });
    c.toast(
      login
        ? 'Welcome back' + (S.me.name ? ', ' + S.me.name.split(' ')[0] : '')
        : "You're in. Here's your week"
    );
  }
  return (
    <div className="full col pad-top" style={{ gap: '28px' }}>
      <div>
        <IconButton icon="arrow-left" label="Back" variant="solid" onClick={c.back} />
      </div>
      <div className="rel">
        {i3('phone', 88, 'head-ic bob')}
        <h1 className="g-display disp">{login ? 'Welcome back' : 'Save your plans'}</h1>
        <p className="body muted" style={{ marginTop: '10px' }}>
          {login
            ? 'Log in with Google or the email you booked with.'
            : 'Sign in to keep your passes and plans on every phone. We never share your email.'}
        </p>
      </div>
      {S.signedIn ? (
        <SignedInCard email={S.email} onContinue={finish} />
      ) : (
        <AuthForm ctx={c} id="si" verifyLabel={login ? 'Log in' : 'Verify and finish'} onDone={finish} />
      )}
      {!login && !S.signedIn ? (
        <div className="bottom-stack">
          <Button variant="ghost" onClick={() => c.tab('tonight')}>
            Not now
          </Button>
        </div>
      ) : null}
    </div>
  );
}

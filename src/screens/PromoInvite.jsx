import { useEffect, useState } from 'react';
import { AuthForm } from '../components/AuthForm';
import { Button, IconButton } from '../design-system';
import { haptic } from '../lib/haptics';
import { cleanCode } from '../lib/promoterInvite';
import { acceptPromoterInvite, myPromoterLists, promoterInvitePreview, remoteOn, sayError } from '../services/remote';
import { eyebrow, i3, meta, note, stop, svgIcon } from '../ui/helpers';
import { whenTxt } from './Promoting';

/* A promoter invite. The code arrives in a link or a message from a host: see the night first, sign in, accept,
   and the guest list for that night is yours. Opened from the link (#pi=CODE) or You › Promoter invite. */
export function PromoInvite(p) {
  var c = p.ctx,
    S = c.S,
    code = S.piCode;
  const [typed, setTyped] = useState('');
  const [inv, setInv] = useState(null); // the invite's preview once looked up
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState(S.me.name || '');
  var newPromoter = !(S.promoting || []).length; // first list: they choose the name guests and hosts see
  useEffect(() => {
    setInv(null);
    setErr(null);
    if (!code) return;
    if (!remoteOn) {
      setErr('Promoter invites need gathr to be online.');
      return;
    }
    promoterInvitePreview(code).then(setInv, (e) => setErr(sayError(e)));
  }, [code]);
  function find() {
    var x = cleanCode(typed);
    if (!/^[A-Z]{3}-[A-Z0-9]{6}$/.test(x)) {
      setErr('Codes look like KUK-7Q4M2X. Check it with whoever sent it.');
      return;
    }
    c.set({ piCode: x });
  }
  function accept() {
    if (busy) return;
    setBusy(true);
    setErr(null);
    acceptPromoterInvite(code, name.trim())
      .then(() => myPromoterLists().catch(() => S.promoting || []))
      .then(
        (l) => {
          haptic.success();
          c.set({ promoting: l, piCode: null, mode: 'guest', stack: ['you', 'promoting'], dir: 'fwd' });
          c.toast('You’re promoting ' + inv.title);
        },
        (e) => {
          setBusy(false);
          haptic.error();
          setErr(sayError(e));
        }
      );
  }
  var back = (
    <div className="rowc between">
      <IconButton
        icon="arrow-left"
        label="Back"
        variant="solid"
        onClick={() => (S.stack.length > 1 && S.stack[0] !== 'tonight' ? c.back() : c.tab('tonight'))}
      />
    </div>
  );
  var gap = { gap: 'var(--space-6)', paddingTop: '52px', paddingBottom: '48px' };

  /* no code yet: type the one from the message */
  if (!code)
    return (
      <div className="full col pad-top" style={gap}>
        {back}
        <div className="rel">
          {i3('wristband', 88, 'head-ic bob')}
          {eyebrow('Promoter invite')}
          {stop('enter your code')}
        </div>
        {meta('A host sends it on WhatsApp or anywhere. It looks like KUK‑7Q4M2X.')}
        <div className="col" style={{ gap: 'var(--space-2)' }}>
          <div className="field-row">
            <input
              aria-label="Invite code"
              placeholder="KUK-7Q4M2X"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              maxLength={200}
              value={typed}
              onChange={(ev) => {
                setTyped(ev.target.value);
                setErr(null);
              }}
              onKeyDown={(ev) => ev.key === 'Enter' && find()}
            />
          </div>
          {err ? (
            <span className="meta err-txt" role="alert">
              {err}
            </span>
          ) : null}
        </div>
        <Button variant="primary" size="lg" block disabled={!typed.trim()} onClick={find}>
          Find my invite
        </Button>
      </div>
    );

  /* looking it up, or it can't be used */
  if (!inv || inv.state !== 'open') {
    var why = err
      ? err
      : !inv
        ? null
        : inv.state === 'ended'
          ? 'This night has ended, so the invite has too.'
          : inv.state === 'taken'
            ? 'Someone has already accepted this invite. Ask ' + (inv.host || 'the host') + ' for a new one.'
            : 'This invite has been used or withdrawn. Ask whoever sent it for a new one.';
    return (
      <div className="full col pad-top" style={gap}>
        {back}
        <div className="rel">
          {i3('wristband', 88, 'head-ic bob')}
          {eyebrow('Promoter invite · ' + code)}
          {stop(why ? 'can’t open it' : 'one sec')}
        </div>
        {why ? (
          <>
            <p className="body" style={{ margin: 0 }} role="alert">
              {why}
            </p>
            <div className="col" style={{ gap: 'var(--space-2)' }}>
              <Button variant="subtle" block onClick={() => c.set({ piCode: null })}>
                Enter a different code
              </Button>
              <Button variant="ghost" onClick={() => c.tab('tonight')}>
                See what’s on this week
              </Button>
            </div>
          </>
        ) : (
          meta('Finding your invite…')
        )}
      </div>
    );
  }

  /* the invite: who, what, when, what's in it for them; then sign in and accept */
  var perks = [
    inv.cap ? 'Your own guest list for up to ' + inv.cap + ' people' : 'Your own guest list for this night',
    'Add people by name, phone or email. They get in free.',
    inv.host + ' sees who you add and who comes.'
  ];
  return (
    <div className="full col pad-top" style={gap}>
      {back}
      <div className="col" style={{ gap: 'var(--space-2)' }}>
        {eyebrow('Promoter invite')}
        <h1 className="g-display disp" style={{ fontSize: '28px', lineHeight: '32px', margin: 0 }}>
          {inv.host + ' invited you to promote ' + inv.title}
        </h1>
        {meta(whenTxt(inv.startsAt) + ' · ' + inv.venue + (inv.area ? ', ' + inv.area.split(',')[0] : ''))}
      </div>
      <div className="g-card card col" style={{ gap: 'var(--space-3)', padding: 'var(--space-4) var(--space-5)' }}>
        {perks.map((t) => (
          <div key={t} className="rowc" style={{ gap: 'var(--space-3)', alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--go-text)', flex: 'none', paddingTop: '1px' }}>{svgIcon(['M20 6 9 17l-5-5'], 18)}</span>
            <span className="body" style={{ margin: 0 }}>
              {t}
            </span>
          </div>
        ))}
      </div>
      {!S.signedIn ? (
        <div className="col" style={{ gap: 'var(--space-2)' }}>
          <span className="title16">Sign in to accept</span>
          {meta('Any email works. The list goes to whoever accepts first.')}
          <AuthForm ctx={c} id="pi" compact emailLabel="Your email" resume={{ pi: code }} />
        </div>
      ) : (
        <div className="col" style={{ gap: 'var(--space-3)' }}>
          {newPromoter ? (
            <div className="col" style={{ gap: 'var(--space-2)' }}>
              <label className="meta" htmlFor="pi-name">
                {'Your name, as guests and ' + inv.host + ' will see it'}
              </label>
              <div className="field-row">
                <input
                  id="pi-name"
                  placeholder="e.g. Riya Kapoor"
                  maxLength={30}
                  value={name}
                  onChange={(ev) => setName(ev.target.value)}
                />
              </div>
            </div>
          ) : null}
          {err ? (
            <span className="meta err-txt" role="alert">
              {err}
            </span>
          ) : null}
          <Button
            variant="primary"
            size="lg"
            block
            disabled={busy || (newPromoter && name.trim().length < 2)}
            onClick={accept}
          >
            {busy ? 'Setting up your list…' : 'Accept and set up my list'}
          </Button>
          <Button variant="ghost" onClick={() => c.tab('tonight')}>
            Not now
          </Button>
        </div>
      )}
      {note('Only the first person to accept gets this list.')}
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Button } from '../design-system';
import { haptic } from '../lib/haptics';
import { useMachine } from '../lib/machine';
import { replay } from '../lib/motion';
import { okEmail, store } from '../lib/utils';
import { Auth } from '../services/auth';

/* Sign-in steps. Typing (EDIT) is only accepted while a field is open, and nothing can be sent twice. */
const FLOW = {
  email: { EDIT: 'email', SEND: 'sending' },
  sending: { SENT: 'code', FAIL: 'email' },
  code: { EDIT: 'code', VERIFY: 'verifying', RESEND: 'resending', CHANGE_EMAIL: 'email' },
  resending: { SENT: 'code', FAIL: 'code' },
  verifying: { OK: 'done', WRONG: 'code' },
  done: {}
};

/* Sign-in form: email code (Supabase, free) or Google. Used on the sign-in screen and inside the booking sheet. */
export function AuthForm(p) {
  var c = p.ctx,
    S = c.S;
  var m = useMachine(FLOW, 'email', { email: S.email || '', code: '', err: null, demo: null }),
    F = m.data,
    step = m.state === 'email' || m.state === 'sending' ? 'email' : 'code',
    busy = m.state === 'sending' || m.state === 'resending' || m.state === 'verifying';
  var codeRow = useRef(null),
    codeIn = useRef(null);
  const [wait, setWait] = useState(0); // seconds until "Resend code" works again (a timer, not a step)
  useEffect(() => {
    if (!wait) return;
    var t = setTimeout(() => {
      setWait(wait - 1);
    }, 1000);
    return () => {
      clearTimeout(t);
    };
  }, [wait]);
  var okE = okEmail(F.email),
    okC = /^\d{6,8}$/.test(F.code.trim());
  function send() {
    var resend = m.state === 'code';
    if (!okE || !m.send(resend ? 'RESEND' : 'SEND', { err: null })) return;
    Auth.sendCode(F.email.trim().toLowerCase()).then(
      (r) => {
        m.send('SENT', { code: '', demo: r.demoCode || null });
        setWait(30);
        c.toast(r.demoCode ? 'Demo mode: your code is on screen' : 'Code sent to ' + F.email.trim());
      },
      (e) => {
        m.send('FAIL', { err: e.message });
        haptic.error();
      }
    );
  }
  function verify(code) {
    code = (code || F.code).trim();
    if (!/^\d{6,8}$/.test(code) || !m.send('VERIFY', { err: null })) return;
    Auth.verify(F.email.trim().toLowerCase(), code).then(
      (u) => {
        m.send('OK');
        c.set((o) => ({
          signedIn: true,
          email: u.email,
          me: Object.assign({}, o.me, {
            name: o.me.name || u.name || '',
            photo: o.me.photo || u.photo || null
          })
        }));
        p.onDone && p.onDone(u);
      },
      (e) => {
        // wrong code: shake, clear the box, keep the cursor in it, buzz
        m.send('WRONG', { err: e.message, code: '' });
        replay(codeRow.current, 'shake');
        haptic.error();
        if (codeIn.current) codeIn.current.focus({ preventScroll: true });
      }
    );
  }
  function typeCode(v) {
    var code = v.replace(/\D/g, '').slice(0, 8);
    if (!m.send('EDIT', { code: code, err: null })) return;
    if (code.length === Auth.codeLength) verify(code); // the last digit is in (typed or pasted): check it straight away
  }
  function google() {
    m.send('EDIT', { err: null });
    if (p.resume) store('gathr.resume', p.resume);
    Auth.google().catch((e) => {
      store('gathr.resume', null);
      m.send('EDIT', { err: e.message });
    });
  }
  var btnSize = p.compact ? 'md' : 'lg';
  return (
    <div className="col" style={{ gap: '14px' }}>
      {step === 'email' ? (
        <div className="col" style={{ gap: '14px' }}>
          <button
            type="button"
            className={'g-btn g-btn-subtle g-btn-' + btnSize + ' g-btn-block google-btn'}
            onClick={google}
          >
            <svg width={18} height={18} viewBox="0 0 48 48" aria-hidden>
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
          <div className="or-row" aria-hidden>
            <i />
            <span>or use your email</span>
            <i />
          </div>
          <div className="col" style={{ gap: '8px' }}>
            <label className="meta" htmlFor={p.id + '-email'}>
              {p.emailLabel || 'Email'}
            </label>
            <div className={'field-row' + (F.err ? ' has-err' : '')}>
              <input
                id={p.id + '-email'}
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="you@example.com"
                value={F.email}
                aria-invalid={!!F.err}
                aria-describedby={p.id + '-msg'}
                onChange={(e) => m.send('EDIT', { email: e.target.value, err: null })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') send();
                }}
              />
            </div>
            {F.email && !okE && !F.err ? (
              <span id={p.id + '-msg'} className="meta err-txt">
                Enter an email like name@gmail.com
              </span>
            ) : null}
          </div>
          <Button variant="primary" size={btnSize} block disabled={!okE || busy} onClick={send}>
            {busy ? 'Sending…' : 'Send me a code'}
          </Button>
        </div>
      ) : (
        <div className="col fade-up" style={{ gap: '10px' }}>
          {F.demo ? (
            <div className="demo-box" role="note">
              <b>Demo mode · no email sent</b>
              <span>{'Your code is '}</span>
              <span className="demo-code">{F.demo}</span>
            </div>
          ) : null}
          <label className="meta" htmlFor={p.id + '-code'}>
            {'Code sent to ' + F.email.trim()}
          </label>
          <div ref={codeRow}>
            {/* shakes on a wrong code; React never rewrites its class */}
            <div className={'field-row' + (F.err ? ' has-err' : '')}>
              <input
                ref={codeIn}
                id={p.id + '-code'}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="6-digit code"
                value={F.code}
                maxLength={12}
                autoFocus
                readOnly={m.state === 'verifying'}
                aria-invalid={!!F.err}
                aria-describedby={p.id + '-msg'}
                onChange={(e) => typeCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') verify();
                }}
              />
            </div>
          </div>
          <div className="rowc between">
            <button
              type="button"
              className="link-btn"
              style={{ color: 'var(--ink-muted)' }}
              onClick={() => m.send('CHANGE_EMAIL', { code: '', err: null, demo: null })}
            >
              Change email
            </button>
            <button
              type="button"
              className="link-btn"
              style={{ color: wait ? 'var(--ink-faint)' : 'var(--ink)' }}
              disabled={!!wait || busy}
              onClick={send}
            >
              {wait ? 'Resend in ' + wait + 's' : 'Resend code'}
            </button>
          </div>
          <Button
            variant="primary"
            size={btnSize}
            block
            icon={p.payIcon ? 'ticket' : null}
            disabled={!okC || busy}
            onClick={() => verify()}
          >
            {m.state === 'verifying' ? 'Checking…' : p.verifyLabel || 'Verify'}
          </Button>
        </div>
      )}
      {F.err ? (
        <p id={p.id + '-msg'} className="meta err-txt" role="alert" style={{ margin: 0 }}>
          {F.err}
        </p>
      ) : null}
      {!Auth.live && step === 'email' ? (
        <p className="note" style={{ textAlign: 'center' }}>
          Demo mode: codes show on screen until email sign-in is connected.
        </p>
      ) : null}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Button } from '../design-system';
import { okEmail, store } from '../lib/utils';
import { Auth } from '../services/auth';

/* Sign-in form: email code (Supabase, free) or Google. Used on the sign-in screen and inside the booking sheet. */
export function AuthForm(p) {
  var c = p.ctx,
    S = c.S;
  const [F, setF] = useState({
    email: S.email || '',
    code: '',
    step: 'email',
    err: null,
    busy: false,
    demo: null,
    wait: 0
  });
  function upd(x) {
    setF((o) => Object.assign({}, o, x));
  }
  useEffect(() => {
    if (!F.wait) return;
    var t = setTimeout(() => {
      upd({ wait: F.wait - 1 });
    }, 1000);
    return () => {
      clearTimeout(t);
    };
  }, [F.wait]);
  var okE = okEmail(F.email),
    okC = /^\d{6,8}$/.test(F.code.trim());
  function send() {
    if (!okE || F.busy) return;
    upd({ busy: true, err: null });
    Auth.sendCode(F.email.trim().toLowerCase()).then(
      (r) => {
        upd({ busy: false, step: 'code', code: '', demo: r.demoCode || null, wait: 30 });
        c.toast(r.demoCode ? 'Demo mode: your code is on screen' : 'Code sent to ' + F.email.trim());
      },
      (e) => {
        upd({ busy: false, err: e.message });
      }
    );
  }
  function verify() {
    if (!okC || F.busy) return;
    upd({ busy: true, err: null });
    Auth.verify(F.email.trim().toLowerCase(), F.code.trim()).then(
      (u) => {
        upd({ busy: false });
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
        upd({ busy: false, err: e.message, code: '' });
      }
    );
  }
  function google() {
    upd({ err: null });
    if (p.resume) store('gathr.resume', p.resume);
    Auth.google().catch((e) => {
      store('gathr.resume', null);
      upd({ err: e.message });
    });
  }
  var btnSize = p.compact ? 'md' : 'lg';
  return (
    <div className="col" style={{ gap: '14px' }}>
      {F.step === 'email' ? (
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
                onChange={(e) => upd({ email: e.target.value, err: null })}
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
          <Button variant="primary" size={btnSize} block disabled={!okE || F.busy} onClick={send}>
            {F.busy ? 'Sending…' : 'Send me a code'}
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
          <div className={'field-row' + (F.err ? ' has-err' : '')}>
            <input
              id={p.id + '-code'}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="6-digit code"
              value={F.code}
              maxLength={8}
              autoFocus
              aria-invalid={!!F.err}
              aria-describedby={p.id + '-msg'}
              onChange={(e) => upd({ code: e.target.value.replace(/\D/g, ''), err: null })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') verify();
              }}
            />
          </div>
          <div className="rowc between">
            <button
              type="button"
              className="link-btn"
              style={{ color: 'var(--ink-muted)' }}
              onClick={() => upd({ step: 'email', code: '', err: null, demo: null })}
            >
              Change email
            </button>
            <button
              type="button"
              className="link-btn"
              style={{ color: F.wait ? 'var(--ink-faint)' : 'var(--ink)' }}
              disabled={!!F.wait || F.busy}
              onClick={send}
            >
              {F.wait ? 'Resend in ' + F.wait + 's' : 'Resend code'}
            </button>
          </div>
          <Button
            variant="primary"
            size={btnSize}
            block
            icon={p.payIcon ? 'ticket' : null}
            disabled={!okC || F.busy}
            onClick={verify}
          >
            {F.busy ? 'Checking…' : p.verifyLabel || 'Verify'}
          </Button>
        </div>
      )}
      {F.err ? (
        <p id={p.id + '-msg'} className="meta err-txt" role="alert" style={{ margin: 0 }}>
          {F.err}
        </p>
      ) : null}
      {!Auth.live && F.step === 'email' ? (
        <p className="note" style={{ textAlign: 'center' }}>
          Demo mode: codes show on screen until email sign-in is connected.
        </p>
      ) : null}
    </div>
  );
}

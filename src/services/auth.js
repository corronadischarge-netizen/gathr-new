import { APP_URL, CFG } from '../config';
import { loadScript } from '../lib/utils';

/* Sign-in: Supabase email code + Google (free). Demo mode shows the code on screen. */
export const Auth = (() => {
  var live = !!(CFG.supabase && CFG.supabase.url && CFG.supabase.anonKey),
    client = null,
    demo = null;
  function sb() {
    if (client) return Promise.resolve(client);
    return loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js').then(
      () => {
        client = window.supabase.createClient(CFG.supabase.url, CFG.supabase.anonKey, {
          auth: { persistSession: true, detectSessionInUrl: true, flowType: 'implicit' }
        });
        return client;
      }
    );
  }
  function friendly(err) {
    var m = (err && (err.message || err.error_description)) || '';
    if (/rate|too many|seconds/i.test(m)) return 'Too many codes asked for. Wait a minute, then try again.';
    if (/expired|invalid|token/i.test(m))
      return 'That code doesn’t match or has expired. Check it, or send a new one.';
    if (/network|fetch|load/i.test(m)) return 'No connection. Check your internet and try again.';
    return m || 'Something went wrong. Try again.';
  }
  function userOf(u) {
    if (!u) return null;
    var md = u.user_metadata || {};
    return {
      id: u.id,
      email: u.email || '',
      name: md.full_name || md.name || '',
      photo: md.avatar_url || md.picture || null
    };
  }
  return {
    live: live,
    sendCode: (email) => {
      if (!live) {
        demo = {
          email: email,
          code: String(Math.floor(100000 + Math.random() * 900000)),
          exp: Date.now() + 600000,
          tries: 0
        };
        return Promise.resolve({ demoCode: demo.code });
      }
      return sb()
        .then((c) =>
          c.auth.signInWithOtp({
            email: email,
            options: { shouldCreateUser: true, emailRedirectTo: APP_URL }
          })
        )
        .then(
          (r) => {
            if (r.error) throw new Error(friendly(r.error));
            return {};
          },
          (e) => {
            throw new Error(friendly(e));
          }
        );
    },
    verify: (email, code) => {
      if (!live) {
        if (!demo || demo.email !== email) return Promise.reject(new Error('Send a code first.'));
        if (Date.now() > demo.exp) return Promise.reject(new Error('That code has expired. Send a new one.'));
        if (++demo.tries > 5) return Promise.reject(new Error('Too many tries. Send a new code.'));
        if (code !== demo.code)
          return Promise.reject(new Error('That code doesn’t match. Check it and try again.'));
        demo = null;
        return Promise.resolve({ id: 'demo', email: email, name: '', photo: null });
      }
      return sb()
        .then((c) => c.auth.verifyOtp({ email: email, token: code, type: 'email' }))
        .then(
          (r) => {
            if (r.error) throw new Error(friendly(r.error));
            return userOf(r.data && r.data.user);
          },
          (e) => {
            throw new Error(friendly(e));
          }
        );
    },
    google: () => {
      if (!live)
        return Promise.reject(
          new Error('Google sign-in switches on once Supabase is connected. Use your email for now.')
        );
      return sb()
        .then((c) => c.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: APP_URL } }))
        .then((r) => {
          if (r.error) throw new Error(friendly(r.error));
        });
    },
    session: () => {
      if (!live) return Promise.resolve(null);
      return sb()
        .then((c) => c.auth.getSession())
        .then(
          (r) => userOf(r.data && r.data.session && r.data.session.user),
          () => null
        );
    },
    signOut: () => {
      if (!live) return Promise.resolve();
      return sb()
        .then((c) => c.auth.signOut())
        .catch(() => {});
    }
  };
})();

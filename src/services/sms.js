import { CFG } from '../config';
import { loadScript } from '../lib/utils';

/* Phone SMS code: paid, so OFF. Firebase connector is ready for when billing is on. */
export const Sms = (() => {
  var on = CFG.sms && CFG.sms.provider === 'firebase' && CFG.sms.firebase,
    conf = null;
  function fb() {
    var v = 'https://www.gstatic.com/firebasejs/10.12.2/';
    return loadScript(v + 'firebase-app-compat.js')
      .then(() => loadScript(v + 'firebase-auth-compat.js'))
      .then(() => {
        if (!window.firebase.apps.length) window.firebase.initializeApp(CFG.sms.firebase);
        return window.firebase.auth();
      });
  }
  return {
    on: !!on,
    send: (phone10) => {
      if (!on) return Promise.reject(new Error('SMS codes are switched off.'));
      return fb()
        .then((auth) => {
          var holder =
            document.getElementById('recaptcha-slot') ||
            document.body.appendChild(Object.assign(document.createElement('div'), { id: 'recaptcha-slot' }));
          var rv = new window.firebase.auth.RecaptchaVerifier(holder, { size: 'invisible' });
          return auth.signInWithPhoneNumber('+91' + phone10, rv);
        })
        .then((c) => {
          conf = c;
        });
    },
    verify: (code) => {
      if (!conf) return Promise.reject(new Error('Send a code first.'));
      return conf.confirm(code).then(() => {
        conf = null;
        return true;
      });
    }
  };
})();

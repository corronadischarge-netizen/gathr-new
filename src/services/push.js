import { remoteOn, saveDevice } from './remote';

/* App notifications on the phone (step 6). In the installed Android app, once someone is signed in, this asks
   permission to send notifications, saves the phone's push address to their account, and opens the right place
   when a notification is tapped. The browser and demo mode skip it; Updates still shows everything. */
var started = false;
// set by the build when it includes Firebase's settings (firebase/google-services.json): without them, Android
// would crash on registering, so notifications stay off
const BUILT_WITH_FIREBASE = import.meta.env.VITE_PUSH === '1';

function nativePlatform() {
  var C = window.Capacitor;
  return C && C.isNativePlatform && C.isNativePlatform() ? C.getPlatform() : null;
}

export function pushAvailable() {
  return remoteOn && BUILT_WITH_FIREBASE && !!nativePlatform();
}

/* where a notification should take you: kept in state so it can wait for the nights to load */
export function openFrom(c, data) {
  if (!data || !data.kind) return;
  c.set({ pendingOpen: data, notifSeen: true });
}

export function startPush(c) {
  var platform = nativePlatform();
  if (!remoteOn || !BUILT_WITH_FIREBASE || !platform || started) return;
  started = true;
  import('@capacitor/push-notifications')
    .then((m) => {
      var P = m.PushNotifications;
      P.addListener('registration', (t) => {
        saveDevice(t.value, platform === 'ios' ? 'ios' : 'android').catch(() => {});
      });
      P.addListener('pushNotificationReceived', (n) => {
        // the app is open: a short toast, and Updates refreshes
        c.toast(n.title || 'New update');
        c.set({ inboxAt: Date.now(), notifSeen: false });
      });
      P.addListener('pushNotificationActionPerformed', (a) => {
        openFrom(c, a.notification && a.notification.data);
      });
      return P.checkPermissions()
        .then((p) =>
          p.receive === 'prompt' || p.receive === 'prompt-with-rationale' ? P.requestPermissions() : p
        )
        .then((p) => {
          if (p.receive === 'granted') return P.register();
        });
    })
    .catch(() => {
      started = false;
    });
}

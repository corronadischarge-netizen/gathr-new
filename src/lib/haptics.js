/* Haptics: the app's whole vocabulary, four feels (interactions spec 2.2), used the same way everywhere.
   - tap: selecting a chip, a tab, a vote, a stepper step
   - success: booking done, on the list, scan "in"
   - warning: scan "check", a limit hit (max passes)
   - error: wrong code, payment failed, scan "no entry"
   Never on scroll or on every tile tap. In the installed app it uses the phone's own haptics (Capacitor Haptics),
   which follow the phone's settings; in a browser it falls back to a short vibration (Android), or nothing.
   Haptics aren't motion, so they stay on with reduced motion. Never throws. */
import { Capacitor } from '@capacitor/core';

var native = null;
function plugin() {
  if (native === null)
    native =
      Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform()
        ? import('@capacitor/haptics').catch(() => false)
        : Promise.resolve(false);
  return native;
}

function buzz(pattern) {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') navigator.vibrate(pattern);
  } catch (e) {}
}

function feel(nativeCall, pattern) {
  plugin()
    .then((m) => (m ? nativeCall(m) : buzz(pattern)))
    .catch(() => buzz(pattern));
}

export const haptic = {
  tap: () => feel((m) => m.Haptics.impact({ style: m.ImpactStyle.Light }), 10),
  success: () => feel((m) => m.Haptics.notification({ type: m.NotificationType.Success }), [15, 40, 15]),
  warning: () => feel((m) => m.Haptics.notification({ type: m.NotificationType.Warning }), 80),
  error: () => feel((m) => m.Haptics.notification({ type: m.NotificationType.Error }), [40, 30, 40])
};
// the older name for tap, kept so nothing breaks
haptic.select = haptic.tap;

/* Any tap on a selectable control (chips, tabs, switches, radio options, steppers) gives the light "tap",
   so each component doesn't have to remember to do it. */
const SELECTABLE =
  '[aria-pressed], [role="switch"], [role="radio"], [role="tab"], .mood, .vibe-tile, .loc-btn, .vpin-wrap, .g-tab';
export function listenForSelections(root) {
  root.addEventListener('click', (ev) => {
    var el = ev.target && ev.target.closest && ev.target.closest(SELECTABLE);
    if (el && !el.disabled && el.getAttribute('aria-disabled') !== 'true') haptic.tap();
  });
}

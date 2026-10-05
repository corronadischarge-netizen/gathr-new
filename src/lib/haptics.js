/* Haptics: short vibrations that confirm what just happened. Android phones support navigator.vibrate;
   where it's missing (iPhone, desktop) these do nothing and never throw. */
function buzz(pattern) {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function')
      navigator.vibrate(pattern);
  } catch (e) {}
}

export const haptic = {
  select: () => buzz(10), // a choice was made: chip, tile, switch, option
  success: () => buzz([15, 40, 15]), // it worked: booked, checked in
  warning: () => buzz(80), // look again: a door result that needs a check
  error: () => buzz([40, 30, 40]) // it didn't: wrong code, refused at the door
};

/* Any tap on a selectable control (chips, tiles, switches, radio options) gives the light "select" buzz,
   so each component doesn't have to remember to do it. */
const SELECTABLE =
  '[aria-pressed], [role="switch"], [role="radio"], [role="tab"], .mood, .vibe-tile, .loc-btn, .vpin-wrap';
export function listenForSelections(root) {
  root.addEventListener('click', (ev) => {
    var el = ev.target && ev.target.closest && ev.target.closest(SELECTABLE);
    if (el && !el.disabled && el.getAttribute('aria-disabled') !== 'true') haptic.select();
  });
}

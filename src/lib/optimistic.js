/* Optimistic updates (interactions spec 2.5): show the result at once, sync in the background, and if the sync
   fails put things back and say so with one way forward.
   optimistic(ctx, { apply, sync, rollback }) — apply() changes the screen now; sync() returns a promise;
   rollback() undoes apply() if sync fails. The toast offers Retry, which runs the whole thing again. */
import { haptic } from './haptics';

export function optimistic(c, step) {
  step.apply();
  return Promise.resolve()
    .then(step.sync)
    .catch(() => {
      step.rollback();
      haptic.error();
      c.toast("That didn't go through. Try again", {
        label: 'Retry',
        run: () => {
          c.set({ toast: null });
          optimistic(c, step);
        }
      });
    });
}

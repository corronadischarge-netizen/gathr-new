import { useRef, useState } from 'react';

/* The in-flight guard (interactions spec 2.4): a button that starts a network action goes to its loading state
   on the first tap and ignores every further tap until the action settles.
   const [busy, run] = useInFlight();  <Button busy={busy} onClick={() => run(() => send())}>
   run(fn) returns fn's promise, or a resolved one when a tap was ignored. */
export function useInFlight() {
  const [busy, setBusy] = useState(false);
  var on = useRef(false);
  function run(fn) {
    if (on.current) return Promise.resolve();
    on.current = true;
    setBusy(true);
    return Promise.resolve()
      .then(fn)
      .finally(() => {
        on.current = false;
        setBusy(false);
      });
  }
  return [busy, run];
}

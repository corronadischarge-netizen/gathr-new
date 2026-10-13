import { useEffect, useState } from 'react';

/* Is the phone online? Updates when the signal comes and goes (interactions spec 2.6: actions that need the network
   are disabled with "Offline" in their line, and come back on their own) */
export function useOnline() {
  const [on, setOn] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  useEffect(() => {
    var up = () => setOn(true),
      down = () => setOn(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);
  return on;
}

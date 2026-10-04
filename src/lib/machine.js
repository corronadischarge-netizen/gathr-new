import { useRef, useState } from 'react';

/* A tiny state machine. Each state lists the events it accepts and the state each one leads to;
   any other event is ignored. That makes impossible moments impossible: you can't pay twice,
   or check a code while a payment is open.
   send(event, data) returns false when the event isn't allowed right now, so callers can skip the work. */
export function useMachine(chart, initial, initialData) {
  var ref = useRef(null);
  if (!ref.current) ref.current = { state: initial, data: initialData || {} };
  const [, render] = useState(0);
  function send(ev, data) {
    var to = (chart[ref.current.state] || {})[ev];
    if (!to) return false;
    ref.current = { state: to, data: Object.assign({}, ref.current.data, data || {}) };
    render((n) => n + 1);
    return true;
  }
  return { state: ref.current.state, data: ref.current.data, send: send, is: (s) => ref.current.state === s };
}

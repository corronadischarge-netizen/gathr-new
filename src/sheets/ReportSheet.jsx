import { useState } from 'react';
import { Button, Sheet } from '../design-system';
import { haptic } from '../lib/haptics';
import { remoteOn, reportNight, sayError } from '../services/remote';
import { note } from '../ui/helpers';

const REASONS = [
  ['fake', 'It’s not a real night'],
  ['wrong_info', 'The details are wrong'],
  ['cancelled', 'It was cancelled or moved'],
  ['unsafe', 'Something felt unsafe'],
  ['other', 'Something else']
];

/* "Report this night": goes to gathr, never to the host. Reports count against the host's trust. */
export function ReportSheet(p) {
  var c = p.ctx,
    e = c.ev;
  const [why, setWhy] = useState(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  function send() {
    if (!why || busy) return;
    if (!c.S.signedIn) {
      c.set({ sheet: null });
      c.toast('Sign in to report a night');
      return;
    }
    setBusy(true);
    (remoteOn ? reportNight(e.id, why, text.trim()) : Promise.resolve()).then(
      () => {
        haptic.success();
        c.set({ sheet: null });
        c.toast('Thanks. gathr will look at it');
      },
      (err) => {
        setBusy(false);
        c.toast(sayError(err));
      }
    );
  }
  return (
    <Sheet title="Report this night" subtitle={e.title} onClose={() => c.set({ sheet: null })}>
      <div className="col" role="radiogroup" aria-label="What’s wrong">
        {REASONS.map((r) => (
          <button
            key={r[0]}
            type="button"
            role="radio"
            aria-checked={why === r[0]}
            className={'pick-row report-row' + (why === r[0] ? ' on' : '')}
            onClick={() => setWhy(r[0])}
          >
            <span className="title15" style={{ flexGrow: 1 }}>
              {r[1]}
            </span>
            <span className="report-dot" aria-hidden />
          </button>
        ))}
      </div>
      <div className="field-row">
        <input
          aria-label="Anything else (optional)"
          placeholder="Anything else? (optional)"
          maxLength={200}
          value={text}
          onChange={(ev) => setText(ev.target.value)}
        />
      </div>
      {note('Only gathr sees reports. The host isn’t told who sent one.')}
      <Button variant="primary" size="lg" block disabled={!why || busy} onClick={send}>
        {busy ? 'Sending…' : 'Send report'}
      </Button>
    </Sheet>
  );
}

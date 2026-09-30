import { WrappedCard } from '../cards/WrappedCard';
import { Button, IconButton, Wordmark } from '../design-system';
import { storyCard } from '../lib/storyCard';
import { shareToast } from '../lib/utils';
import { Share } from '../services/share';
import { note } from '../ui/helpers';

/* Wrapped: the month as a shareable story card */
export function Wrapped(p) {
  var c = p.ctx;
  return (
    <div className="full col" style={{ padding: '52px 16px 24px', gap: '20px' }}>
      <div className="rowc between">
        <IconButton icon="arrow-left" label="Back" variant="solid" onClick={c.back} />
        <Wordmark size={22} tone="light" />
        <span style={{ width: '48px' }} />
      </div>
      <WrappedCard ctx={c} />
      {note('Sample data. Built from checked-in nights only.')}
      <div className="bottom-stack" style={{ alignItems: 'stretch' }}>
        <Button
          variant="primary"
          size="lg"
          block
          icon="share"
          disabled={!!c.S.busy}
          onClick={() => {
            c.set({ busy: 'story' });
            storyCard(c.S)
              .then((blob) => Share.file(blob, 'gathr-wrapped.png', 'My month on gathr'))
              .then(
                (r) => {
                  c.set({ busy: null });
                  var t = shareToast(r);
                  if (t) c.toast(t);
                },
                () => {
                  c.set({ busy: null });
                  c.toast('Couldn’t make the story card. Try again');
                }
              );
          }}
        >
          {c.S.busy === 'story' ? 'Making your card…' : 'Share to your story'}
        </Button>
        <Button variant="ghost" onClick={() => c.tab('tonight')}>
          Find the next night
        </Button>
      </div>
    </div>
  );
}

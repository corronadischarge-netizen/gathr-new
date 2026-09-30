import { blockedFor, priceTxt } from '../data/format';
import { EVENTS } from '../data/listings';
import { Button, Chip, Sheet } from '../design-system';
import { icon, meta, note, thumb } from '../ui/helpers';
import { Tap } from '../ui/Tap';

/* Age check: asked the first time it matters (a 21+ night) */
export function AgeSheet(p) {
  var c = p.ctx,
    S = c.S,
    e = c.ev,
    close = () => {
      c.set({ sheet: null });
    };
  var blocked = S.age && blockedFor(e, S.age);
  return (
    <Sheet
      title={blocked ? 'This night is 21+' : 'How old are you?'}
      subtitle={
        blocked
          ? 'Pune doors check ID, so we’ll only show you nights that let you in.'
          : e.title + ' is ' + e.age + '+. Every Pune door checks ID. We ask once and remember.'
      }
      onClose={close}
    >
      {blocked ? null : (
        <div className="col" style={{ gap: '8px' }} role="radiogroup" aria-label="Age">
          {['18 to 20', '21 to 24', '25 or older'].map((a) => (
            <Chip
              key={a}
              role="radio"
              aria-checked={S.age === a}
              selected={S.age === a}
              onClick={() => {
                var bl = blockedFor(e, a);
                c.set({ age: a, sheet: bl ? 'age' : S.after || null, after: null });
                if (!bl) c.toast('Thanks. Nights you can’t enter are now hidden');
              }}
            >
              {a}
            </Chip>
          ))}
        </div>
      )}
      {blocked ? (
        <div className="col" style={{ gap: '10px' }}>
          <Tap
            onClick={() => {
              c.set({ sheet: null });
              c.openEvent('yellow');
            }}
            className="tap rowc g-card card"
            style={{ gap: '12px' }}
          >
            {thumb(EVENTS.yellow, 48)}
            <div className="col" style={{ gap: '2px', flexGrow: 1 }}>
              <span className="title15">{'Try ' + EVENTS.yellow.title}</span>
              {meta('18+ · ' + EVENTS.yellow.date + ' · ' + priceTxt(EVENTS.yellow))}
            </div>
            {icon('chevron-right')}
          </Tap>
          <Button
            variant="primary"
            size="lg"
            block
            onClick={() => {
              c.set({ sheet: null });
              c.tab('tonight');
            }}
          >
            See nights that let me in
          </Button>
        </div>
      ) : null}
      {note('We never show your age to venues or friends.')}
    </Sheet>
  );
}

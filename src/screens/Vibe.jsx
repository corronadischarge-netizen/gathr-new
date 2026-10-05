import { FAMILIES, NIGHT_KINDS } from '../data/taxonomy';
import { Button, Chip, IconButton } from '../design-system';
import { eyebrow, i3, svgIcon } from '../ui/helpers';

export function Vibe(p) {
  var c = p.ctx,
    S = c.S,
    known = FAMILIES.map((f) => f[0]).concat(NIGHT_KINDS.map((k) => k[0]));
  // the same genre families and kinds of night hosts pick from when they list a night
  var picked = Object.keys(S.nights).filter((k) => known.indexOf(k) >= 0).length;
  function toggle(n) {
    c.set((o) => {
      var x = Object.assign({}, o.nights);
      if (x[n]) delete x[n];
      else x[n] = 1;
      return { nights: x };
    });
  }
  return (
    <div className="full col pad-top" style={{ gap: '28px' }}>
      <div className="rowc between">
        <IconButton icon="arrow-left" label="Back" variant="solid" onClick={c.back} />
        <Button variant="ghost" size="sm" onClick={c.back}>
          Not now
        </Button>
      </div>
      <div>
        {eyebrow('Tune your week')}
        <h1 className="g-display disp">What are you into?</h1>
        <p className="body muted" style={{ marginTop: '10px' }}>
          Pick as many as you like. Your week sorts itself around them.
        </p>
      </div>
      <div className="col" style={{ gap: '12px' }}>
        <span className="g-section-title">Music</span>
        <div className="vibe-grid">
          {FAMILIES.map((f, i) => {
            var on = !!S.nights[f[0]];
            return (
              <button
                key={f[0]}
                type="button"
                aria-pressed={on}
                className={'vibe-tile hue-' + f[3] + (on ? ' on' : '')}
                style={{ '--d': i * 40 + 'ms' }}
                onClick={() => toggle(f[0])}
              >
                {i3(f[2], 56)}
                <span>{f[1]}</span>
                {on ? (
                  <i className="vibe-check" aria-hidden>
                    {svgIcon(['M5 12.5l4.5 4.5L19 7'], 14)}
                  </i>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
      <div className="col" style={{ gap: '12px' }}>
        <span className="g-section-title">Kind of night</span>
        <div className="wrap">
          {NIGHT_KINDS.map((k) => (
            <Chip key={k[0]} selected={!!S.nights[k[0]]} onClick={() => toggle(k[0])}>
              {k[1]}
            </Chip>
          ))}
        </div>
      </div>
      <div className="bottom-stack">
        <span className="meta" aria-live="polite">
          {picked ? picked + ' picked' : 'Pick at least one to continue'}
        </span>
        <Button
          variant="primary"
          size="lg"
          block
          disabled={!picked}
          onClick={() => {
            c.tab('tonight');
            c.toast('Your week is sorted by what you picked');
          }}
        >
          Sort my week
        </Button>
      </div>
    </div>
  );
}

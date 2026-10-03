import { MUSIC, NIGHTS } from '../data/options';
import { Button, Chip, IconButton } from '../design-system';
import { eyebrow, i3, svgIcon } from '../ui/helpers';

export function Vibe(p) {
  var c = p.ctx,
    S = c.S,
    groups = { Music: NIGHTS.Sound, 'Kind of night': NIGHTS.Setting };
  var picked = Object.keys(S.nights).filter((k) => NIGHTS['Where you go out'].indexOf(k) < 0).length;
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
          {groups.Music.map((n, i) => {
            var m = MUSIC[n] || ['discoball', 'violet'],
              on = !!S.nights[n];
            return (
              <button
                key={n}
                type="button"
                aria-pressed={on}
                className={'vibe-tile hue-' + m[1] + (on ? ' on' : '')}
                style={{ '--d': i * 40 + 'ms' }}
                onClick={() => toggle(n)}
              >
                {i3(m[0], 56)}
                <span>{n}</span>
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
          {groups['Kind of night'].map((n) => (
            <Chip key={n} selected={!!S.nights[n]} onClick={() => toggle(n)}>
              {n}
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

import { AREA_LIST } from '../data/options';
import { Button, Chip, IconButton } from '../design-system';
import { i3, icon, meta, svgIcon } from '../ui/helpers';

export function Areas(p) {
  var c = p.ctx,
    S = c.S,
    list = AREA_LIST;
  function locate() {
    if (S.loc) {
      c.set({ loc: false });
      return;
    }
    if (!navigator.geolocation) {
      c.toast('Location isn’t available on this device');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        c.set({ loc: true });
        c.toast('Using your location');
      },
      () => {
        c.toast('Location was declined. Pick areas instead');
      },
      { timeout: 8000 }
    );
  }
  var picked = list.filter((n) => S.nights[n]).length;
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
      <div>
        <IconButton icon="arrow-left" label="Back" variant="solid" onClick={c.back} />
      </div>
      <div className="rel">
        {i3('sunglasses', 92, 'head-ic bob')}
        <h1 className="g-display disp">Where do you go out?</h1>
        <p className="body muted" style={{ marginTop: '10px' }}>
          We show nights near these first.
        </p>
      </div>
      <button
        type="button"
        className={'loc-btn' + (S.loc ? ' on' : '')}
        aria-pressed={!!S.loc}
        onClick={locate}
      >
        <span className="loc-ic">{icon('navigation', 18)}</span>
        <span className="col" style={{ flexGrow: 1, textAlign: 'left' }}>
          <span className="title15">{S.loc ? 'Using your location' : 'Use my location'}</span>
          {meta(S.loc ? 'Distances show on every night' : 'For distances and "near me"')}
        </span>
        {S.loc ? svgIcon(['M5 12l5 5L20 7'], 20) : null}
      </button>
      <div className="col" style={{ gap: '12px' }}>
        <span className="g-section-title">Areas</span>
        <div className="wrap">
          {list.map((n) => (
            <Chip key={n} icon="map-pin" selected={!!S.nights[n]} onClick={() => toggle(n)}>
              {n}
            </Chip>
          ))}
        </div>
      </div>
      <div className="bottom-stack">
        <span className="meta">
          {picked
            ? picked + (picked === 1 ? ' area' : ' areas') + (S.loc ? ' and your location' : '')
            : S.loc
              ? 'Using your location'
              : 'Pick an area or use your location'}
        </span>
        <Button
          variant="primary"
          size="lg"
          block
          disabled={!picked && !S.loc}
          onClick={() => {
            c.back();
            c.toast('Areas saved. Nights near them show first');
          }}
        >
          Save areas
        </Button>
      </div>
    </div>
  );
}

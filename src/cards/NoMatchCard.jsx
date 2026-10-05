import { Button } from '../design-system';
import { energyName } from '../data/taxonomy';
import { i3 } from '../ui/helpers';

/* This week: shown when the chosen filter (or energy) hides every night */
export function NoMatchCard(p) {
  var c = p.ctx,
    en = c.S.energy;
  return (
    <div className="g-card card col empty-card">
      {i3('discoball', 72)}
      <span className="title16">
        {en ? 'No ' + energyName(en).toLowerCase() + ' nights here yet' : 'No nights match this filter'}
      </span>
      <p className="meta" style={{ margin: '0 0 8px' }}>
        {en
          ? 'Hosts on gathr say how hard their night goes. Try any energy.'
          : 'Try another filter, or search for a venue or artist.'}
      </p>
      <Button variant="subtle" size="sm" onClick={() => c.set({ filter: 'all', energy: null })}>
        Show all nights
      </Button>
    </div>
  );
}

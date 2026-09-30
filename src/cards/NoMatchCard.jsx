import { Button } from '../design-system';
import { i3 } from '../ui/helpers';

/* This week: shown when the chosen filter hides every night */
export function NoMatchCard(p) {
  var c = p.ctx;
  return (
    <div className="g-card card col empty-card">
      {i3('discoball', 72)}
      <span className="title16">No nights match this filter</span>
      <p className="meta" style={{ margin: '0 0 8px' }}>
        Try another filter, or search for a venue or artist.
      </p>
      <Button variant="subtle" size="sm" onClick={() => c.set({ filter: 'all' })}>
        Show all nights
      </Button>
    </div>
  );
}

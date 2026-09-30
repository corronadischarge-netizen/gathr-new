import { i3, icon, meta } from '../ui/helpers';
import { Tap } from '../ui/Tap';

/* This week: nudge to pick your sounds, shown until you've tuned your week */
export function TuneWeekCard(p) {
  var c = p.ctx;
  return (
    <Tap onClick={() => c.go('vibe')} className="tap tune-card rowc" aria-label="Tune your week">
      {i3('headphones', 52)}
      <div className="col" style={{ gap: '2px', flexGrow: 1 }}>
        <span className="title15">Tune your week</span>
        {meta('Pick your sounds. 20 seconds.')}
      </div>
      {icon('chevron-right')}
    </Tap>
  );
}

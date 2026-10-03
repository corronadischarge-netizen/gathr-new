import { Bloom } from './Bloom';
import { PillChain } from './PillChain';
import { Stop } from './Stop';
import { Wordmark } from './Wordmark';

export function EventPoster(p) {
  var hue = p.hue || 'violet',
    s = p.scale || 0.3,
    W = 1080,
    H = 1527;
  var alt = p.altHue || (hue === 'pink' ? 'yellow' : 'pink');
  return (
    <div className="g-canvas" style={{ width: W * s + 'px', height: H * s + 'px' }}>
      <div className="g-poster" style={{ width: W + 'px', height: H + 'px', transform: 'scale(' + s + ')' }}>
        {p.occasion ? <Bloom recipe={p.recipe || 'peak'} still /> : null}
        <div className="g-poster-top">
          <Wordmark size={72} tone="light" />
          <span className="g-poster-accent">{p.kicker || 'presents'}</span>
        </div>
        <h2 className="g-poster-name">
          {p.name}
          <Stop />
        </h2>
        <PillChain
          scale={3.6}
          rows={[
            [{ label: p.series || 'episode 7', tone: 'white' }, { echo: hue }],
            [
              { label: p.date, tone: hue },
              { arrow: true, tone: alt },
              { label: p.time, tone: hue }
            ],
            [{ label: p.venue, tone: 'outline' }]
          ]}
        />
        {p.support ? <p className="g-poster-support">{p.support}</p> : null}
      </div>
    </div>
  );
}

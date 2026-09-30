import { Bloom } from './Bloom';
import { Icon } from './Icon';
import { Stop } from './Stop';
import { fillOf, textOn } from './utils';
import { VibeTag } from './VibeTag';
import { Wordmark } from './Wordmark';

const PILLARS = {
  upgrade: ['the upgrade', 'green'],
  insider: ['the insider', 'yellow'],
  mirror: ['the mirror', 'pink'],
  standard: ['the standard', 'red']
};

export function SocialSlide(p) {
  var pl = PILLARS[p.pillar] || PILLARS.upgrade,
    hue = pl[1];
  var kind = p.kind || 'cover',
    fmt = p.format || 'post';
  var W = 1080,
    H = fmt === 'story' ? 1920 : 1350,
    s = p.scale || 0.3;
  var inner;
  if (kind === 'cover') {
    inner = (
      <div
        className="g-slide g-slide-cover"
        style={{ width: W + 'px', height: H + 'px', transform: 'scale(' + s + ')' }}
      >
        {p.occasion ? (
          <Bloom
            recipe={
              { upgrade: 'comedown', insider: 'sundowner', mirror: 'uv', standard: 'peak' }[p.pillar] || 'uv'
            }
            at="top"
            still
          />
        ) : null}
        <div className="g-slide-top">
          <Wordmark size={64} tone="light" />
          <VibeTag hue={hue} tilt={-4} tail="right" className="g-slide-tag">
            {pl[0]}
          </VibeTag>
        </div>
        <div className="g-slide-copy">
          {p.kicker ? (
            <span className="g-slide-accent" style={{ color: 'var(--' + hue + '-300)' }}>
              {p.kicker}
            </span>
          ) : null}
          <h2 className="g-slide-head">
            {p.headline}
            <Stop />
          </h2>
        </div>
        <div className="g-slide-foot">
          <span>swipe</span>
          <Icon name="arrow-right" size={56} />
        </div>
      </div>
    );
  } else if (kind === 'end') {
    inner = (
      <div
        className="g-slide g-slide-end"
        style={{ width: W + 'px', height: H + 'px', transform: 'scale(' + s + ')' }}
      >
        {p.occasion ? <Bloom recipe="uv" at="top" still /> : null}
        <div className="g-slide-copy">
          <span className="g-slide-accent">{p.kicker || 'before you go'}</span>
          <h2 className="g-slide-head">
            {p.headline}
            <Stop />
          </h2>
        </div>
        <div className="g-slide-foot">
          <span>{p.handle || ''}</span>
          <Wordmark size={72} tone="light" />
        </div>
      </div>
    );
  } else {
    inner = (
      <div
        className="g-slide g-slide-body"
        style={{
          width: W + 'px',
          height: H + 'px',
          transform: 'scale(' + s + ')',
          backgroundColor: fillOf(hue),
          color: textOn(hue)
        }}
      >
        <div className="g-slide-top">
          <span className="g-slide-pillar">{pl[0]}</span>
          <span className="g-slide-count">{pad(p.index) + '/' + pad(p.total)}</span>
        </div>
        <span className="g-slide-num">{pad(p.index)}</span>
        <div className="g-slide-copy">
          <h2 className="g-slide-head">
            {p.headline}
            <Stop color="var(--night-900)" />
          </h2>
          {p.body ? <p className="g-slide-text">{p.body}</p> : null}
        </div>
        <div className="g-slide-foot">
          <span />
          <Wordmark size={52} tone="dark" />
        </div>
      </div>
    );
  }
  return (
    <div className="g-canvas" style={{ width: W * s + 'px', height: H * s + 'px' }}>
      {inner}
    </div>
  );
}

function pad(n) {
  n = n || 1;
  return n < 10 ? '0' + n : '' + n;
}

import { useRef } from 'react';
import { WELCOME_PHOTOS } from '../assets/images';
import { Bloom, Button, PageIndicator, PhotoFrame, VibeTag, Wordmark } from '../design-system';
import { fav, i3, meta, svgIcon } from '../ui/helpers';

const BLOOM = (() => {
  var m = /[?&]bloom=([a-z]+)/.exec(location.search);
  return m ? m[1] : 'uv';
})();

export function Welcome(p) {
  var c = p.ctx,
    S = c.S,
    i = S.wstep || 0,
    last = i === 2;
  var steps = [
    ['pune after dark', 'Every night out in the city, in one place.'],
    ['know who gets in', 'Age, ID, dress and stag rules on every night, before you pay.'],
    ['go out together', 'Vote with friends, book once, send everyone their pass.']
  ];
  function go(n) {
    c.set({ wstep: Math.max(0, Math.min(2, n)) });
  }
  var sx = useRef(null);
  var art;
  if (i === 0)
    art = (
      <div key="a0" className="w-art w-fade" style={{ width: '300px', height: '260px' }}>
        <div className="w-card" style={{ '--d': '60ms', '--r': '-7deg', left: '0px', top: '104px' }}>
          <PhotoFrame width={150} height={104} tilt={-7} image={WELCOME_PHOTOS.pour} />
        </div>
        <div className="w-card" style={{ '--d': '140ms', '--r': '4deg', left: '100px', top: '8px' }}>
          <PhotoFrame width={100} height={124} tilt={4} image={WELCOME_PHOTOS.martini} />
        </div>
        <div className="w-card" style={{ '--d': '220ms', '--r': '-3deg', left: '172px', top: '130px' }}>
          <PhotoFrame width={124} height={104} tilt={-3} image={WELCOME_PHOTOS.crowd} />
        </div>
        <span className="w-3d" style={{ '--d': '420ms', '--r': '-10deg', left: '14px', top: '10px' }}>
          {i3('discoball', 70, 'bob')}
        </span>
        <span className="w-3d" style={{ '--d': '500ms', '--r': '10deg', left: '232px', top: '40px' }}>
          {i3('ticket', 62, 'bob', { animationDelay: '-1.4s' })}
        </span>
      </div>
    );
  else if (i === 1)
    art = (
      <div key="a1" className="w-art w-fade" style={{ width: '300px', height: '260px' }}>
        <div className="w-mock" style={{ left: '30px', top: '46px', transform: 'rotate(-3deg)' }}>
          <span className="title15">Who gets in</span>
          {[
            [true, '21+ night · you’re 21 to 24'],
            [true, 'ID for everyone · DigiLocker'],
            [null, 'Stag entry is up to the door']
          ].map((r) => (
            <div key={r[1]} className="ck-row">
              <span className={'ck ' + (r[0] ? 'ok' : 'info')}>
                {r[0] ? svgIcon(['M5 12.5l4.5 4.5L19 7'], 14) : 'i'}
              </span>
              <span>{r[1]}</span>
            </div>
          ))}
        </div>
        <span className="w-tag" style={{ '--d': '200ms', left: '4px', top: '8px' }}>
          <VibeTag hue="pink" tilt={-5}>
            no surprises at the door
          </VibeTag>
        </span>
        <span className="w-3d" style={{ '--d': '300ms', '--r': '12deg', left: '214px', top: '158px' }}>
          {i3('pass', 84, 'bob')}
        </span>
      </div>
    );
  else
    art = (
      <div key="a2" className="w-art w-fade" style={{ width: '300px', height: '260px' }}>
        <div className="w-mock" style={{ left: '24px', top: '52px', transform: 'rotate(2deg)' }}>
          <span className="title15">Friday plan</span>
          {meta('4 of 5 voted · closes Thu 6 pm')}
          <div className="vote-bar" style={{ marginTop: '4px' }}>
            <i style={{ width: '60%' }} />
          </div>
          <div className="plan-crew" style={{ marginTop: '6px' }}>
            {['Zoya', 'Aman', 'Kavya', 'Kabir'].map((n) => fav(n, 32))}
          </div>
        </div>
        <span className="w-tag" style={{ '--d': '200ms', left: '150px', top: '6px' }}>
          <VibeTag hue="yellow" tilt={3} tail="left">
            who's going
          </VibeTag>
        </span>
        <span className="w-3d" style={{ '--d': '300ms', '--r': '-10deg', left: '4px', top: '170px' }}>
          {i3('champagne', 80, 'bob')}
        </span>
        <span className="w-3d" style={{ '--d': '380ms', '--r': '8deg', left: '222px', top: '176px' }}>
          {i3('wristband', 66, 'bob', { animationDelay: '-1.2s' })}
        </span>
      </div>
    );
  return (
    <div className="full col welcome" style={{ padding: '56px 24px 24px' }}>
      <Bloom recipe={BLOOM} at="low" />
      <div className="rel rowc between w-in" style={{ '--d': '0ms' }}>
        <Wordmark size={24} tone="light" />
        <Button variant="ghost" size="sm" onClick={() => c.go('phone', { login: true })}>
          Log in
        </Button>
      </div>
      <div
        className="rel col"
        style={{ alignItems: 'center', marginTop: '40px', flex: 'none' }}
        onTouchStart={(ev) => (sx.current = ev.touches[0].clientX)}
        onTouchEnd={(ev) => {
          if (sx.current == null) return;
          var dx = ev.changedTouches[0].clientX - sx.current;
          if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
          sx.current = null;
        }}
      >
        {art}
      </div>
      <div
        key={'t' + i}
        className="rel col w-fade"
        style={{ alignItems: 'center', textAlign: 'center', gap: '10px', marginTop: '28px' }}
        aria-live="polite"
      >
        <span className="step-kicker">{i + 1 + ' of 3'}</span>
        <h1 className="g-display disp w-title">
          {steps[i][0]}
          <span className="stop">.</span>
        </h1>
        <p className="w-body">{steps[i][1]}</p>
      </div>
      <div className="rel" style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <PageIndicator count={3} active={i} />
      </div>
      <div className="rel bottom-stack">
        <Button
          variant="primary"
          size="lg"
          block
          iconRight="arrow-right"
          onClick={() => {
            if (last) c.tab('tonight');
            else go(i + 1);
          }}
        >
          {last ? "See what's on" : 'Next'}
        </Button>
        {last ? (
          <span
            className="note"
            style={{ textAlign: 'center', minHeight: '44px', display: 'grid', placeItems: 'center' }}
          >
            No sign-up needed to look around
          </span>
        ) : (
          <Button variant="ghost" onClick={() => c.tab('tonight')}>
            Skip
          </Button>
        )}
      </div>
    </div>
  );
}

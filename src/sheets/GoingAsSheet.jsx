import { useEffect, useState } from 'react';
import { currentGroup, groupLabel } from '../data/group';
import { Button, Chip, Icon, IconButton, Sheet } from '../design-system';
import { log } from '../lib/log';

/* Going as (home spec section 6, board 04): who's going tonight, so every night's door rules are checked for the
   whole group. Saving re-ranks the home and changes every verdict at once */
const TYPES = [
  ['solo', 'Just me', 'user'],
  ['couple', 'Couple'],
  ['girls', 'Girls'],
  ['guys', 'Guys'],
  ['mixed', 'Mixed group', 'users']
];

function Stepper(p) {
  return (
    <div className="ga-step">
      <span className="col">
        <span className="title15">{p.label}</span>
        {p.sub ? <span className="meta">{p.sub}</span> : null}
      </span>
      <span className="ga-step-ctl">
        <IconButton icon="minus" label={'Fewer ' + p.label.toLowerCase()} variant="solid" size={44} disabled={p.value <= p.min} onClick={() => p.onChange(p.value - 1)} />
        <span className="ga-step-n" aria-live="polite">
          {p.value}
        </span>
        <IconButton icon="plus" label={'More ' + p.label.toLowerCase()} variant="solid" size={44} disabled={p.value >= p.max} onClick={() => p.onChange(p.value + 1)} />
      </span>
    </div>
  );
}

function split(n) {
  var women = Math.ceil(n / 2);
  return { women: women, men: n - women };
}

export function GoingAsSheet(p) {
  var c = p.ctx,
    S = c.S,
    start = currentGroup(S) || { type: 'guys', size: 2, under21: S.age === '18 to 20' };
  var [g, setG] = useState(Object.assign({ women: 0, men: 0 }, start, start.type === 'mixed' && !start.women && !start.men ? split(start.size) : null));
  function pick(type) {
    var size = type === 'solo' ? 1 : type === 'couple' ? 2 : Math.max(2, g.type === 'solo' || g.type === 'couple' ? 2 : g.size);
    setG(Object.assign({}, g, { type: type, size: size }, type === 'mixed' ? split(size) : { women: 0, men: 0 }));
  }
  function setSize(n) {
    setG(Object.assign({}, g, { size: n }, g.type === 'mixed' ? split(n) : null));
  }
  function setSide(side, n) {
    var x = Object.assign({}, g, { [side]: n });
    x.size = x.women + x.men;
    setG(x);
  }
  useEffect(() => {
    log('going_as_open', { from: S.gaFrom || 'home' });
  }, []);
  function save(next) {
    log('going_as_save', { type: next.type, size: next.size, under21: !!next.under21 });
    c.set({ group: Object.assign({}, next, { source: 'manual' }), sheet: null });
  }
  var count = g.type !== 'solo' && g.type !== 'couple';
  return (
    <Sheet title="Who's going?" subtitle="We'll check the door rules for you" onClose={() => c.set({ sheet: null })}>
      <div className="col ga">
        <span className="caps ga-caps">Your group</span>
        <div className="ga-chips" role="radiogroup" aria-label="Your group">
          {TYPES.map((t) => (
            <Chip key={t[0]} icon={t[2]} selected={g.type === t[0]} role="radio" aria-pressed={undefined} aria-checked={g.type === t[0]} onClick={() => pick(t[0])}>
              {t[1]}
            </Chip>
          ))}
        </div>
        {g.type === 'mixed' ? (
          <>
            <Stepper label="Girls" value={g.women} min={1} max={9} onChange={(n) => setSide('women', n)} />
            <Stepper label="Guys" value={g.men} min={1} max={10 - g.women} onChange={(n) => setSide('men', n)} />
          </>
        ) : count ? (
          <Stepper label="How many of you?" sub="Including you" value={g.size} min={2} max={10} onChange={setSize} />
        ) : null}
        <span className="caps ga-caps">Anyone under 21?</span>
        <div className="ga-chips" role="radiogroup" aria-label="Anyone under 21?">
          <Chip selected={!g.under21} role="radio" aria-pressed={undefined} aria-checked={!g.under21} onClick={() => setG(Object.assign({}, g, { under21: false }))}>
            No, all 21+
          </Chip>
          <Chip selected={!!g.under21} role="radio" aria-pressed={undefined} aria-checked={!!g.under21} onClick={() => setG(Object.assign({}, g, { under21: true }))}>
            Someone is
          </Chip>
        </div>
        <p className="meta" style={{ margin: 0 }}>
          One person under 21 changes what lets you in
        </p>
        <div className="ga-note">
          <Icon name="calendar" size={20} />
          <span>Started a plan? It fills this in for you</span>
        </div>
        <Button variant="primary" size="lg" block onClick={() => save(g)}>
          {'Show nights for ' + groupLabel(g)}
        </Button>
        <Button
          variant="ghost"
          block
          onClick={() =>
            save(Object.assign({}, g, g.type === 'guys' || g.type === 'girls' ? { size: 1 } : { type: 'solo', size: 1, women: 0, men: 0 }))
          }
        >
          Just me tonight
        </Button>
      </div>
    </Sheet>
  );
}

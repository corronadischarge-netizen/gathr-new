import { Children, useEffect, useRef, useState } from 'react';
import { cx } from './utils';

/* A row of cards with one in focus and its neighbours smaller and dimmer (usually StoryCards). Swipe moves focus;
   tapping a neighbour is the screen's job (it sets active). The focused card stays centred.
   App addition: onChange(index) tells the screen which card is in focus (the screen's buttons act on it) */
export function CardDeck(p) {
  var kids = Children.toArray(p.children),
    start = p.active != null ? p.active : Math.floor(kids.length / 2);
  const [mid, setMid] = useState(start);
  useEffect(() => setMid(start), [start]);
  var down = useRef(null),
    swiped = useRef(false);
  function go(i) {
    var n = Math.max(0, Math.min(kids.length - 1, i));
    if (n === mid) return;
    setMid(n);
    if (p.onChange) p.onChange(n);
  }
  return (
    <div
      className={cx('g-deck', p.className)}
      style={Object.assign({ '--deck-shift': kids.length - 1 - mid - mid }, p.style)}
      onPointerDown={(e) => (down.current = e.clientX)}
      onPointerUp={(e) => {
        var dx = down.current == null ? 0 : e.clientX - down.current;
        down.current = null;
        swiped.current = Math.abs(dx) > 40;
        if (swiped.current) go(mid + (dx < 0 ? 1 : -1));
      }}
      // a swipe that ends on a card isn't a tap on it
      onClickCapture={(e) => {
        if (swiped.current) {
          swiped.current = false;
          e.stopPropagation();
          e.preventDefault();
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(mid + 1);
        if (e.key === 'ArrowLeft') go(mid - 1);
      }}
    >
      {kids.map((k, i) => (
        <div key={i} className={cx('g-deck-item', i === mid ? 'is-active' : i < mid ? 'is-left' : 'is-right')}>
          {k}
        </div>
      ))}
    </div>
  );
}

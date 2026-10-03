import { useRef } from 'react';
import { useDialog } from '../hooks/useDialog';
import { AgeSheet } from './AgeSheet';
import { BookSheet } from './BookSheet';
import { ConfirmSheet } from './ConfirmSheet';
import { FriendsSheet } from './FriendsSheet';
import { PosterLayer } from './PosterLayer';
import { RulesSheet } from './RulesSheet';

/* Which sheet to show for each value of state.sheet */
const SHEETS = {
  age: AgeSheet,
  friends: FriendsSheet,
  list: BookSheet,
  rules: RulesSheet,
  cancel: ConfirmSheet,
  logout: ConfirmSheet
};

/* The dimmed layer that holds whichever bottom sheet is open */
export function SheetLayer(p) {
  var c = p.ctx,
    S = c.S;
  var close = () => {
    if (!S.busy) c.set({ sheet: null });
  };
  var ref = useRef(null);
  useDialog(ref, S.sheet, close);
  if (S.sheet === 'poster') return <PosterLayer ctx={c} close={close} layerRef={ref} />;
  var Body = SHEETS[S.sheet];
  return (
    <div className="sheet-layer" ref={ref}>
      <div className="overlay" onClick={close} />
      <div className="sheet-slot rise">{Body ? <Body ctx={c} close={close} /> : null}</div>
    </div>
  );
}

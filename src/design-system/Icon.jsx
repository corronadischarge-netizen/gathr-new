import { useId } from 'react';
import { FILLED_ICONS, ICONS } from './icons';
import { cx } from './utils';

/* Lucide outline at 1.75. `filled` swaps in the solid version, for "on" states only (active tab, saved, liked) */
export function Icon(p) {
  var size = p.size || 20,
    uid = 'gim' + useId().replace(/:/g, ''),
    solid = p.filled && FILLED_ICONS[p.name],
    body = solid ? FILLED_ICONS[p.name].split('{M}').join(uid) : ICONS[p.name] || '';
  return (
    <svg
      className={cx('g-icon', solid && 'is-filled', p.className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={p.label ? 'img' : undefined}
      aria-label={p.label}
      aria-hidden={p.label ? undefined : 'true'}
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}

Icon.names = () => Object.keys(ICONS);
Icon.filledNames = () => Object.keys(FILLED_ICONS);

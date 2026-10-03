import { ICONS } from './icons';
import { cx } from './utils';

export function Icon(p) {
  var size = p.size || 20;
  return (
    <svg
      className={cx('g-icon', p.className)}
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
      dangerouslySetInnerHTML={{ __html: ICONS[p.name] || '' }}
    />
  );
}

import { useLayoutEffect, useRef } from 'react';
import { Icon } from './Icon';
import { cx, rest } from './utils';

/* busy (app addition, interactions spec 2.4): the action is on its way. The button ignores further taps, says so
   to screen readers, and keeps the width it had before its label changed ("Pay ₹2,400" → "Paying") */
export function Button(p) {
  var variant = p.variant || 'primary',
    size = p.size || 'md';
  var o = rest(p, ['variant', 'size', 'icon', 'iconRight', 'block', 'className', 'children', 'busy', 'onClick', 'style']);
  var is = size === 'sm' ? 16 : 20;
  var el = useRef(null),
    width = useRef(null);
  useLayoutEffect(() => {
    if (!p.busy && el.current) width.current = el.current.offsetWidth;
  });
  var style = p.busy && width.current && !p.block ? Object.assign({ width: width.current + 'px' }, p.style) : p.style;
  return (
    <button
      type="button"
      {...o}
      ref={el}
      style={style}
      aria-busy={p.busy ? 'true' : undefined}
      onClick={(ev) => {
        if (p.busy) {
          ev.preventDefault();
          return;
        }
        if (p.onClick) p.onClick(ev);
      }}
      className={cx('g-btn', 'g-btn-' + variant, 'g-btn-' + size, p.block && 'g-btn-block', p.busy && 'is-busy', p.className)}
    >
      {p.icon ? <Icon name={p.icon} size={is} /> : null}
      <span>{p.children}</span>
      {p.iconRight ? <Icon name={p.iconRight} size={is} /> : null}
    </button>
  );
}

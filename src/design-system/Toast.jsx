import { cx } from './utils';

/* A short message with an optional action (Undo) */
export function Toast(p) {
  return (
    <div className={cx('g-toast', p.className)} role="status">
      <span>{p.children}</span>
      {p.action ? (
        <button type="button" onClick={p.onAction}>
          {p.action}
        </button>
      ) : null}
    </div>
  );
}

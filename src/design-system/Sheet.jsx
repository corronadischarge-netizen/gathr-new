import { IconButton } from './IconButton';
import { cx } from './utils';

export function Sheet(p) {
  return (
    <section className={cx('g-sheet', p.className)} role="dialog" aria-modal="true" aria-label={p.title}>
      <span className="g-grabber" aria-hidden="true" />
      <header className="g-sheet-head">
        <div>
          <h2 className="g-sheet-title">{p.title}</h2>
          {p.subtitle ? <p className="g-sheet-sub">{p.subtitle}</p> : null}
        </div>
        <IconButton icon="x" label="Close" onClick={p.onClose} />
      </header>
      <div className="g-sheet-body">{p.children}</div>
    </section>
  );
}

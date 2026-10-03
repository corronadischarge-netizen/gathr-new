import { Button } from './Button';
import { cx } from './utils';
import { Wordmark } from './Wordmark';

export function SiteHeader(p) {
  return (
    <header className={cx('g-site', p.className)}>
      <Wordmark size={28} />
      <nav className="g-site-links">
        {(p.links || ['How it works', 'Tonight', 'For venues']).map((l) => (
          <a key={l} href="#">
            {l}
          </a>
        ))}
      </nav>
      <Button variant="primary" size="sm">
        {p.cta || 'Get the app'}
      </Button>
    </header>
  );
}

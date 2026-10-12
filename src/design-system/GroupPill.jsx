import { Avatar } from './Avatar';
import { Icon } from './Icon';
import { cx } from './utils';

/* The one place the home says who you're going with: the active plan if there is one, otherwise Going as.
   state: plan-vote | plan-booked | group-set | group-unset. Solid, never glass, never violet (it isn't a selection) */
export function GroupPill(p) {
  var unset = p.state === 'group-unset',
    people = (p.people || []).slice(0, 4);
  return (
    <button
      type="button"
      className={cx('g-gp', 'is-' + p.state, p.className)}
      onClick={p.onOpen}
      aria-label={[p.title, p.line].filter(Boolean).join('. ')}
    >
      <span className="g-gp-faces" aria-hidden="true">
        {unset ? (
          <span className="g-gp-you">
            <Icon name="user" size={20} />
          </span>
        ) : (
          people.map((x, i) => <Avatar key={x.name + i} name={x.name} image={x.image} size={32} className="g-gp-face" />)
        )}
      </span>
      <span className="g-gp-copy" aria-hidden="true">
        <span className="g-gp-title">{p.title}</span>
        {p.line ? <span className="g-gp-line">{p.line}</span> : null}
      </span>
      {p.state === 'group-set' ? (
        <span className="g-gp-change" aria-hidden="true">
          Change
        </span>
      ) : (
        <Icon name="chevron-right" size={20} className="g-gp-chev" />
      )}
    </button>
  );
}

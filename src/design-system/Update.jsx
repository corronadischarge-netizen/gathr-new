import { Avatar } from './Avatar';
import { Button } from './Button';
import { Icon } from './Icon';
import { cx } from './utils';

/* The lead of an update: a night's 3D object, a person's photo (or their initials), or gathr's icon tinted by meaning */
export function UpdateLead(p) {
  // app addition: a person's photo, or their initials when there's none or it doesn't load; never a silhouette
  if (p.image || p.name) {
    return (
      <span className="g-up-lead is-person">
        <Avatar name={p.name} image={p.image} size={44} />
      </span>
    );
  }
  if (p.object) {
    return (
      <span className="g-up-lead is-night">
        <img src={p.object} alt="" />
      </span>
    );
  }
  return (
    <span className={cx('g-up-lead', 'is-gathr', 'is-' + (p.tone || 'wait'))}>
      <Icon name={p.icon || 'bell'} size={20} />
    </span>
  );
}

/* "Needs you" or "Earlier", with an optional count on the right */
export function UpdateGroup(p) {
  return (
    <section className={cx('g-upg', p.className)}>
      <header className="g-upg-head">
        <h2>{p.title}</h2>
        {p.aside ? <span>{p.aside}</span> : null}
      </header>
      <div className="g-upg-list" role="list">
        {p.children}
      </div>
    </section>
  );
}

/* One update. kind: task (white button), chance (violet button), decide (Decline + Accept), info (a chevron).
   App additions: onOpen makes the row itself tappable (info rows open what they're about); done shows an accepted
   row's tick in place of its buttons; leaving slides a declined row out (interactions spec 5); flip names the row
   for the list's FLIP, so the rows below glide up into its place */
export function Update(p) {
  var kind = p.kind || 'info';
  var meta = [p.meta, p.time].filter(Boolean).join(' · ');
  var end = null;
  if (p.done) {
    end = (
      <span className="g-up-done" aria-label="Done">
        <Icon name="check" size={20} />
      </span>
    );
  } else if (kind === 'task') {
    end = (
      <Button variant="primary" size="sm" onClick={p.onAction}>
        {p.action || 'Fix'}
      </Button>
    );
  } else if (kind === 'chance') {
    end = (
      <Button variant="brand" size="sm" onClick={p.onAction}>
        {p.action || 'Book'}
      </Button>
    );
  } else if (kind === 'decide') {
    end = (
      <div className="g-up-pair">
        <button type="button" className="g-up-round is-no" aria-label={p.declineLabel || 'Decline'} onClick={p.onDecline}>
          <Icon name="x" size={20} />
        </button>
        <button type="button" className="g-up-round is-yes" aria-label={p.acceptLabel || 'Accept'} onClick={p.onAccept}>
          <Icon name="check" size={20} />
        </button>
      </div>
    );
  } else {
    end = <Icon name="chevron-right" size={16} className="g-up-chev" />;
  }
  var open = kind === 'info' && p.onOpen;
  return (
    <div
      className={cx('g-up', kind === 'info' ? 'is-info' : 'is-needs', p.unread === false && 'is-read', open && 'is-open', p.done && 'is-done', p.leaving && 'is-leaving', p.className)}
      data-flip={p.flip}
      role="listitem"
      onClick={open ? p.onOpen : undefined}
      onKeyDown={
        open
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                p.onOpen();
              }
            }
          : undefined
      }
      tabIndex={open ? 0 : undefined}
    >
      <UpdateLead object={p.object} image={p.image} name={p.name} icon={p.icon} tone={p.tone} />
      <div className="g-up-text">
        <p className="g-up-title">{p.title}</p>
        {meta ? <p className="g-up-meta">{meta}</p> : null}
      </div>
      {end}
    </div>
  );
}

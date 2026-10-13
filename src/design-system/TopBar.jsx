import { Avatar } from './Avatar';
import { IconButton } from './IconButton';
import { cx } from './utils';
import { Wordmark } from './Wordmark';

/* actions: [icon, label, onClick?, isNew?, active?]. isNew lights the button and adds the "something new" dot (the bell);
   active fills the icon (a saved heart).
   onAvatar makes the avatar a button (to You). The extras are app additions; without them it's the design system's TopBar */
export function TopBar(p) {
  var avatar = p.avatar ? <Avatar name={p.avatar} image={p.avatarImage} size={48} className="g-topbar-avatar" /> : null;
  return (
    <header className={cx('g-topbar', p.glass && 'g-topbar-glass', p.className)}>
      {p.back ? (
        <IconButton icon="arrow-left" label="Back" onClick={p.onBack} />
      ) : avatar && p.onAvatar ? (
        <button type="button" className="g-topbar-me" aria-label="You" onClick={p.onAvatar}>
          {avatar}
        </button>
      ) : avatar ? (
        avatar
      ) : (
        <Wordmark size={26} />
      )}
      {p.title ? <span className="g-topbar-title">{p.title}</span> : <span style={{ flex: 1 }} />}
      <span className="g-topbar-actions">
        {(
          p.actions || [
            ['search', 'Search'],
            ['bell', 'Notifications']
          ]
        ).map((a) => (
          <span key={a[0]} className={cx('g-topbar-act', a[3] && 'is-new')}>
            <IconButton icon={a[0]} label={a[1]} onClick={a[2]} active={!!a[4]} />
            {a[3] ? <i className="g-topbar-dot" aria-hidden="true" /> : null}
          </span>
        ))}
      </span>
    </header>
  );
}

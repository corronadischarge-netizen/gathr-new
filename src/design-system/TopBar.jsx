import { Avatar } from './Avatar';
import { IconButton } from './IconButton';
import { cx } from './utils';
import { Wordmark } from './Wordmark';

export function TopBar(p) {
  return (
    <header className={cx('g-topbar', p.glass && 'g-topbar-glass', p.className)}>
      {p.back ? (
        <IconButton icon="arrow-left" label="Back" />
      ) : p.avatar ? (
        <Avatar name={p.avatar} image={p.avatarImage} size={48} className="g-topbar-avatar" />
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
          <IconButton key={a[0]} icon={a[0]} label={a[1]} />
        ))}
      </span>
    </header>
  );
}

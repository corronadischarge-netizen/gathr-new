import { Avatar } from './Avatar';
import { cx } from './utils';

export function FriendsGoing(p) {
  var people = p.people || (p.names || []).map((n) => ({ name: n }));
  var total = p.total != null ? p.total : people.length;
  return (
    <div className={cx('g-friends', p.className)}>
      <span className="g-avatars" aria-hidden="true">
        {people.slice(0, 3).map((f, i) => (
          <Avatar key={i} name={f.name} image={f.image} size={28} />
        ))}
      </span>
      <span className="g-friends-text">
        {total === 1 ? (people[0] && people[0].name) + ' is going' : total + ' friends going'}
      </span>
    </div>
  );
}

import { Avatar } from './Avatar';
import { cx } from './utils';

/* "3 friends going", or with verb 'booked' (only when they actually booked): "Riya, Dev + 2 friends booked" */
function friendsText(people, total, verb) {
  if (verb !== 'booked') return total === 1 ? (people[0] && people[0].name) + ' is going' : total + ' friends going';
  var named = people
    .slice(0, 2)
    .map((f) => f.name)
    .filter(Boolean);
  if (!named.length) return total + ' friends booked';
  var more = total - named.length;
  return named.join(', ') + (more > 0 ? ' + ' + more + (more === 1 ? ' friend' : ' friends') : '') + ' booked';
}

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
      <span className="g-friends-text">{friendsText(people, total, p.verb)}</span>
    </div>
  );
}

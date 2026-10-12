import { FriendsGoing } from './FriendsGoing';
import { cx, fmtNum } from './utils';

/* Social proof under the venue hero: booked, saved, the pace, then the friends who booked */
export function TonightSoFar(p) {
  var stats = [
    [p.booked, 'booked'],
    [p.saved, 'saved'],
    [p.lastHour != null ? '+' + p.lastHour : null, 'in the last hour']
  ].filter((x) => x[0] != null);
  return (
    <section className={cx('g-tsf', p.className)}>
      <h2 className="g-factcard-title">{p.title || 'Tonight so far'}</h2>
      <div className="g-tsf-stats">
        {stats.map((x, i) => (
          <div key={i} className="g-tsf-stat">
            <b>{typeof x[0] === 'number' ? fmtNum(x[0]) : x[0]}</b>
            <span>{x[1]}</span>
          </div>
        ))}
      </div>
      {p.friends || p.friendsPeople ? (
        <div className="g-tsf-friends">
          <FriendsGoing names={p.friends} people={p.friendsPeople} total={p.friendsTotal} verb="booked" />
        </div>
      ) : null}
    </section>
  );
}

import { Avatar } from './Avatar';
import { Icon } from './Icon';
import { Media } from './Media';
import { cx } from './utils';

/* The card for a night that's yours (r25): a tall photo, the people going with you above a centred title, all on the
   fade. Right after booking, upcoming nights in Plans, and the picture shared to the group chat. Not for browsing */
export function StoryCard(p) {
  var people = p.people || [];
  return (
    <article className={cx('g-story', p.className)} style={p.style}>
      <Media image={p.image} neutral label="Event photo" className="g-story-media" />
      <div className="g-story-fade" />
      {p.status ? (
        <span className="g-story-status">
          <span className="g-story-status-dot">
            <Icon name="check" size={11} />
          </span>
          {p.status}
        </span>
      ) : null}
      <div className="g-story-body">
        {people.length ? (
          <span className="g-story-people" aria-label={people.length === 1 ? '1 person going' : people.length + ' people going'}>
            {people.slice(0, 4).map((f, i) => (
              <Avatar key={(f.name || '') + i} name={f.name} image={f.image} size={i === 1 ? 40 : 30} className={'g-story-av g-story-av-' + i} />
            ))}
          </span>
        ) : null}
        <h3 className="g-story-title">{p.title}</h3>
        {p.meta ? <p className="g-story-meta">{p.meta}</p> : null}
        {p.place ? <p className="g-story-meta">{p.place}</p> : null}
      </div>
    </article>
  );
}

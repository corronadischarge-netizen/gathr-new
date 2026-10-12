import { IMAGES_3D } from '../assets/images';
import { Avatar, Icon, Sticker } from '../design-system';

/* gathr's own display headline: lowercase with the yellow full stop (none after a question mark) */
export function stop(txt, cls) {
  return (
    <h1 className={'g-display disp' + (cls ? ' ' + cls : '')}>
      {txt}
      {typeof txt === 'string' && /\?$/.test(txt) ? null : <span className="stop">.</span>}
    </h1>
  );
}

/* a display headline that is someone's name (an organiser, a plan, a person): their own spelling, no full stop */
export function nameTitle(txt, cls) {
  return <h1 className={'g-display disp' + (cls ? ' ' + cls : '')}>{txt}</h1>;
}

export function eyebrow(t, style) {
  return (
    <span className="g-eyebrow" style={style}>
      {t}
    </span>
  );
}

export function meta(t, style) {
  return (
    <span className="meta" style={style}>
      {t}
    </span>
  );
}

export function sec(t, right) {
  return (
    <div className="sec-row">
      <span className="g-section-title">{t}</span>
      {right || null}
    </div>
  );
}

function ph(style) {
  return <div className="g-media g-media-empty" style={style} />;
}

export function thumb(e, size) {
  return (
    <div
      className="g-media thumb"
      style={{ width: size + 'px', height: size + 'px', backgroundImage: 'url(' + e.img + ')' }}
    />
  );
}

export function icon(name, size) {
  return <Icon name={name} size={size || 20} />;
}

export function svgIcon(d, size) {
  return (
    <svg
      width={size || 20}
      height={size || 20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {d.map((p, i) => (
        <path key={i} d={p} />
      ))}
    </svg>
  );
}

export function btnLabel(e) {
  var b = e.target.closest('button');
  return b ? (b.getAttribute('aria-label') || b.textContent || '').trim() : null;
}

export function sampleTag() {
  return null;
}

/* A 3D object, drawn with the design system's Sticker. Decorative, so hidden from screen readers.
   The 'bob' class makes it the screen's one floating sticker (Sticker bob); other classes place it */
export function i3(name, size, cls, style) {
  var c = (cls || '').split(' ').filter(Boolean),
    bob = c.indexOf('bob') >= 0;
  return (
    <Sticker
      src={IMAGES_3D[name]}
      size={size}
      bob={bob}
      className={['i3'].concat(c.filter((x) => x !== 'bob')).join(' ')}
      style={style}
    />
  );
}

export function tile(name, hue, size) {
  return (
    <span className={'i3-tile hue-' + hue} style={{ width: size + 'px', height: size + 'px' }}>
      {i3(name, Math.round(size * 0.86))}
    </span>
  );
}

/* the icon at the start of a list row: a Lucide icon on a grey circle (3D objects stay out of lists) */
export function rowIcon(name) {
  return (
    <span className="row-ic" aria-hidden="true">
      <Icon name={name} size={20} />
    </span>
  );
}

export function friendsTxt(n) {
  return <span className="friends-txt">{n === 1 ? '1 friend going' : n + ' friends going'}</span>;
}

export function note(t) {
  return <p className="note">{t || 'Bookings and friends are sample data until the live feed exists'}</p>;
}

/* a person without a photo: their initials, centred */
export function fav(name, size) {
  return <Avatar key={name} name={name} size={size || 40} />;
}

export function statusChip(t, tone) {
  return <span className={'st-chip st-' + (tone || 'wait')}>{t}</span>;
}

export function meAvatar(S, size) {
  return S.me && S.me.photo ? (
    <span className="me-av" style={{ width: size + 'px', height: size + 'px' }}>
      <img src={S.me.photo} alt="" />
    </span>
  ) : (
    fav(S.me.name || 'You', size)
  );
}

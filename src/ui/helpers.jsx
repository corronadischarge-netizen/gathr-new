import { IMAGES_3D } from '../assets/images';
import { FRIEND_SHAPE } from '../data/sample';
import { Icon, ShapeAvatar } from '../design-system';

export function stop(txt, cls) {
  return (
    <h1 className={'g-display disp' + (cls ? ' ' + cls : '')}>
      {txt}
      <span className="stop">.</span>
    </h1>
  );
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

/* 3D nightlife icons (images). Decorative, so hidden from screen readers. */
export function i3(name, size, cls, style) {
  return (
    <img
      src={IMAGES_3D[name]}
      alt=""
      aria-hidden
      draggable={false}
      className={'i3' + (cls ? ' ' + cls : '')}
      style={Object.assign({ width: size + 'px', height: size + 'px' }, style || {})}
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

export function friendsTxt(n) {
  return <span className="friends-txt">{n === 1 ? '1 friend going' : n + ' friends going'}</span>;
}

export function note(t) {
  return <p className="note">{t || 'Crowd and friends are sample data until the live feed exists.'}</p>;
}

export function fav(name, size) {
  var f = FRIEND_SHAPE[name] || ['circle', 'violet'];
  return <ShapeAvatar key={name} shape={f[0]} hue={f[1]} name={name} size={size || 40} className="no-cap" />;
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

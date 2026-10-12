export function loadScript(src) {
  return new Promise((ok, no) => {
    if (document.querySelector('script[src="' + src + '"]')) return ok();
    var s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => {
      ok();
    };
    s.onerror = () => {
      no(new Error('Could not load ' + src));
    };
    document.head.appendChild(s);
  });
}

export function store(k, v) {
  try {
    if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null');
    if (v === null) localStorage.removeItem(k);
    else localStorage.setItem(k, JSON.stringify(v));
  } catch (e) {
    return null;
  }
}

export function okEmail(x) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((x || '').trim());
}

export function shareToast(r, what) {
  return r === 'shared'
    ? null
    : r === 'copied'
      ? what + ' copied. Paste it anywhere'
      : r === 'saved'
        ? 'Saved to your downloads'
        : null;
}

/* "Rahul’s", "Kukoo Nights’" */
export function poss(name) {
  return name + (/s$/i.test(name) ? '’' : '’s');
}

/* A gathr token's value (e.g. token('brand') -> '#531aff'), for places that can't read CSS variables:
   canvas drawing, the map style and the payment sheet */
export function token(name) {
  var v = getComputedStyle(document.documentElement).getPropertyValue('--' + name).trim();
  return /^var\(--([\w-]+)\)$/.test(v) ? token(v.slice(6, -1)) : v;
}

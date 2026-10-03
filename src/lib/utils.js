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

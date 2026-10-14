/* @ds-bundle: {"format":4,"namespace":"Gathr","components":[{"name":"Wordmark"},{"name":"Icon"},{"name":"Button"},{"name":"IconButton"},{"name":"Chip"},{"name":"SearchField"},{"name":"Badge"},{"name":"CrowdMeter"},{"name":"Avatar"},{"name":"FriendsGoing"},{"name":"ProgressBar"},{"name":"PageIndicator"},{"name":"Bloom"},{"name":"TopBar"},{"name":"TabBar"},{"name":"Sheet"},{"name":"VenueHero"},{"name":"VenueCard"},{"name":"FeatureCard"},{"name":"RankCard"},{"name":"EventCard"},{"name":"EventRow"},{"name":"MapPin"},{"name":"VibeTag"},{"name":"PhotoFrame"},{"name":"PillChain"},{"name":"StatBubbles"},{"name":"DotGrid"},{"name":"SocialSlide"},{"name":"EventPoster"},{"name":"SiteHeader"},{"name":"Sticker"},{"name":"MoodTile"},{"name":"RingAvatar"},{"name":"TagPill"},{"name":"ReactionBubble"},{"name":"CommentBubble"},{"name":"StoryCard"},{"name":"CardDeck"},{"name":"PhotoStack"},{"name":"Ticket"},{"name":"EchoPattern"},{"name":"DoorVerdict"},{"name":"NightTile"},{"name":"NightRail"},{"name":"GroupPill"}]} */
(function () {
  var React = window.React;
  var h = React.createElement;
  var ICONS = {"moon": "<path d=\"M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401\"/>", "map": "<path d=\"M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z\"/> <path d=\"M15 5.764v15\"/> <path d=\"M9 3.236v15\"/>", "search": "<path d=\"m21 21-4.34-4.34\"/> <circle cx=\"11\" cy=\"11\" r=\"8\"/>", "calendar": "<path d=\"M8 2v3\"/> <path d=\"M16 2v3\"/> <rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/> <path d=\"M3 9h18\"/>", "user": "<path d=\"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2\"/> <circle cx=\"12\" cy=\"7\" r=\"4\"/>", "map-pin": "<path d=\"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0\"/> <circle cx=\"12\" cy=\"10\" r=\"3\"/>", "users": "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/> <path d=\"M16 3.128a4 4 0 0 1 0 7.744\"/> <path d=\"M22 21v-2a4 4 0 0 0-3-3.87\"/> <circle cx=\"9\" cy=\"7\" r=\"4\"/>", "clock": "<circle cx=\"12\" cy=\"12\" r=\"10\"/> <path d=\"M12 6v6l4 2\"/>", "navigation": "<polygon points=\"3 11 22 2 13 21 11 13 3 11\"/>", "heart": "<path d=\"M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5\"/>", "arrow-right": "<path d=\"M5 12h14\"/> <path d=\"m12 5 7 7-7 7\"/>", "arrow-up-right": "<path d=\"M7 7h10v10\"/> <path d=\"M7 17 17 7\"/>", "ticket": "<path d=\"M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z\"/> <path d=\"M13 5v2\"/> <path d=\"M13 17v2\"/> <path d=\"M13 11v2\"/>", "music-2": "<circle cx=\"8\" cy=\"18\" r=\"4\"/> <path d=\"M12 18V2l7 4\"/>", "sparkles": "<path d=\"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z\"/> <path d=\"M20 2v4\"/> <path d=\"M22 4h-4\"/> <circle cx=\"4\" cy=\"20\" r=\"2\"/>", "x": "<path d=\"M18 6 6 18\"/> <path d=\"m6 6 12 12\"/>", "chevron-right": "<path d=\"m9 18 6-6-6-6\"/>", "car": "<path d=\"M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2\"/> <circle cx=\"7\" cy=\"17\" r=\"2\"/> <path d=\"M9 17h6\"/> <circle cx=\"17\" cy=\"17\" r=\"2\"/>", "bookmark": "<path d=\"M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z\"/>", "share": "<path d=\"M12 2v13\"/> <path d=\"m16 6-4-4-4 4\"/> <path d=\"M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8\"/>", "arrow-left": "<path d=\"m12 19-7-7 7-7\"/> <path d=\"M19 12H5\"/>", "bell": "<path d=\"M10.268 21a2 2 0 0 0 3.464 0\"/> <path d=\"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326\"/>", "sliders-horizontal": "<path d=\"M10 5H3\"/> <path d=\"M12 19H3\"/> <path d=\"M14 3v4\"/> <path d=\"M16 17v4\"/> <path d=\"M21 12h-9\"/> <path d=\"M21 19h-5\"/> <path d=\"M21 5h-7\"/> <path d=\"M8 10v4\"/> <path d=\"M8 12H3\"/>", "play": "<path d=\"M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z\"/>", "image": "<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" ry=\"2\"/> <circle cx=\"9\" cy=\"9\" r=\"2\"/> <path d=\"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21\"/>"};
  var uid = 0;
  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(' '); }
  function rest(p, keys) { var o = {}; for (var k in p) if (keys.indexOf(k) < 0) o[k] = p[k]; return o; }
  /* hue helpers: -300 fills take dark text; violet and blue fills use -500 with white text */
  var DARK_ON = { yellow: 1, green: 1, pink: 1, red: 1 };
  function fillOf(hue) { return DARK_ON[hue] ? 'var(--' + hue + '-300)' : 'var(--' + hue + '-500)'; }
  /* v8: shiny same-hue gradients for expression fills and selected states */
  function shineOf(hue) { return 'var(--shine-' + hue + ')'; }
  function textOn(hue) { return DARK_ON[hue] ? 'var(--night-900)' : 'var(--white)'; }

  var CROWD = {
    /* v18: the scale is about bookings against a verified cap, never the vibe */
    quiet: { n: 1, label: 'Early', line: 'Few booked yet. Plenty of room' },
    warming: { n: 2, label: 'Filling up', line: 'Easy to get in' },
    buzzing: { n: 3, label: 'Buzzing', line: 'Good crowd. Short wait at the door' },
    packed: { n: 4, label: 'Packed', line: 'Peak night. Expect a queue' },
    full: { n: 5, label: 'Full', line: 'Sold out. Only list and pass holders get in' }
  };
  /* thresholds on the share of the verified cap that is booked */
  function crowdLevel(booked, cap) {
    if (!cap) return null;
    var r = booked / cap;
    return r >= 1 ? 'full' : r >= 0.85 ? 'packed' : r >= 0.6 ? 'buzzing' : r >= 0.25 ? 'warming' : 'quiet';
  }
  function fmtNum(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  /* the booking block: eyebrow, level word, 60-dot grid (1 dot = 1/60 of the cap, lit from the bottom), the count */
  function CrowdBlock(p) {
    var cap = p.cap, booked = p.booked || 0;
    var lv = crowdLevel(booked, cap) || (CROWD[p.level] ? p.level : 'quiet'), c = CROWD[lv];
    if (cap == null && p.booked != null) {
      return h('div', { className: 'g-cb is-nocap' },
        h('span', { className: 'g-cb-eyebrow' }, p.eyebrow || 'Booked so far'),
        h('b', { className: 'g-cb-word' }, fmtNum(booked)),
        h('span', { className: 'g-cb-line' }, 'booked tonight'));
    }
    var lit = cap ? Math.min(60, Math.round(booked / cap * 60)) : c.n * 12;
    var dots = [];
    for (var i = 0; i < 60; i++) { var row = Math.floor(i / 10), col = i % 10, idx = (5 - row) * 10 + col; dots.push(h('i', { key: i, className: idx < lit ? 'is-on' : null })); }
    var showCount = cap && booked >= (p.revealAt == null ? 50 : p.revealAt);
    return h('div', { className: cx('g-cb', 'g-cm-' + lv), role: 'img', 'aria-label': 'Booked so far: ' + c.label + '. ' + (showCount ? booked + ' of ' + cap + ' spots booked.' : c.line) },
      h('span', { className: 'g-cb-eyebrow', 'aria-hidden': 'true' }, p.eyebrow || 'Booked so far'),
      h('b', { className: 'g-cb-word', 'aria-hidden': 'true' }, c.label),
      h('span', { className: 'g-cb-dots', 'aria-hidden': 'true' }, dots),
      h('span', { className: 'g-cb-line', 'aria-hidden': 'true' }, showCount ? [h('b', { key: 'n' }, fmtNum(booked) + ' of ' + fmtNum(cap)), ' spots booked'] : c.line));
  }
  var LEVELS = ['quiet', 'warming', 'buzzing', 'packed', 'full'];

  /* ---------- Brand ---------- */
  var LOGO_VB = '39 -757 2505.4 977', LOGO_PATHS = '<path transform="translate(0 0) scale(1 -1)" d="M325 -220Q264 -220 212.0 -200.0Q160 -180 122.5 -144.5Q85 -109 68 -61L190 -15Q202 -53 237.5 -76.5Q273 -100 325 -100Q365 -100 395.5 -85.0Q426 -70 443.0 -41.5Q460 -13 460 27V151L485 121Q457 72 410.0 47.0Q363 22 303 22Q227 22 167.0 57.0Q107 92 73.0 153.0Q39 214 39 290Q39 367 73.0 427.0Q107 487 166.0 521.5Q225 556 300 556Q361 556 407.5 530.5Q454 505 485 457L467 424V544H591V27Q591 -44 556.5 -100.0Q522 -156 462.5 -188.0Q403 -220 325 -220ZM319 143Q361 143 392.5 161.5Q424 180 442.0 213.0Q460 246 460 289Q460 331 441.5 364.5Q423 398 391.5 417.0Q360 436 319 436Q278 436 245.0 417.0Q212 398 193.5 364.5Q175 331 175 289Q175 247 193.5 214.0Q212 181 244.5 162.0Q277 143 319 143Z"/><path transform="translate(592.0 0) scale(1 -1)" d="M226 -12Q169 -12 127.0 7.0Q85 26 62.0 61.5Q39 97 39 144Q39 189 59.0 224.5Q79 260 121.0 284.0Q163 308 227 318L405 347V247L252 221Q213 214 194.0 196.0Q175 178 175 149Q175 121 196.5 104.5Q218 88 250 88Q291 88 322.5 105.5Q354 123 371.5 154.0Q389 185 389 222V362Q389 397 361.5 420.5Q334 444 289 444Q247 444 214.5 421.5Q182 399 167 362L60 414Q76 457 110.5 488.5Q145 520 192.0 538.0Q239 556 294 556Q361 556 412.0 531.5Q463 507 491.5 463.5Q520 420 520 362V0H396V93L424 95Q403 60 374.0 36.5Q345 13 308.0 0.5Q271 -12 226 -12Z"/><path transform="translate(1112.0 0) scale(1 -1)" d="M309 -6Q217 -6 166.5 44.5Q116 95 116 187V427H22V544H32Q72 544 94.0 565.0Q116 586 116 626V668H247V544H372V427H247V194Q247 167 256.5 148.0Q266 129 286.5 119.0Q307 109 339 109Q346 109 355.5 110.0Q365 111 374 112V0Q360 -2 342.0 -4.0Q324 -6 309 -6Z"/><path transform="translate(1465.0 0) scale(1 -1)" d="M61 0V757H192V437L174 456Q193 505 236.5 530.5Q280 556 338 556Q398 556 444.5 530.0Q491 504 517.0 457.5Q543 411 543 350V0H412V319Q412 355 398.0 381.0Q384 407 359.5 421.5Q335 436 302 436Q270 436 245.0 421.5Q220 407 206.0 381.0Q192 355 192 319V0Z"/><path transform="translate(1998.0 0) scale(1 -1)" d="M61 0V544H184V423L174 441Q193 502 233.5 526.0Q274 550 331 550H363V434H316Q260 434 226.0 399.5Q192 365 192 303V0Z"/>', LOGO_DOT = { cx: 2462.5, cy: -69.9, r: 81.9 };
  function Wordmark(p) {
    var size = p.size || 32, tone = p.tone || 'auto';
    var vb = LOGO_VB.split(' ').map(Number), w = size * vb[2] / vb[3];
    return h('svg', { className: cx('g-logo', 'g-logo-' + tone, p.className), style: p.style, width: w, height: size, viewBox: LOGO_VB, role: 'img', 'aria-label': 'gathr' },
      h('g', { className: 'g-logo-word', dangerouslySetInnerHTML: { __html: LOGO_PATHS } }),
      h('circle', { className: 'g-logo-dot', cx: LOGO_DOT.cx, cy: LOGO_DOT.cy, r: LOGO_DOT.r }));
  }

  /* v13.1: Lucide has no filled style, so gathr builds solid versions from the same Lucide geometry: the outline is filled and its inner details are cut out as holes (an SVG mask), so they work on any background */
  var iconUid = 0;
  function Icon(p) {
    var size = p.size || 20, body = ICONS[p.name] || '';
    if (p.filled && FILLED_ICONS[p.name]) body = FILLED_ICONS[p.name].split('{M}').join('gim' + (++iconUid));
    return h('svg', {
      className: cx('g-icon', p.filled && FILLED_ICONS[p.name] && 'is-filled', p.className), width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
      stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round',
      role: p.label ? 'img' : undefined, 'aria-label': p.label, 'aria-hidden': p.label ? undefined : 'true',
      dangerouslySetInnerHTML: { __html: body }
    });
  }

  /* ---------- Actions ---------- */
  function Button(p) {
    var variant = p.variant || 'primary', size = p.size || 'md';
    var o = rest(p, ['variant', 'size', 'icon', 'iconRight', 'block', 'className', 'children']);
    var is = size === 'sm' ? 16 : 20;
    return h('button', Object.assign({ type: 'button' }, o, {
      className: cx('g-btn', 'g-btn-' + variant, 'g-btn-' + size, p.block && 'g-btn-block', p.className)
    }), p.icon ? h(Icon, { name: p.icon, size: is }) : null, h('span', null, p.children), p.iconRight ? h(Icon, { name: p.iconRight, size: is }) : null);
  }

  function IconButton(p) {
    var o = rest(p, ['variant', 'icon', 'label', 'size', 'className', 'active']);
    return h('button', Object.assign({ type: 'button', 'aria-label': p.label }, o, {
      className: cx('g-ibtn', 'g-ibtn-' + (p.variant || 'glass'), p.active && 'is-active', p.className),
      style: p.size ? { width: p.size + 'px', height: p.size + 'px' } : undefined
    }), h(Icon, { name: p.icon, size: 24, filled: !!p.active }));
  }

  function Chip(p) {
    var o = rest(p, ['selected', 'icon', 'className', 'children']);
    return h('button', Object.assign({ type: 'button', 'aria-pressed': !!p.selected }, o, {
      className: cx('g-chip', p.selected && 'is-selected', p.className)
    }), p.icon ? h(Icon, { name: p.icon, size: 16 }) : null, h('span', null, p.children));
  }

  function SearchField(p) {
    var o = rest(p, ['className', 'placeholder']);
    return h('label', { className: cx('g-search', p.className) },
      h(Icon, { name: 'search', size: 20 }),
      h('input', Object.assign({ type: 'search', placeholder: p.placeholder || 'Search venues, artists, areas' }, o)));
  }

  /* ---------- Status ---------- */
  function Badge(p) {
    /* v14: solid = a same-hue gradient fill and gradient outline with a darker shade of the hue as text; tint = a dark tinted fill with a lighter shade of the hue as text */
    var tone = p.tone || 'neutral';
    return h('span', { className: cx('g-badge', 'g-badge-' + tone, p.look === 'tint' && 'g-badge-tint', p.className) },
      p.live ? h('span', { className: 'g-live-dot', 'aria-hidden': 'true' }) : null, p.children);
  }


  function CrowdMeter(p) {
    /* v14.2: five crowd bars, grey, green, yellow, red. Row = bars only; widget = a soft glass card */
    var lv = crowdLevel(p.booked, p.cap) || (CROWD[p.level] ? p.level : 'quiet'), c = CROWD[lv], n = c.n;
    var segs = LEVELS.map(function (l, i) {
      var cls = i < n - 1 ? 'is-on' : (i === n - 1 ? (n === 5 ? 'is-on' : 'is-live') : null);
      return h('span', { key: l, className: cx('g-cm-seg', cls) });
    });
    var cell = h('span', { className: 'g-cm-cell', 'aria-hidden': 'true' }, segs);
    var label = 'Crowd: ' + c.label + '. ' + (p.line || c.line);
    if (p.variant === 'widget') {
      return h('div', { className: cx('g-cm-widget2', p.className) }, h(CrowdBlock, { booked: p.booked, cap: p.cap, level: lv, eyebrow: p.eyebrow, revealAt: p.revealAt }),
        p.updated ? h('span', { className: 'g-cb-trust' }, h(Icon, { name: 'info', size: 16 }), 'Bookings on gathr. Cap verified by gathr. ' + p.updated) : null);
    }
    return h('div', { className: cx('g-cm', 'g-crowd', 'g-cm-' + lv, p.glass && 'is-glass', p.compact && 'is-compact', p.className), role: 'img', 'aria-label': label },
      cell,
      h('span', { className: 'g-cm-words', 'aria-hidden': 'true' }, h('b', null, c.label), p.compact ? null : h('span', null, p.line || c.line)));
  }


  /* Avatar: the person's display picture; agnostic silhouette when they have none */
  function initials(n) {
    var w = String(n || '').trim().split(/\s+/).filter(Boolean);
    return w.length ? (w[0][0] + (w.length > 1 ? w[w.length - 1][0] : '')).toUpperCase() : '';
  }

  function Avatar(p) {
    var size = p.size || 28;
    var face = h('span', { className: cx('g-avatar', !p.image && 'g-avatar-empty', !p.sticker && p.className), style: { width: size + 'px', height: size + 'px' }, title: p.name },
      p.image ? h('img', { src: p.image, alt: p.name || '', loading: 'lazy' }) : h('span', { className: 'g-avatar-initials', style: { fontSize: Math.round(size * 0.4) + 'px' } }, initials(p.name)));
    if (!p.sticker) return face;
    /* the vibe sticker: the person's chosen 3D object tucked on the bottom-right corner */
    var ss = Math.round(size * 0.52);
    return h('span', { className: cx('g-avatar-wrap', p.className), style: { width: size + 'px', height: size + 'px' } }, face,
      h('img', { className: 'g-avatar-sticker', src: p.sticker, alt: '', style: { width: ss + 'px', height: ss + 'px', right: Math.round(-size * 0.14) + 'px', bottom: Math.round(-size * 0.08) + 'px' } }));
  }

  function FriendsGoing(p) {
    var people = p.people || (p.names || []).map(function (n) { return { name: n }; });
    var total = p.total != null ? p.total : people.length;
    return h('div', { className: cx('g-friends', p.className) },
      h('span', { className: 'g-avatars', 'aria-hidden': 'true' }, people.slice(0, 3).map(function (f, i) {
        return h(Avatar, { key: i, name: f.name, image: f.image, sticker: f.sticker, size: 28 });
      })),
      h('span', { className: 'g-friends-text' }, friendsText(people, total, p.verb)));
  }
  function friendsText(people, total, verb) {
    if (verb !== 'booked') return total === 1 ? ((people[0] && people[0].name) + ' is going') : (total + ' friends going');
    var named = people.slice(0, 2).map(function (f) { return f.name; }).filter(Boolean);
    if (!named.length) return total + ' friends booked';
    var rest = total - named.length;
    return named.join(', ') + (rest > 0 ? ' + ' + rest + (rest === 1 ? ' friend' : ' friends') : '') + ' booked';
  }

  function ProgressBar(p) {
    var step = p.step || 1, total = p.total || 4;
    return h('div', { className: cx('g-progress', p.className), role: 'progressbar', 'aria-valuemin': 1, 'aria-valuemax': total, 'aria-valuenow': step, 'aria-label': 'Step ' + step + ' of ' + total },
      h('span', { style: { width: (step / total * 100) + '%' } }));
  }

  function PageIndicator(p) {
    var n = p.count || 4, a = p.active || 0, out = [];
    for (var i = 0; i < n; i++) out.push(h('span', { key: i, className: cx('g-pager-seg', i === a && 'is-active') }));
    return h('div', { className: cx('g-pager', p.className), role: 'img', 'aria-label': 'Item ' + (a + 1) + ' of ' + n }, out);
  }

  /* ---------- Chrome (glass) ---------- */
  var RECIPES = { peak: 1, uv: 1, sundowner: 1, comedown: 1 };
  function Bloom(p) {
    var r = RECIPES[p.recipe] ? p.recipe : 'uv';
    return h('div', { className: cx('g-bloom', 'g-bloom-' + r, 'g-bloom-at-' + (p.at || 'bottom'), p.still && 'is-still', p.className), 'aria-hidden': 'true', style: p.style },
      h('span', { className: 'g-bloom-body' }),
      h('span', { className: 'g-grain' }));
  }

  function TopBar(p) {
    return h('header', { className: cx('g-topbar', p.glass && 'g-topbar-glass', p.className) },
      p.back ? h(IconButton, { icon: 'arrow-left', label: 'Back' }) : (p.avatar ? h(Avatar, { name: p.avatar, image: p.avatarImage, size: 48, className: 'g-topbar-avatar' }) : h(Wordmark, { size: 26 })),
      p.title ? h('span', { className: 'g-topbar-title' }, p.title) : h('span', { style: { flex: 1 } }),
      h('span', { className: 'g-topbar-actions' }, (p.actions || [['search', 'Search'], ['bell', 'Notifications']]).map(function (a) {
        return h(IconButton, { key: a[0], icon: a[0], label: a[1] });
      })));
  }

  var TABS = [['tonight', 'moon', 'Tonight'], ['map', 'map', 'Map'], ['search', 'search', 'Search'], ['plans', 'calendar', 'Plans'], ['you', 'user', 'You']];
  function TabBar(p) {
    /* v14: liquid glass bar; a violet pill slides to the active tab with a spring and the icon pops in filled */
    var active = p.active || 'tonight', idx = Math.max(0, TABS.map(function (t) { return t[0]; }).indexOf(active));
    return h('nav', { className: cx('g-tabbar', p.className), 'aria-label': 'Main', style: { '--i': idx } },
      h('span', { className: 'g-tab-ind', 'aria-hidden': 'true' }),
      TABS.map(function (t) {
        var on = active === t[0];
        return h('button', { key: t[0], type: 'button', className: cx('g-tab', on && 'is-active'), 'aria-label': t[2], 'aria-current': on ? 'page' : undefined, onClick: p.onChange ? function () { p.onChange(t[0]); } : undefined },
          h(Icon, { key: on ? 'on' : 'off', name: t[1], size: 24, filled: on }));
      }));
  }


  function Sheet(p) {
    return h('section', { className: cx('g-sheet', p.className), role: 'dialog', 'aria-label': p.title },
      h('span', { className: 'g-grabber', 'aria-hidden': 'true' }),
      h('header', { className: 'g-sheet-head' },
        h('div', null, h('h2', { className: 'g-sheet-title' }, p.title), p.subtitle ? h('p', { className: 'g-sheet-sub' }, p.subtitle) : null),
        h(IconButton, { icon: 'x', label: 'Close', onClick: p.onClose })),
      h('div', { className: 'g-sheet-body' }, p.children));
  }

  /* ---------- Content ---------- */
  function Media(p) {
    var ph = !p.image && (p.neutral ? 'g-media-empty' : 'g-media-ph');
    return h('div', { className: cx('g-media', ph, p.className), style: Object.assign({ '--ph': 'var(--' + (p.hue || 'violet') + '-500)' }, p.image ? { backgroundImage: 'url(' + p.image + ')' } : null, p.style) },
      !p.image && p.neutral ? h('span', { className: 'g-media-icon', 'aria-hidden': 'true' }, h(Icon, { name: 'image', size: 28 }), p.label ? h('span', { className: 'g-media-label' }, p.label) : null) : null, p.children);
  }

  function VenueCard(p) {
    return h('article', { className: cx('g-card', 'g-venue', p.className) },
      h(Media, { image: p.image, neutral: true, className: 'g-venue-media' },
        h('div', { className: 'g-venue-top' },
          h('div', { className: 'g-venue-badges' },
            p.live ? h(Badge, { tone: 'now', live: true }, 'Live') : null,
            p.badge ? h(Badge, { tone: 'glass' }, p.badge) : null),
          h(IconButton, { icon: 'heart', label: p.saved ? 'Saved' : 'Save', active: p.saved, className: 'g-save' })),
        p.crowd ? h(CrowdMeter, { level: p.crowd, glass: true, compact: true }) : null),
      h('div', { className: 'g-venue-body' },
        /* v17: three rows, each a left/right pair on the same size: what + how much, where, who + when */
        h('div', { className: 'g-venue-head' }, h('h3', { className: 'g-venue-name' }, p.name), p.cover ? h('b', { className: 'g-price g-venue-cost' }, p.cover) : null),
        h('p', { className: 'g-venue-meta' }, [p.area, p.distance, (p.vibes || []).join(', ')].filter(Boolean).join(' · ')),
        h('div', { className: 'g-venue-foot' },
          p.friends || p.friendsPeople ? h(FriendsGoing, { names: p.friends, people: p.friendsPeople, total: p.friendsTotal }) : h('span'),
          p.doorTime ? h('span', { className: 'g-venue-door' }, h(Icon, { name: 'clock', size: 16 }), p.doorTime) : null)));
  }

  function FeatureCard(p) {
    /* Gradients are for occasions only: without occasion the card is image-led (the collection's lead image). */
    return h('article', { className: cx('g-feature', p.occasion ? 'is-occasion' : 'is-image', p.className), style: p.style },
      p.occasion ? h(Bloom, { recipe: p.recipe || 'sundowner', at: 'center' }) : h(Media, { image: p.image, neutral: true, label: 'Collection image', className: 'g-feature-media' }),
      h('div', { className: 'g-feature-copy' },
        p.kicker ? h('span', { className: 'g-feature-kicker' }, h(Icon, { name: p.kickerIcon || 'sparkles', size: 16 }), p.kicker) : null,
        h('h3', { className: 'g-feature-title' }, p.title),
        p.body ? h('p', { className: 'g-feature-body' }, p.body) : null,
        h('button', { type: 'button', className: 'g-feature-go' }, h(Icon, { name: p.actionIcon || 'arrow-right', size: 16 }), p.action || 'Open')));
  }

  function VenueHero(p) {
    /* v18: photo (or an occasion bloom), the name, then one card: booked so far on the left, facts on the right, a trust line, and the CTA */
    var rows = [
      p.cover ? { icon: 'ticket', label: p.coverNote ? p.coverNote.charAt(0).toUpperCase() + p.coverNote.slice(1) : 'Cover', value: p.cover, strong: true } : null,
      p.doorTime ? { icon: 'clock', label: /^till\s/i.test(p.doorTime) ? 'Open till' : 'Open', value: p.doorTime.replace(/^till\s+/i, '') } : null,
      p.music ? { icon: 'music-2', label: 'Music', value: p.music } : null,
      p.distance ? { icon: 'map-pin', label: 'Distance', value: p.distance } : null
    ].filter(Boolean).slice(0, 4);
    return h('section', { className: cx('g-vhero', 'g-vh2', p.occasion ? 'is-occasion' : 'is-image', p.className) },
      h('div', { className: 'g-vh2-media' }, p.occasion ? h(Bloom, { recipe: p.recipe || 'peak', at: 'center' }) : h(Media, { image: p.image, neutral: true, label: 'Venue photo' }), h('span', { className: 'g-vh2-fade', 'aria-hidden': 'true' })),
      h('div', { className: 'g-vh2-top' }, h(IconButton, { icon: 'arrow-left', label: 'Back' }), h(IconButton, { icon: 'heart', label: 'Save', active: p.saved })),
      h('div', { className: 'g-vh2-head' },
        h('h1', { className: 'g-vh2-name' }, p.name, p.occasion ? h('span', { className: 'g-stop' }, '.') : null),
        h('p', { className: 'g-vh2-sub' }, [p.area, p.vibe].filter(Boolean).join(' · '))),
      h('div', { className: 'g-vh2-card' },
        h(CrowdBlock, { booked: p.booked, cap: p.cap, level: p.crowd }),
        h(FactList, { rows: rows, bare: true }),
        h('p', { className: 'g-cb-trust' }, h(Icon, { name: 'info', size: 16 }), h('span', null, 'Based on ', h('b', null, 'bookings on gathr'), p.cap ? ['. Cap of ' + fmtNum(p.cap) + ' ', h('b', { key: 'v' }, 'verified by gathr')] : null, '. Packed means 85% or more is booked.' + (p.updated ? ' Updated ' + p.updated : '')))),
      h('div', { className: 'g-vh2-cta' }, h(Button, { variant: p.actionVariant || 'brand', size: 'lg', block: true, icon: p.actionDisabled ? 'lock' : 'ticket', disabled: !!p.actionDisabled, 'aria-disabled': p.actionDisabled ? 'true' : undefined }, p.action || 'Get passes')));
  }

  /* FactList: labelled rows with an icon circle; one label size (13) and one value size (16) */
  function FactList(p) {
    var list = h('div', { className: 'g-facts' }, (p.rows || []).map(function (r, i) {
      return h('div', { key: i, className: 'g-fact' }, h('span', { className: 'g-fact-ic' }, h(Icon, { name: r.icon || 'circle', size: 16 })), h('span', { className: 'g-fact-label' }, r.label), h('span', { className: cx('g-fact-value', r.strong && 'is-strong') }, r.value));
    }));
    if (p.bare) return list;
    return h('section', { className: cx('g-factcard', p.className) }, p.title ? h('h2', { className: 'g-factcard-title' }, p.title) : null, list, p.note ? h('p', { className: 'g-factcard-note' }, p.note) : null);
  }

  /* TonightSoFar: the social proof below the fold — booked, saved, pace, friends */
  function TonightSoFar(p) {
    var stats = [[p.booked, 'booked'], [p.saved, 'saved'], [p.lastHour != null ? '+' + p.lastHour : null, 'in the last hour']].filter(function (x) { return x[0] != null; });
    return h('section', { className: cx('g-tsf', p.className) },
      h('h2', { className: 'g-factcard-title' }, p.title || 'Tonight so far'),
      h('div', { className: 'g-tsf-stats' }, stats.map(function (x, i) { return h('div', { key: i, className: 'g-tsf-stat' }, h('b', null, typeof x[0] === 'number' ? fmtNum(x[0]) : x[0]), h('span', null, x[1])); })),
      p.friends || p.friendsPeople ? h('div', { className: 'g-tsf-friends' }, h(FriendsGoing, { names: p.friends, people: p.friendsPeople, total: p.friendsTotal, verb: 'booked' })) : null);
  }

  function RankCard(p) {
    var hue = p.hue || 'violet';
    return h('article', { className: cx('g-rank', p.className) },
      h('span', { className: 'g-rank-num', 'aria-hidden': 'true' }, p.rank),
      h(Media, { image: p.image, neutral: true, className: 'g-rank-media' }),
      h('div', { className: 'g-rank-copy' },
        h('h3', { className: 'g-rank-title' }, h('span', { className: 'g-sr' }, '#' + p.rank + ' '), p.title),
        h('p', { className: 'g-rank-sub' }, p.subtitle),
        h('button', { type: 'button', className: 'g-rank-btn' }, p.action || 'View')));
  }

  /* EventCard: an image-first card for carousels. The photo fades into black at the bottom (a scrim, not a bloom); copy and one light CTA sit inside. */
  function EventCard(p) {
    return h('article', { className: cx('g-ecard', p.className), style: p.style },
      h(Media, { image: p.image, neutral: true, label: 'Organiser image · 4:5', className: 'g-ecard-media' }),
      /* the gathr touch: brand grain film + fade into night + a 1px light edge, over any organiser image */
      p.image ? h('span', { className: 'g-grain g-ecard-grain', 'aria-hidden': 'true' }) : null,
      h('span', { className: 'g-ecard-fade', 'aria-hidden': 'true' }),
      p.badge ? h('div', { className: 'g-ecard-top' }, h(Badge, { tone: p.badgeTone || 'now', live: p.live }, p.badge)) : null,
      h('div', { className: 'g-ecard-copy' },
        p.kicker ? h('span', { className: 'g-ecard-kicker' }, p.kicker) : null,
        h('h3', { className: 'g-ecard-title' }, p.title),
        p.meta ? h('p', { className: 'g-ecard-meta' }, p.meta) : null,
        h('button', { type: 'button', className: 'g-ecard-cta' }, p.action || 'Get on the list')));
  }

  function EventRow(p) {
    var st = { soldout: ['limit', 'Sold out'], filling: ['neutral', 'Filling fast'], onlist: ['go', 'On the list'] }[p.status];
    return h('div', { className: cx('g-event', p.className) },
      h(Media, { image: p.image, neutral: true, className: 'g-event-thumb' }),
      h('div', { className: 'g-event-main' },
        h('div', { className: 'g-event-title' }, p.title),
        h('div', { className: 'g-event-meta' }, [p.day && p.time ? p.day + ' ' + p.time : p.time, p.venue, p.price].filter(Boolean).join(' · '))),
      st ? h(Badge, { tone: st[0] }, st[1]) : h(IconButton, { variant: 'solid', icon: 'chevron-right', label: 'Open', size: 40 }));
  }

  function MapPin(p) {
    var c = CROWD[p.level] || CROWD.quiet;
    return h('div', { className: cx('g-pin', p.selected && 'is-selected', p.className), role: 'img', 'aria-label': (p.label || '') + ', ' + c.label },
      h('span', { className: 'g-pin-tile' },
        p.sticker ? h('img', { className: 'g-pin-sticker', src: p.sticker, alt: '' }) : h(Icon, { name: p.icon || 'music-2', size: 20 })),
      h('span', { className: 'g-pin-tail' }),
      p.showLabel === false ? null : h('span', { className: 'g-pin-label' },
        p.label ? h('b', null, p.label) : null,
        h('span', { className: 'g-pin-crowd' }, h('i', { style: { background: 'var(--crowd-' + (p.level || 'quiet') + ')' } }), c.label)));
  }

  /* ---------- Expression ---------- */
  function VibeTag(p) {
    var hue = p.hue || 'yellow';
    return h('span', { className: cx('g-vibe', 'g-vibe-' + (p.tail || 'left'), p.className), style: { backgroundColor: fillOf(hue), backgroundImage: shineOf(hue), color: textOn(hue), transform: p.tilt ? 'rotate(' + p.tilt + 'deg)' : undefined, '--vibe': fillOf(hue) } }, p.children);
  }

  function PhotoFrame(p) {
    return h(Media, { image: p.image, neutral: true, className: cx('g-photo', p.className), style: Object.assign({ width: (p.width || 150) + 'px', height: (p.height || 120) + 'px', transform: 'rotate(' + (p.tilt || 0) + 'deg)' }, p.style) });
  }

  function PillChain(p) {
    return h('div', { className: cx('g-chain', p.className), style: p.scale ? { fontSize: (p.scale * 16) + 'px' } : null }, (p.rows || []).map(function (row, r) {
      return h('div', { key: r, className: 'g-chain-row' }, row.map(function (s, i) {
        if (s.echo) {
          /* echo: a trail of small overlapping pills, fading out (no dots) */
          return h('span', { key: i, className: 'g-chain-echo', 'aria-hidden': 'true' }, [1, 0.75, 0.5, 0.3].map(function (o, j) {
            return h('span', { key: j, style: { background: 'var(--' + s.echo + '-300)', opacity: o } });
          }));
        }
        var tone = s.tone || 'white';
        var st = tone === 'white' ? { background: 'var(--night-50)', color: 'var(--night-950)' } : tone === 'outline' ? { boxShadow: 'inset 0 0 0 0.12em var(--night-50)', color: 'var(--night-50)' } : { backgroundColor: fillOf(tone), backgroundImage: shineOf(tone), color: textOn(tone) };
        return h('span', { key: i, className: cx('g-chain-pill', (s.arrow || s.round) && 'g-chain-round'), style: st }, s.arrow ? h(Icon, { name: 'arrow-right', size: 20, className: 'g-chain-icon' }) : s.label);
      }));
    }));
  }

  function StatBubbles(p) {
    var items = p.items || [], max = Math.max.apply(null, items.map(function (i) { return i.value; }).concat([1]));
    var big = p.size || 200;
    return h('div', { className: cx('g-bubbles', p.className) }, items.map(function (it, i) {
      var d = Math.max(56, Math.round(big * Math.sqrt(it.value / max)));
      return h('div', { key: i, className: 'g-bubble-item' },
        h('span', { className: 'g-bubble', style: { width: d + 'px', height: d + 'px', backgroundColor: fillOf(it.hue || 'violet'), backgroundImage: shineOf(it.hue || 'violet'), color: textOn(it.hue || 'violet'), fontSize: Math.max(16, d * 0.28) + 'px' } }, it.display || it.value),
        it.label ? h('span', { className: 'g-bubble-label' }, it.label) : null);
    }));
  }

  function DotGrid(p) {
    var v = Math.round(p.value || 0), dots = [];
    for (var i = 0; i < 100; i++) dots.push(h('span', { key: i, style: { background: i < 100 - v ? 'var(--night-700)' : fillOf(p.hue || 'blue') } }));
    return h('figure', { className: cx('g-dotgrid', p.className) },
      h('div', { className: 'g-dots', 'aria-hidden': 'true' }, dots),
      h('figcaption', null, h('span', { className: 'g-dot-num' }, v + '%'), h('span', null, p.label)));
  }

  /* ---------- Social + print canvases ---------- */
  var PILLARS = { upgrade: ['The upgrade', 'green'], insider: ['The insider', 'yellow'], mirror: ['The mirror', 'pink'], standard: ['The standard', 'red'] };
  function Stop(p) { return h('span', { className: 'g-stop', style: p.color ? { color: p.color } : null }, '.'); }
  function SocialSlide(p) {
    var pl = PILLARS[p.pillar] || PILLARS.upgrade, hue = pl[1];
    var kind = p.kind || 'cover', fmt = p.format || 'post';
    var W = 1080, H = fmt === 'story' ? 1920 : 1350, s = p.scale || 0.3;
    var inner;
    if (kind === 'cover') {
      inner = h('div', { className: 'g-slide g-slide-cover', style: { width: W + 'px', height: H + 'px', transform: 'scale(' + s + ')' } },
        p.occasion ? h(Bloom, { recipe: { upgrade: 'comedown', insider: 'sundowner', mirror: 'uv', standard: 'peak' }[p.pillar] || 'uv', at: 'top', still: true }) : null,
        h('div', { className: 'g-slide-top' }, h(Wordmark, { size: 64, tone: 'light' }), h(VibeTag, { hue: hue, tilt: -4, tail: 'right', className: 'g-slide-tag' }, pl[0])),
        h('div', { className: 'g-slide-copy' },
          p.kicker ? h('span', { className: 'g-slide-accent', style: { color: 'var(--' + hue + '-300)' } }, p.kicker) : null,
          h('h2', { className: 'g-slide-head' }, p.headline, h(Stop))),
        h('div', { className: 'g-slide-foot' }, h('span', null, 'Swipe'), h(Icon, { name: 'arrow-right', size: 56 })));
    } else if (kind === 'end') {
      inner = h('div', { className: 'g-slide g-slide-end', style: { width: W + 'px', height: H + 'px', transform: 'scale(' + s + ')' } },
        p.occasion ? h(Bloom, { recipe: 'uv', at: 'top', still: true }) : null,
        h('div', { className: 'g-slide-copy' },
          h('span', { className: 'g-slide-accent' }, p.kicker || 'Before you go'),
          h('h2', { className: 'g-slide-head' }, p.headline, h(Stop))),
        h('div', { className: 'g-slide-foot' }, h('span', null, p.handle || ''), h(Wordmark, { size: 72, tone: 'light' })));
    } else {
      inner = h('div', { className: 'g-slide g-slide-body', style: { width: W + 'px', height: H + 'px', transform: 'scale(' + s + ')', backgroundColor: fillOf(hue), backgroundImage: shineOf(hue), color: textOn(hue) } },
        h('div', { className: 'g-slide-top' }, h('span', { className: 'g-slide-pillar' }, pl[0]), h('span', { className: 'g-slide-count' }, pad(p.index) + '/' + pad(p.total))),
        h('span', { className: 'g-slide-num' }, pad(p.index)),
        h('div', { className: 'g-slide-copy' },
          h('h2', { className: 'g-slide-head' }, p.headline, h(Stop, { color: 'var(--night-900)' })),
          p.body ? h('p', { className: 'g-slide-text' }, p.body) : null),
        h('div', { className: 'g-slide-foot' }, h('span'), h(Wordmark, { size: 52, tone: 'dark' })));
    }
    return h('div', { className: 'g-canvas', style: { width: W * s + 'px', height: H * s + 'px' } }, inner);
  }
  function pad(n) { n = n || 1; return n < 10 ? '0' + n : '' + n; }

  function EventPoster(p) {
    var hue = p.hue || 'violet', s = p.scale || 0.3, W = 1080, H = 1527;
    var alt = p.altHue || (hue === 'pink' ? 'yellow' : 'pink');
    return h('div', { className: 'g-canvas', style: { width: W * s + 'px', height: H * s + 'px' } },
      h('div', { className: 'g-poster', style: { width: W + 'px', height: H + 'px', transform: 'scale(' + s + ')' } },
        p.occasion ? h(Bloom, { recipe: p.recipe || 'peak', still: true }) : null,
        h('div', { className: 'g-poster-top' }, h(Wordmark, { size: 72, tone: 'light' }), h('span', { className: 'g-poster-accent' }, p.kicker || 'presents')),
        h('h2', { className: 'g-poster-name' }, p.name, p.occasion ? h(Stop) : null), /* organiser names keep their own spelling, no gathr stop */
        h(PillChain, { scale: 3.6, rows: [
          [{ label: p.series || 'episode 7', tone: 'white' }, { echo: hue }],
          [{ label: p.date, tone: hue }, { arrow: true, tone: alt }, { label: p.time, tone: hue }],
          [{ label: p.venue, tone: 'outline' }]
        ] }),
        p.support ? h('p', { className: 'g-poster-support' }, p.support) : null));
  }

  function SiteHeader(p) {
    return h('header', { className: cx('g-site', p.className) },
      h(Wordmark, { size: 28 }),
      h('nav', { className: 'g-site-links' }, (p.links || ['How it works', 'Tonight', 'For venues']).map(function (l) { return h('a', { key: l, href: '#' }, l); })),
      h(Button, { variant: 'primary', size: 'sm' }, p.cta || 'Get the app'));
  }


  /* ---------- v7 · Gen Z layer: stickers, tiles, story cards, collage ---------- */
  var MORE_ICONS = {
    'check': '<path d="M20 6 9 17l-5-5"/>',
    'message-circle': '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    'tag': '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
    'send': '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
    'star': '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>'
  };
  for (var mk in MORE_ICONS) ICONS[mk] = MORE_ICONS[mk];
  /* v13: the UI icon library is Lucide (lucide.dev, ISC licence). This curated set ships in the bundle; add any other Lucide icon by its exact name, never draw or mix icon sets */
  var LUCIDE_SET = {"house":"<path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\"/><path d=\"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/>","compass":"<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z\"/>","map":"<path d=\"M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z\"/><path d=\"M15 5.764v15\"/><path d=\"M9 3.236v15\"/>","map-pin":"<path d=\"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0\"/><circle cx=\"12\" cy=\"10\" r=\"3\"/>","navigation":"<polygon points=\"3 11 22 2 13 21 11 13 3 11\"/>","locate-fixed":"<line x1=\"2\" x2=\"5\" y1=\"12\" y2=\"12\"/><line x1=\"19\" x2=\"22\" y1=\"12\" y2=\"12\"/><line x1=\"12\" x2=\"12\" y1=\"2\" y2=\"5\"/><line x1=\"12\" x2=\"12\" y1=\"19\" y2=\"22\"/><circle cx=\"12\" cy=\"12\" r=\"7\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>","search":"<path d=\"m21 21-4.34-4.34\"/><circle cx=\"11\" cy=\"11\" r=\"8\"/>","arrow-left":"<path d=\"m12 19-7-7 7-7\"/><path d=\"M19 12H5\"/>","arrow-right":"<path d=\"M5 12h14\"/><path d=\"m12 5 7 7-7 7\"/>","arrow-up-right":"<path d=\"M7 7h10v10\"/><path d=\"M7 17 17 7\"/>","chevron-left":"<path d=\"m15 18-6-6 6-6\"/>","chevron-right":"<path d=\"m9 18 6-6-6-6\"/>","chevron-down":"<path d=\"m6 9 6 6 6-6\"/>","chevron-up":"<path d=\"m18 15-6-6-6 6\"/>","x":"<path d=\"M18 6 6 18\"/><path d=\"m6 6 12 12\"/>","menu":"<path d=\"M4 5h16\"/><path d=\"M4 12h16\"/><path d=\"M4 19h16\"/>","ellipsis":"<circle cx=\"12\" cy=\"12\" r=\"1\"/><circle cx=\"19\" cy=\"12\" r=\"1\"/><circle cx=\"5\" cy=\"12\" r=\"1\"/>","sliders-horizontal":"<path d=\"M10 5H3\"/><path d=\"M12 19H3\"/><path d=\"M14 3v4\"/><path d=\"M16 17v4\"/><path d=\"M21 12h-9\"/><path d=\"M21 19h-5\"/><path d=\"M21 5h-7\"/><path d=\"M8 10v4\"/><path d=\"M8 12H3\"/>","list-filter":"<path d=\"M2 5h20\"/><path d=\"M6 12h12\"/><path d=\"M9 19h6\"/>","music":"<path d=\"M9 18V5l12-2v13\"/><circle cx=\"6\" cy=\"18\" r=\"3\"/><circle cx=\"18\" cy=\"16\" r=\"3\"/>","music-2":"<circle cx=\"8\" cy=\"18\" r=\"4\"/><path d=\"M12 18V2l7 4\"/>","disc-3":"<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M6 12c0-1.7.7-3.2 1.8-4.2\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/><path d=\"M18 12c0 1.7-.7 3.2-1.8 4.2\"/>","headphones":"<path d=\"M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3\"/>","mic":"<path d=\"M12 19v3\"/><path d=\"M19 10v2a7 7 0 0 1-14 0v-2\"/><rect x=\"9\" y=\"2\" width=\"6\" height=\"13\" rx=\"3\"/>","mic-vocal":"<path d=\"m11 7.601-5.994 8.19a1 1 0 0 0 .1 1.298l.817.818a1 1 0 0 0 1.314.087L15.09 12\"/><path d=\"M16.5 21.174C15.5 20.5 14.372 20 13 20c-2.058 0-3.928 2.356-6 2-2.072-.356-2.775-3.369-1.5-4.5\"/><circle cx=\"16\" cy=\"7\" r=\"5\"/>","speaker":"<rect width=\"16\" height=\"20\" x=\"4\" y=\"2\" rx=\"2\"/><path d=\"M12 6h.01\"/><circle cx=\"12\" cy=\"14\" r=\"4\"/><path d=\"M12 14h.01\"/>","audio-lines":"<path d=\"M2 10v3\"/><path d=\"M6 6v11\"/><path d=\"M10 3v18\"/><path d=\"M14 8v7\"/><path d=\"M18 5v13\"/><path d=\"M22 10v3\"/>","guitar":"<path d=\"m11.9 12.1 4.514-4.514\"/><path d=\"M20.1 2.3a1 1 0 0 0-1.4 0l-1.114 1.114A2 2 0 0 0 17 4.828v1.344a2 2 0 0 1-.586 1.414A2 2 0 0 1 17.828 7h1.344a2 2 0 0 0 1.414-.586L21.7 5.3a1 1 0 0 0 0-1.4z\"/><path d=\"m6 16 2 2\"/><path d=\"M8.23 9.85A3 3 0 0 1 11 8a5 5 0 0 1 5 5 3 3 0 0 1-1.85 2.77l-.92.38A2 2 0 0 0 12 18a4 4 0 0 1-4 4 6 6 0 0 1-6-6 4 4 0 0 1 4-4 2 2 0 0 0 1.85-1.23z\"/>","drum":"<path d=\"m2 2 8 8\"/><path d=\"m22 2-8 8\"/><ellipse cx=\"12\" cy=\"9\" rx=\"10\" ry=\"5\"/><path d=\"M7 13.4v7.9\"/><path d=\"M12 14v8\"/><path d=\"M17 13.4v7.9\"/><path d=\"M2 9v8a10 5 0 0 0 20 0V9\"/>","party-popper":"<path d=\"M5.8 11.3 2 22l10.7-3.79\"/><path d=\"M4 3h.01\"/><path d=\"M22 8h.01\"/><path d=\"M15 2h.01\"/><path d=\"M22 20h.01\"/><path d=\"m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10\"/><path d=\"m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17\"/><path d=\"m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7\"/><path d=\"M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z\"/>","sparkles":"<path d=\"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z\"/><path d=\"M20 2v4\"/><path d=\"M22 4h-4\"/><circle cx=\"4\" cy=\"20\" r=\"2\"/>","martini":"<path d=\"M12 12 4.207 4.207A.707.707 0 0 1 4.707 3h14.586a.707.707 0 0 1 .5 1.207z\"/><path d=\"M12 12v10\"/><path d=\"M7 22h10\"/>","wine":"<path d=\"M8 22h8\"/><path d=\"M7 10h10\"/><path d=\"M12 15v7\"/><path d=\"M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z\"/>","beer":"<path d=\"M17 11h1a3 3 0 0 1 0 6h-1\"/><path d=\"M9 12v6\"/><path d=\"M13 12v6\"/><path d=\"M14 7.5c-1 0-1.44.5-3 .5s-2-.5-3-.5-1.72.5-2.5.5a2.5 2.5 0 0 1 0-5c.78 0 1.57.5 2.5.5S9.44 2 11 2s2 1.5 3 1.5 1.72-.5 2.5-.5a2.5 2.5 0 0 1 0 5c-.78 0-1.5-.5-2.5-.5Z\"/><path d=\"M5 8v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8\"/>","cup-soda":"<path d=\"m6 8 1.75 12.28a2 2 0 0 0 2 1.72h4.54a2 2 0 0 0 2-1.72L18 8\"/><path d=\"M5 8h14\"/><path d=\"M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0\"/><path d=\"m12 8 1-6h2\"/>","coffee":"<path d=\"M10 2v2\"/><path d=\"M14 2v2\"/><path d=\"M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1\"/><path d=\"M6 2v2\"/>","utensils":"<path d=\"M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2\"/><path d=\"M7 2v20\"/><path d=\"M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7\"/>","pizza":"<path d=\"m12 14-1 1\"/><path d=\"m13.75 18.25-1.25 1.42\"/><path d=\"M17.775 5.654a15.68 15.68 0 0 0-12.121 12.12\"/><path d=\"M18.8 9.3a1 1 0 0 0 2.1 7.7\"/><path d=\"M21.964 20.732a1 1 0 0 1-1.232 1.232l-18-5a1 1 0 0 1-.695-1.232A19.68 19.68 0 0 1 15.732 2.037a1 1 0 0 1 1.232.695z\"/>","moon":"<path d=\"M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401\"/>","sun":"<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2\"/><path d=\"M12 20v2\"/><path d=\"m4.93 4.93 1.41 1.41\"/><path d=\"m17.66 17.66 1.41 1.41\"/><path d=\"M2 12h2\"/><path d=\"M20 12h2\"/><path d=\"m6.34 17.66-1.41 1.41\"/><path d=\"m19.07 4.93-1.41 1.41\"/>","sunset":"<path d=\"M12 10V2\"/><path d=\"m4.93 10.93 1.41 1.41\"/><path d=\"M2 18h2\"/><path d=\"M20 18h2\"/><path d=\"m19.07 10.93-1.41 1.41\"/><path d=\"M22 22H2\"/><path d=\"m16 6-4 4-4-4\"/><path d=\"M16 18a4 4 0 0 0-8 0\"/>","star":"<path d=\"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z\"/>","flame":"<path d=\"M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4\"/>","zap":"<path d=\"M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z\"/>","ticket":"<path d=\"M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z\"/><path d=\"M13 5v2\"/><path d=\"M13 17v2\"/><path d=\"M13 11v2\"/>","ticket-check":"<path d=\"M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z\"/><path d=\"m9 12 2 2 4-4\"/>","calendar":"<path d=\"M8 2v3\"/><path d=\"M16 2v3\"/><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M3 9h18\"/>","calendar-plus":"<path d=\"M16 18h6\"/><path d=\"M16 2v3\"/><path d=\"M19 15v6\"/><path d=\"M21 11.5V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h8.3\"/><path d=\"M3 9h18\"/><path d=\"M8 2v3\"/>","calendar-check":"<path d=\"M8 2v3\"/><path d=\"M16 2v3\"/><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M3 9h18\"/><path d=\"m9 15 2 2 4-4\"/>","clock":"<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 6v6l4 2\"/>","timer":"<line x1=\"10\" x2=\"14\" y1=\"2\" y2=\"2\"/><line x1=\"12\" x2=\"15\" y1=\"14\" y2=\"11\"/><circle cx=\"12\" cy=\"14\" r=\"8\"/>","hourglass":"<path d=\"M5 22h14\"/><path d=\"M5 2h14\"/><path d=\"M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22\"/><path d=\"M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2\"/>","bookmark":"<path d=\"M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z\"/>","heart":"<path d=\"M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5\"/>","share":"<path d=\"M12 2v13\"/><path d=\"m16 6-4-4-4 4\"/><path d=\"M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8\"/>","share-2":"<circle cx=\"18\" cy=\"5\" r=\"3\"/><circle cx=\"6\" cy=\"12\" r=\"3\"/><circle cx=\"18\" cy=\"19\" r=\"3\"/><line x1=\"8.59\" x2=\"15.42\" y1=\"13.51\" y2=\"17.49\"/><line x1=\"15.41\" x2=\"8.59\" y1=\"6.51\" y2=\"10.49\"/>","send":"<path d=\"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z\"/><path d=\"m21.854 2.147-10.94 10.939\"/>","link":"<path d=\"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71\"/><path d=\"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71\"/>","qr-code":"<rect width=\"5\" height=\"5\" x=\"3\" y=\"3\" rx=\"1\"/><rect width=\"5\" height=\"5\" x=\"16\" y=\"3\" rx=\"1\"/><rect width=\"5\" height=\"5\" x=\"3\" y=\"16\" rx=\"1\"/><path d=\"M21 16h-3a2 2 0 0 0-2 2v3\"/><path d=\"M21 21v.01\"/><path d=\"M12 7v3a2 2 0 0 1-2 2H7\"/><path d=\"M3 12h.01\"/><path d=\"M12 3h.01\"/><path d=\"M12 16v.01\"/><path d=\"M16 12h1\"/><path d=\"M21 12v.01\"/><path d=\"M12 21v-1\"/>","scan-line":"<path d=\"M3 7V5a2 2 0 0 1 2-2h2\"/><path d=\"M17 3h2a2 2 0 0 1 2 2v2\"/><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\"/><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\"/><path d=\"M7 12h10\"/>","wallet":"<path d=\"M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1\"/><path d=\"M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4\"/>","credit-card":"<rect width=\"20\" height=\"14\" x=\"2\" y=\"5\" rx=\"2\"/><line x1=\"2\" x2=\"22\" y1=\"10\" y2=\"10\"/><path d=\"M6 14h2\"/>","indian-rupee":"<path d=\"M6 3h12\"/><path d=\"M6 8h12\"/><path d=\"m6 13 8.5 8\"/><path d=\"M6 13h3\"/><path d=\"M9 13c6.667 0 6.667-10 0-10\"/>","receipt":"<path d=\"M12 17V7\"/><path d=\"M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8\"/><path d=\"M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z\"/>","gift":"<path d=\"M12 7v14\"/><path d=\"M20 11v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8\"/><path d=\"M7.5 7a1 1 0 0 1 0-5A4.8 8 0 0 1 12 7a4.8 8 0 0 1 4.5-5 1 1 0 0 1 0 5\"/><rect x=\"3\" y=\"7\" width=\"18\" height=\"4\" rx=\"1\"/>","tag":"<path d=\"M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z\"/><circle cx=\"7.5\" cy=\"7.5\" r=\".5\" fill=\"currentColor\"/>","percent":"<line x1=\"19\" x2=\"5\" y1=\"5\" y2=\"19\"/><circle cx=\"6.5\" cy=\"6.5\" r=\"2.5\"/><circle cx=\"17.5\" cy=\"17.5\" r=\"2.5\"/>","user":"<path d=\"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2\"/><circle cx=\"12\" cy=\"7\" r=\"4\"/>","users":"<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/><path d=\"M16 3.128a4 4 0 0 1 0 7.744\"/><path d=\"M22 21v-2a4 4 0 0 0-3-3.87\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/>","user-plus":"<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/><line x1=\"19\" x2=\"19\" y1=\"8\" y2=\"14\"/><line x1=\"22\" x2=\"16\" y1=\"11\" y2=\"11\"/>","user-check":"<path d=\"m16 11 2 2 4-4\"/><path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/>","message-circle":"<path d=\"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719\"/>","messages-square":"<path d=\"M16 10a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 14.286V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z\"/><path d=\"M20 9a2 2 0 0 1 2 2v10.286a.71.71 0 0 1-1.212.502l-2.202-2.202A2 2 0 0 0 17.172 19H10a2 2 0 0 1-2-2v-1\"/>","at-sign":"<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8\"/>","bell":"<path d=\"M10.268 21a2 2 0 0 0 3.464 0\"/><path d=\"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326\"/>","bell-ring":"<path d=\"M10.268 21a2 2 0 0 0 3.464 0\"/><path d=\"M22 8c0-2.3-.8-4.3-2-6\"/><path d=\"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326\"/><path d=\"M4 2C2.8 3.7 2 5.7 2 8\"/>","face-slightly-smiling-plus":"<path d=\"M13.267 2.08a10 10 0 108.653 8.653\"/><path d=\"M15 10V9\"/><path d=\"M16 5h6\"/><path d=\"M16.472 15a6 6 0 01-8.943 0\"/><path d=\"M19 2v6\"/><path d=\"M9 10V9\"/>","camera":"<path d=\"M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z\"/><circle cx=\"12\" cy=\"13\" r=\"3\"/>","image":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" ry=\"2\"/><circle cx=\"9\" cy=\"9\" r=\"2\"/><path d=\"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21\"/>","images":"<path d=\"m22 11-1.296-1.296a2.4 2.4 0 0 0-3.408 0L11 16\"/><path d=\"M4 8a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2\"/><circle cx=\"13\" cy=\"7\" r=\"1\" fill=\"currentColor\"/><rect x=\"8\" y=\"2\" width=\"14\" height=\"14\" rx=\"2\"/>","video":"<path d=\"m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5\"/><rect x=\"2\" y=\"6\" width=\"14\" height=\"12\" rx=\"2\"/>","check":"<path d=\"M20 6 9 17l-5-5\"/>","circle-check":"<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"m16 9-5.5 5.5L8 12\"/>","info":"<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 16v-4\"/><path d=\"M12 8h.01\"/>","triangle-alert":"<path d=\"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3\"/><path d=\"M12 9v4\"/><path d=\"M12 17h.01\"/>","shield-check":"<path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\"/><path d=\"m9 12 2 2 4-4\"/>","lock":"<rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\"/><path d=\"M7 11V7a5 5 0 0 1 10 0v4\"/>","eye":"<path d=\"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>","eye-off":"<path d=\"M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49\"/><path d=\"M14.084 14.158a3 3 0 0 1-4.242-4.242\"/><path d=\"M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143\"/><path d=\"m2 2 20 20\"/>","phone":"<path d=\"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384\"/>","car":"<path d=\"M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2\"/><circle cx=\"7\" cy=\"17\" r=\"2\"/><path d=\"M9 17h6\"/><circle cx=\"17\" cy=\"17\" r=\"2\"/>","car-taxi-front":"<path d=\"M10 2h4\"/><path d=\"m21 8-2 2-1.5-3.7A2 2 0 0 0 15.646 5H8.4a2 2 0 0 0-1.903 1.257L5 10 3 8\"/><path d=\"M7 14h.01\"/><path d=\"M17 14h.01\"/><rect width=\"18\" height=\"8\" x=\"3\" y=\"10\" rx=\"2\"/><path d=\"M5 18v2\"/><path d=\"M19 18v2\"/>","bike":"<circle cx=\"18.5\" cy=\"17.5\" r=\"3.5\"/><circle cx=\"5.5\" cy=\"17.5\" r=\"3.5\"/><circle cx=\"15\" cy=\"5\" r=\"1\"/><path d=\"M12 17.5V14l-3-3 4-3 2 3h2\"/>","footprints":"<path d=\"M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z\"/><path d=\"M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z\"/><path d=\"M16 17h4\"/><path d=\"M4 13h4\"/>","accessibility":"<circle cx=\"16\" cy=\"4\" r=\"1\"/><path d=\"m18 19 1-7-6 1\"/><path d=\"m5 8 3-3 5.5 3-2.36 3.5\"/><path d=\"M4.24 14.5a5 5 0 0 0 6.88 6\"/><path d=\"M13.76 17.5a5 5 0 0 0-6.88-6\"/>","cigarette-off":"<path d=\"M12 12H3a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h13\"/><path d=\"M18 8c0-2.5-2-2.5-2-5\"/><path d=\"m2 2 20 20\"/><path d=\"M21 12a1 1 0 0 1 1 1v2a1 1 0 0 1-.5.866\"/><path d=\"M22 8c0-2.5-2-2.5-2-5\"/><path d=\"M7 12v4\"/>","wine-off":"<path d=\"M8 22h8\"/><path d=\"M7 10h3m7 0h-1.343\"/><path d=\"M12 15v7\"/><path d=\"M7.307 7.307A12.33 12.33 0 0 0 7 10a5 5 0 0 0 7.391 4.391M8.638 2.981C8.75 2.668 8.872 2.34 9 2h6c1.5 4 2 6 2 8 0 .407-.05.809-.145 1.198\"/><line x1=\"2\" x2=\"22\" y1=\"2\" y2=\"22\"/>","shirt":"<path d=\"M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z\"/>","id-card":"<path d=\"M13 19a4 4 0 00-8 0\"/><path d=\"M16 10h2\"/><path d=\"M16 14h2\"/><circle cx=\"9\" cy=\"12\" r=\"3\"/><rect x=\"2\" y=\"5\" width=\"20\" height=\"14\" rx=\"2\"/>","settings":"<path d=\"M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>","log-out":"<path d=\"m16 17 5-5-5-5\"/><path d=\"M21 12H9\"/><path d=\"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4\"/>","plus":"<path d=\"M5 12h14\"/><path d=\"M12 5v14\"/>","minus":"<path d=\"M5 12h14\"/>","trash":"<path d=\"M10 11v6\"/><path d=\"M14 11v6\"/><path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6\"/><path d=\"M3 6h18\"/><path d=\"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"/>","pencil":"<path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\"/><path d=\"m15 5 4 4\"/>","copy":"<rect width=\"14\" height=\"14\" x=\"8\" y=\"8\" rx=\"2\" ry=\"2\"/><path d=\"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2\"/>","download":"<path d=\"M12 15V3\"/><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/><path d=\"m7 10 5 5 5-5\"/>","upload":"<path d=\"M12 3v12\"/><path d=\"m17 8-5-5-5 5\"/><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/>","refresh-cw":"<path d=\"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8\"/><path d=\"M21 3v5h-5\"/><path d=\"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16\"/><path d=\"M8 16H3v5\"/>","external-link":"<path d=\"M15 3h6v6\"/><path d=\"M10 14 21 3\"/><path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\"/>","globe":"<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20\"/><path d=\"M2 12h20\"/>","fingerprint-pattern":"<path d=\"M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4\"/><path d=\"M14 13.12c0 2.38 0 6.38-1 8.88\"/><path d=\"M17.29 21.02c.12-.6.43-2.3.5-3.02\"/><path d=\"M2 12a10 10 0 0 1 18-6\"/><path d=\"M2 16h.01\"/><path d=\"M21.8 16c.2-2 .131-5.354 0-6\"/><path d=\"M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2\"/><path d=\"M8.65 22c.21-.66.45-1.32.57-2\"/><path d=\"M9 6.8a6 6 0 0 1 9 5.2v2\"/>","play":"<path d=\"M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z\"/>"};
  for (var lk in LUCIDE_SET) ICONS[lk] = LUCIDE_SET[lk];
  var FILLED_ICONS = {"house":"<mask id=\"{M}\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"24\" height=\"24\"><rect width=\"24\" height=\"24\" fill=\"black\" stroke=\"none\"/><path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\" fill=\"none\" stroke=\"black\" stroke-width=\"2\"/><path d=\"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\" fill=\"white\" stroke=\"white\"/></mask><rect width=\"24\" height=\"24\" fill=\"currentColor\" stroke=\"none\" mask=\"url(#{M})\"/>","map":"<mask id=\"{M}\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"24\" height=\"24\"><rect width=\"24\" height=\"24\" fill=\"black\" stroke=\"none\"/><path d=\"M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z\" fill=\"white\" stroke=\"white\"/><path d=\"M15 5.764v15\" fill=\"none\" stroke=\"black\" stroke-width=\"2\"/><path d=\"M9 3.236v15\" fill=\"none\" stroke=\"black\" stroke-width=\"2\"/></mask><rect width=\"24\" height=\"24\" fill=\"currentColor\" stroke=\"none\" mask=\"url(#{M})\"/>","compass":"<mask id=\"{M}\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"24\" height=\"24\"><rect width=\"24\" height=\"24\" fill=\"black\" stroke=\"none\"/><circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"white\" stroke=\"white\"/><path d=\"m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z\" fill=\"black\" stroke=\"black\" stroke-width=\"2\"/></mask><rect width=\"24\" height=\"24\" fill=\"currentColor\" stroke=\"none\" mask=\"url(#{M})\"/>","ticket":"<mask id=\"{M}\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"24\" height=\"24\"><rect width=\"24\" height=\"24\" fill=\"black\" stroke=\"none\"/><path d=\"M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z\" fill=\"white\" stroke=\"white\"/><path d=\"M13 5v2\" fill=\"none\" stroke=\"black\" stroke-width=\"2\"/><path d=\"M13 17v2\" fill=\"none\" stroke=\"black\" stroke-width=\"2\"/><path d=\"M13 11v2\" fill=\"none\" stroke=\"black\" stroke-width=\"2\"/></mask><rect width=\"24\" height=\"24\" fill=\"currentColor\" stroke=\"none\" mask=\"url(#{M})\"/>","calendar":"<mask id=\"{M}\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"24\" height=\"24\"><rect width=\"24\" height=\"24\" fill=\"black\" stroke=\"none\"/><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" fill=\"white\" stroke=\"white\"/><path d=\"M3 9h18\" fill=\"none\" stroke=\"black\" stroke-width=\"2\"/></mask><rect width=\"24\" height=\"24\" fill=\"currentColor\" stroke=\"none\" mask=\"url(#{M})\"/><path d=\"M8 2v3\"/><path d=\"M16 2v3\"/>","user":"<mask id=\"{M}\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"24\" height=\"24\"><rect width=\"24\" height=\"24\" fill=\"black\" stroke=\"none\"/><path d=\"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2\" fill=\"white\" stroke=\"white\"/><circle cx=\"12\" cy=\"7\" r=\"4\" fill=\"white\" stroke=\"white\"/></mask><rect width=\"24\" height=\"24\" fill=\"currentColor\" stroke=\"none\" mask=\"url(#{M})\"/>","users":"<mask id=\"{M}\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"24\" height=\"24\"><rect width=\"24\" height=\"24\" fill=\"black\" stroke=\"none\"/><path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\" fill=\"white\" stroke=\"white\"/><circle cx=\"9\" cy=\"7\" r=\"4\" fill=\"white\" stroke=\"white\"/></mask><rect width=\"24\" height=\"24\" fill=\"currentColor\" stroke=\"none\" mask=\"url(#{M})\"/><path d=\"M16 3.128a4 4 0 0 1 0 7.744\"/><path d=\"M22 21v-2a4 4 0 0 0-3-3.87\"/>","message-circle":"<mask id=\"{M}\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"24\" height=\"24\"><rect width=\"24\" height=\"24\" fill=\"black\" stroke=\"none\"/><path d=\"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719\" fill=\"white\" stroke=\"white\"/></mask><rect width=\"24\" height=\"24\" fill=\"currentColor\" stroke=\"none\" mask=\"url(#{M})\"/>","bell":"<mask id=\"{M}\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"24\" height=\"24\"><rect width=\"24\" height=\"24\" fill=\"black\" stroke=\"none\"/><path d=\"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326\" fill=\"white\" stroke=\"white\"/></mask><rect width=\"24\" height=\"24\" fill=\"currentColor\" stroke=\"none\" mask=\"url(#{M})\"/><path d=\"M10.268 21a2 2 0 0 0 3.464 0\"/>","heart":"<mask id=\"{M}\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"24\" height=\"24\"><rect width=\"24\" height=\"24\" fill=\"black\" stroke=\"none\"/><path d=\"M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5\" fill=\"white\" stroke=\"white\"/></mask><rect width=\"24\" height=\"24\" fill=\"currentColor\" stroke=\"none\" mask=\"url(#{M})\"/>","bookmark":"<mask id=\"{M}\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"24\" height=\"24\"><rect width=\"24\" height=\"24\" fill=\"black\" stroke=\"none\"/><path d=\"M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z\" fill=\"white\" stroke=\"white\"/></mask><rect width=\"24\" height=\"24\" fill=\"currentColor\" stroke=\"none\" mask=\"url(#{M})\"/>","star":"<mask id=\"{M}\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"24\" height=\"24\"><rect width=\"24\" height=\"24\" fill=\"black\" stroke=\"none\"/><path d=\"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z\" fill=\"white\" stroke=\"white\"/></mask><rect width=\"24\" height=\"24\" fill=\"currentColor\" stroke=\"none\" mask=\"url(#{M})\"/>","flame":"<mask id=\"{M}\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"24\" height=\"24\"><rect width=\"24\" height=\"24\" fill=\"black\" stroke=\"none\"/><path d=\"M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4\" fill=\"white\" stroke=\"white\"/></mask><rect width=\"24\" height=\"24\" fill=\"currentColor\" stroke=\"none\" mask=\"url(#{M})\"/>","moon":"<mask id=\"{M}\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"24\" height=\"24\"><rect width=\"24\" height=\"24\" fill=\"black\" stroke=\"none\"/><path d=\"M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401\" fill=\"white\" stroke=\"white\"/></mask><rect width=\"24\" height=\"24\" fill=\"currentColor\" stroke=\"none\" mask=\"url(#{M})\"/>","zap":"<mask id=\"{M}\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"24\" height=\"24\"><rect width=\"24\" height=\"24\" fill=\"black\" stroke=\"none\"/><path d=\"M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z\" fill=\"white\" stroke=\"white\"/></mask><rect width=\"24\" height=\"24\" fill=\"currentColor\" stroke=\"none\" mask=\"url(#{M})\"/>","map-pin":"<mask id=\"{M}\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"24\" height=\"24\"><rect width=\"24\" height=\"24\" fill=\"black\" stroke=\"none\"/><path d=\"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0\" fill=\"white\" stroke=\"white\"/><circle cx=\"12\" cy=\"10\" r=\"3\" fill=\"black\" stroke=\"black\" stroke-width=\"2\"/></mask><rect width=\"24\" height=\"24\" fill=\"currentColor\" stroke=\"none\" mask=\"url(#{M})\"/>","circle-check":"<mask id=\"{M}\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"24\" height=\"24\"><rect width=\"24\" height=\"24\" fill=\"black\" stroke=\"none\"/><circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"white\" stroke=\"white\"/><path d=\"m16 9-5.5 5.5L8 12\" fill=\"none\" stroke=\"black\" stroke-width=\"2\"/></mask><rect width=\"24\" height=\"24\" fill=\"currentColor\" stroke=\"none\" mask=\"url(#{M})\"/>","sparkles":"<mask id=\"{M}\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"24\" height=\"24\"><rect width=\"24\" height=\"24\" fill=\"black\" stroke=\"none\"/><path d=\"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z\" fill=\"white\" stroke=\"white\"/><circle cx=\"4\" cy=\"20\" r=\"2\" fill=\"white\" stroke=\"white\"/></mask><rect width=\"24\" height=\"24\" fill=\"currentColor\" stroke=\"none\" mask=\"url(#{M})\"/><path d=\"M20 2v4\"/><path d=\"M22 4h-4\"/>","music-2":"<mask id=\"{M}\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"24\" height=\"24\"><rect width=\"24\" height=\"24\" fill=\"black\" stroke=\"none\"/><circle cx=\"8\" cy=\"18\" r=\"4\" fill=\"white\" stroke=\"white\"/></mask><rect width=\"24\" height=\"24\" fill=\"currentColor\" stroke=\"none\" mask=\"url(#{M})\"/><path d=\"M12 18V2l7 4\"/>","camera":"<mask id=\"{M}\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"24\" height=\"24\"><rect width=\"24\" height=\"24\" fill=\"black\" stroke=\"none\"/><path d=\"M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z\" fill=\"white\" stroke=\"white\"/><circle cx=\"12\" cy=\"13\" r=\"3\" fill=\"black\" stroke=\"black\" stroke-width=\"2\"/></mask><rect width=\"24\" height=\"24\" fill=\"currentColor\" stroke=\"none\" mask=\"url(#{M})\"/>","image":"<mask id=\"{M}\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"24\" height=\"24\"><rect width=\"24\" height=\"24\" fill=\"black\" stroke=\"none\"/><rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" ry=\"2\" fill=\"white\" stroke=\"white\"/><circle cx=\"9\" cy=\"9\" r=\"2\" fill=\"black\" stroke=\"black\" stroke-width=\"2\"/><path d=\"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21\" fill=\"none\" stroke=\"black\" stroke-width=\"2\"/></mask><rect width=\"24\" height=\"24\" fill=\"currentColor\" stroke=\"none\" mask=\"url(#{M})\"/>","settings":"<mask id=\"{M}\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"24\" height=\"24\"><rect width=\"24\" height=\"24\" fill=\"black\" stroke=\"none\"/><path d=\"M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915\" fill=\"white\" stroke=\"white\"/><circle cx=\"12\" cy=\"12\" r=\"3\" fill=\"black\" stroke=\"black\" stroke-width=\"2\"/></mask><rect width=\"24\" height=\"24\" fill=\"currentColor\" stroke=\"none\" mask=\"url(#{M})\"/>","lock":"<mask id=\"{M}\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"24\" height=\"24\"><rect width=\"24\" height=\"24\" fill=\"black\" stroke=\"none\"/><rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\" fill=\"white\" stroke=\"white\"/></mask><rect width=\"24\" height=\"24\" fill=\"currentColor\" stroke=\"none\" mask=\"url(#{M})\"/><path d=\"M7 11V7a5 5 0 0 1 10 0v4\"/>","eye":"<mask id=\"{M}\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"24\" height=\"24\"><rect width=\"24\" height=\"24\" fill=\"black\" stroke=\"none\"/><path d=\"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0\" fill=\"white\" stroke=\"white\"/><circle cx=\"12\" cy=\"12\" r=\"3\" fill=\"black\" stroke=\"black\" stroke-width=\"2\"/></mask><rect width=\"24\" height=\"24\" fill=\"currentColor\" stroke=\"none\" mask=\"url(#{M})\"/>","shield-check":"<mask id=\"{M}\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"24\" height=\"24\"><rect width=\"24\" height=\"24\" fill=\"black\" stroke=\"none\"/><path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\" fill=\"white\" stroke=\"white\"/><path d=\"m9 12 2 2 4-4\" fill=\"none\" stroke=\"black\" stroke-width=\"2\"/></mask><rect width=\"24\" height=\"24\" fill=\"currentColor\" stroke=\"none\" mask=\"url(#{M})\"/>","tag":"<mask id=\"{M}\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"24\" height=\"24\"><rect width=\"24\" height=\"24\" fill=\"black\" stroke=\"none\"/><path d=\"M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z\" fill=\"white\" stroke=\"white\"/><circle cx=\"7.5\" cy=\"7.5\" r=\".5\" fill=\"black\" stroke=\"black\" stroke-width=\"2\"/></mask><rect width=\"24\" height=\"24\" fill=\"currentColor\" stroke=\"none\" mask=\"url(#{M})\"/>","mic":"<mask id=\"{M}\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"24\" height=\"24\"><rect width=\"24\" height=\"24\" fill=\"black\" stroke=\"none\"/><rect x=\"9\" y=\"2\" width=\"6\" height=\"13\" rx=\"3\" fill=\"white\" stroke=\"white\"/></mask><rect width=\"24\" height=\"24\" fill=\"currentColor\" stroke=\"none\" mask=\"url(#{M})\"/><path d=\"M12 19v3\"/><path d=\"M19 10v2a7 7 0 0 1-14 0v-2\"/>","martini":"<mask id=\"{M}\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"24\" height=\"24\"><rect width=\"24\" height=\"24\" fill=\"black\" stroke=\"none\"/><path d=\"M12 12 4.207 4.207A.707.707 0 0 1 4.707 3h14.586a.707.707 0 0 1 .5 1.207z\" fill=\"white\" stroke=\"white\"/></mask><rect width=\"24\" height=\"24\" fill=\"currentColor\" stroke=\"none\" mask=\"url(#{M})\"/><path d=\"M12 12v10\"/><path d=\"M7 22h10\"/>","send":"<mask id=\"{M}\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"24\" height=\"24\"><rect width=\"24\" height=\"24\" fill=\"black\" stroke=\"none\"/><path d=\"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z\" fill=\"white\" stroke=\"white\"/><path d=\"m21.854 2.147-10.94 10.939\" fill=\"none\" stroke=\"black\" stroke-width=\"2\"/></mask><rect width=\"24\" height=\"24\" fill=\"currentColor\" stroke=\"none\" mask=\"url(#{M})\"/>","calendar-check":"<mask id=\"{M}\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"24\" height=\"24\"><rect width=\"24\" height=\"24\" fill=\"black\" stroke=\"none\"/><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" fill=\"white\" stroke=\"white\"/><path d=\"M3 9h18\" fill=\"none\" stroke=\"black\" stroke-width=\"2\"/><path d=\"m9 15 2 2 4-4\" fill=\"none\" stroke=\"black\" stroke-width=\"2\"/></mask><rect width=\"24\" height=\"24\" fill=\"currentColor\" stroke=\"none\" mask=\"url(#{M})\"/><path d=\"M8 2v3\"/><path d=\"M16 2v3\"/>"};
  var ICON_GROUPS = {"Find":["house","compass","map","map-pin","navigation","locate-fixed","search","arrow-left","arrow-right","arrow-up-right","chevron-left","chevron-right","chevron-down","chevron-up","x","menu","ellipsis","sliders-horizontal","list-filter"],"Night":["music","music-2","disc-3","headphones","mic","mic-vocal","speaker","audio-lines","guitar","drum","party-popper","sparkles","martini","wine","beer","cup-soda","coffee","utensils","pizza","moon","sun","sunset","star","flame","zap"],"Plans":["ticket","ticket-check","calendar","calendar-plus","calendar-check","clock","timer","hourglass","bookmark","heart","share","share-2","send","link","qr-code","scan-line","wallet","credit-card","indian-rupee","receipt","gift","tag","percent"],"People":["user","users","user-plus","user-check","message-circle","messages-square","at-sign","bell","bell-ring","face-slightly-smiling-plus","camera","image","images","video"],"Safety":["check","circle-check","info","triangle-alert","shield-check","lock","eye","eye-off","phone","car","car-taxi-front","bike","footprints","accessibility","cigarette-off","wine-off","shirt","id-card"],"System":["settings","log-out","plus","minus","trash","pencil","copy","download","upload","refresh-cw","external-link","globe","fingerprint-pattern","play"]};

  function Sticker(p) {
    var size = p.size || 96;
    var st = Object.assign({ width: size + 'px', height: size + 'px', '--tilt': (p.tilt || 0) + 'deg' }, p.style);
    if (!p.src) return h('span', { className: cx('g-sticker-ph', p.className), style: st, 'aria-hidden': 'true' }, h('span', null, p.label || '3D'));
    return h('img', { className: cx('g-sticker', p.bob && !p.still && 'is-bob', p.className), src: p.src, alt: p.alt || '', style: st });
  }

  function MoodTile(p) {
    return h('button', { type: 'button', className: cx('g-mood', p.selected && 'is-selected', p.className), 'aria-pressed': p.selected ? 'true' : 'false', style: p.style },
      h(Sticker, { src: p.sticker, size: p.stickerSize || 88, tilt: p.tilt || -8, label: p.stickerLabel, bob: p.selected, className: 'g-mood-sticker' }),
      h('span', { className: 'g-mood-copy' },
        p.kicker ? h('span', { className: 'g-mood-kicker' }, p.kicker) : null,
        h('span', { className: 'g-mood-title' }, p.title)),
      p.action ? h('span', { className: 'g-mood-go' }, p.action) : null);
  }

  function RingAvatar(p) {
    var size = p.size || 56;
    return h('span', { className: cx('g-ring', 'g-ring-' + (p.ring || 'brand'), p.className), style: Object.assign({ width: size + 'px', height: size + 'px' }, p.style) },
      h(Avatar, { name: p.name, image: p.image, size: size - 8, sticker: p.sticker }),
      p.badge ? h('span', { className: 'g-ring-badge g-ring-badge-' + p.badge, 'aria-label': p.badge === 'check' ? 'going' : p.badge }, h(Icon, { name: p.badge === 'check' ? 'check' : p.badge, size: 12 })) : null);
  }

  function TagPill(p) {
    return h('span', { className: cx('g-tag', 'g-tag-' + (p.tone || 'light'), p.className), style: p.style },
      p.icon ? h(Icon, { name: p.icon, size: 15 }) : null,
      h('span', null, p.children));
  }

  function ReactionBubble(p) {
    return h('span', { className: cx('g-react', 'g-react-' + (p.tail || 'left'), p.className), style: p.style, role: 'img', 'aria-label': p.label || 'reactions' },
      (p.emoji || []).slice(0, 3).map(function (e, i) { return h('span', { key: i }, e); }));
  }

  function CommentBubble(p) {
    return h('span', { className: cx('g-comment', p.className), style: p.style },
      p.image || p.name ? h(Avatar, { name: p.name, image: p.image, size: 26 }) : h('span', { className: 'g-comment-heart' }, h(Icon, { name: 'heart', size: 14 })),
      h('span', { className: 'g-comment-text' }, p.name ? h('b', null, p.name + ' ') : null, p.children));
  }

  function StoryCard(p) {
    var people = p.people || [];
    return h('article', { className: cx('g-story', p.className), style: p.style },
      h(Media, { image: p.image, neutral: true, label: 'Event photo', className: 'g-story-media' }),
      h('div', { className: 'g-story-fade' }),
      p.status ? h('span', { className: 'g-story-status' }, h('span', { className: 'g-story-status-dot' }, h(Icon, { name: 'check', size: 11 })), p.status) : null,
      h('div', { className: 'g-story-body' },
        people.length ? h('span', { className: 'g-story-people', 'aria-label': people.length + ' friends going' }, people.slice(0, 4).map(function (f, i) {
          return h(Avatar, { key: i, name: f.name, image: f.image, size: i === 1 ? 40 : 30, className: 'g-story-av g-story-av-' + i });
        })) : null,
        h('h3', { className: 'g-story-title' }, p.title),
        p.meta ? h('p', { className: 'g-story-meta' }, p.meta) : null,
        p.place ? h('p', { className: 'g-story-meta' }, p.place) : null));
  }

  function CardDeck(p) {
    var kids = React.Children.toArray(p.children);
    var mid = p.active != null ? p.active : Math.floor(kids.length / 2);
    return h('div', { className: cx('g-deck', p.className), style: p.style }, kids.map(function (k, i) {
      return h('div', { key: i, className: cx('g-deck-item', i === mid ? 'is-active' : (i < mid ? 'is-left' : 'is-right')) }, k);
    }));
  }

  function PhotoStack(p) {
    var imgs = p.images || [];
    return h('div', { className: cx('g-pstack', p.className), style: p.style },
      h(Media, { image: imgs[1], neutral: true, className: 'g-pstack-side g-pstack-left' }),
      h(Media, { image: imgs[2], neutral: true, className: 'g-pstack-side g-pstack-right' }),
      h('div', { className: 'g-pstack-main' },
        h(Media, { image: imgs[0], neutral: true, label: 'Photo', className: 'g-pstack-photo' }),
        h('span', { className: 'g-pstack-progress', 'aria-hidden': 'true' }, h('i', { className: 'is-on' }), h('i'), h('i')),
        h('span', { className: 'g-pstack-reply' }, h('span', null, p.reply || 'Say something'), h('button', { type: 'button', className: cx('g-pstack-like', p.liked && 'is-liked'), 'aria-label': p.liked ? 'Unlike' : 'Like', 'aria-pressed': p.liked ? 'true' : 'false', onClick: p.onLike }, h(Icon, { name: 'heart', size: 22, filled: !!p.liked })))),
      p.children);
  }

  /* EchoPattern (v12): gathr's brand pattern. The vibe-tag speech bubble echoes outward from the logo; each echo's inner edge glows in a Bloom recipe */
  var ECHO = {
    peak: { ground: 'color-mix(in srgb, var(--violet-500) 42%, var(--night-950))', glow: ['var(--yellow-300)', 'var(--red-300)', 'var(--pink-300)', 'var(--blue-500)'] },
    uv: { ground: 'color-mix(in srgb, var(--violet-500) 30%, var(--night-950))', glow: ['var(--pink-300)', 'var(--violet-300)', 'var(--violet-300)', 'var(--pink-300)'] },
    sundowner: { ground: 'color-mix(in srgb, var(--pink-500) 34%, var(--night-950))', glow: ['var(--yellow-300)', 'var(--red-300)', 'var(--pink-300)', 'var(--yellow-300)'] },
    comedown: { ground: 'color-mix(in srgb, var(--blue-500) 32%, var(--night-950))', glow: ['var(--green-300)', 'var(--blue-300)', 'var(--violet-300)', 'var(--blue-300)'] }
  };
  var echoUid = 0;
  function bubblePath(x0, y0, w, hh) {
    var r = hh / 2, L = x0 - w / 2, R = x0 + w / 2, T = y0 - r, Bo = y0 + r;
    var t1 = L + r + w * 0.06, t2 = t1 + hh * 0.34, ax = t1 - hh * 0.06, ay = Bo + hh * 0.3;
    return 'M' + (L + r) + ' ' + T + 'H' + (R - r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (R - r) + ' ' + Bo + 'H' + t2 + 'L' + ax + ' ' + ay + 'L' + t1 + ' ' + Bo + 'H' + (L + r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (L + r) + ' ' + T + 'Z';
  }
  function EchoPattern(p) {
    var rec = ECHO[p.recipe] || ECHO.peak, id = 'gecho' + (++echoUid), n = p.rings || 4;
    var W = 400, H = 500, x0 = 200, y0 = 236, w0 = 236, h0 = 118, scales = [];
    for (var k = n - 1; k >= 0; k--) scales.push(1 + k * 0.62);
    var stops = rec.glow.map(function (c, i) { return h('stop', { key: i, offset: (i / (rec.glow.length - 1)), style: { stopColor: c } }); });
    var layers = scales.map(function (sc, i) {
      var d = bubblePath(x0, y0, w0 * sc, h0 * sc), sw = h0 * sc * 0.2;
      return h('g', { key: i, clipPath: 'url(#' + id + 'c' + i + ')' },
        h('clipPath', { id: id + 'c' + i }, h('path', { d: d })),
        h('path', { d: d, style: { fill: rec.ground } }),
        h('path', { d: d, fill: 'none', stroke: 'url(#' + id + 'g)', strokeWidth: sw, filter: 'url(#' + id + 'b)' }));
    });
    var lw = w0 * 0.66, lh = lw * 977 / 2505.4;
    var logo = p.logo === false ? null : h('svg', { x: x0 - lw / 2, y: y0 - lh / 2 - h0 * 0.02, width: lw, height: lh, viewBox: LOGO_VB, 'aria-hidden': 'true' },
      h('g', { style: { fill: 'var(--night-50)' }, dangerouslySetInnerHTML: { __html: LOGO_PATHS } }),
      h('circle', { cx: LOGO_DOT.cx, cy: LOGO_DOT.cy, r: LOGO_DOT.r, style: { fill: 'var(--yellow-300)' } }));
    return h('div', { className: cx('g-echo', p.className), style: Object.assign({ background: rec.ground }, p.style), role: p.logo === false ? null : 'img', 'aria-label': p.logo === false ? null : 'gathr', 'aria-hidden': p.logo === false ? 'true' : null },
      h('svg', { className: 'g-echo-svg', viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'xMidYMid slice' },
        h('defs', null,
          h('linearGradient', { id: id + 'g', x1: '0', y1: '1', x2: '1', y2: '0' }, stops),
          h('filter', { id: id + 'b', x: '-20%', y: '-20%', width: '140%', height: '140%' }, h('feGaussianBlur', { stdDeviation: 7 }))),
        layers, logo),
      h('span', { className: 'g-grain', 'aria-hidden': 'true' }),
      p.children ? h('div', { className: 'g-echo-content' }, p.children) : null);
  }









  /* ---------- Ticket (v10): a collectible event ticket. One hue per event; the art panel carries the event's elements ---------- */
  function seedOf(str) { var x = 2166136261; str = String(str || 'gathr'); for (var i = 0; i < str.length; i++) { x ^= str.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
  function rngOf(seed) { var s = seed || 1; return function () { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
  function TicketCode(p) {
    var n = 21, rnd = rngOf(seedOf(p.code)), cells = [];
    function finder(x, y) { return h('g', { key: 'f' + x + y }, h('rect', { x: x, y: y, width: 7, height: 7, rx: 1.6, fill: 'none', stroke: 'currentColor', strokeWidth: 1 }), h('rect', { x: x + 2, y: y + 2, width: 3, height: 3, rx: .8, fill: 'currentColor' })); }
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
      if ((x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12)) continue;
      if (rnd() < 0.48) cells.push(h('rect', { key: x + '-' + y, x: x + .08, y: y + .08, width: .9, height: .9, rx: .12, fill: 'currentColor' }));
    }
    return h('svg', { className: 'g-tk-code', viewBox: '-.5 -.5 22 22', role: 'img', 'aria-label': 'Entry code ' + (p.code || '') }, finder(0, 0), finder(14, 0), finder(0, 14), cells);
  }
  /* v11.2: each hue has a pop partner for the big date, arrow and vibe tag */
  var TK_POP = { violet: 'yellow', blue: 'yellow', red: 'yellow', pink: 'violet', green: 'violet', yellow: 'violet' };
  function popVal(h2) { return h2 === 'violet' || h2 === 'blue' ? 'var(--' + h2 + '-500)' : 'var(--' + h2 + '-300)'; }
  function Ticket(p) {
    /* v11.3: minimal, built like the social assets. Wordmark + vibe tag, the name, date and venue pills, and a centred code on the stub in the ticket's own ink */
    var hue = p.hue || 'violet', night = p.ground === 'night' || (p.hosted && p.ground !== 'hue');
    var pop = p.popHue || (night ? hue : TK_POP[hue]);
    var when = [p.day, p.date].filter(Boolean).join(' ');
    var st = Object.assign({ fontSize: (16 * (p.scale || 1)) + 'px', '--tk-fill': night ? 'var(--night-950)' : fillOf(hue), '--tk-shine': night ? 'none' : shineOf(hue), '--tk-ink': night ? 'var(--night-50)' : textOn(hue), '--tk-pop': popVal(pop), '--tk-pop-shine': shineOf(pop), '--tk-on-pop': textOn(pop), transform: p.tilt ? 'rotate(' + p.tilt + 'deg)' : null }, p.style);
    return h('div', { className: cx('g-ticket-wrap', p.className), style: st },
      h('article', { className: cx('g-ticket', 'g-ticket-' + hue, night && 'is-night', !night && !DARK_ON[hue] && 'is-light-ink'), 'aria-label': 'Ticket: ' + p.name + (when ? ', ' + when : '') + (p.time ? ', ' + p.time : '') + (p.venue ? ', ' + p.venue : '') },
        night ? h(Bloom, { recipe: p.recipe || 'sundowner', at: 'bottom', still: true, className: 'g-tk-bloom' }) : h('span', { className: 'g-grain g-tk-grain', 'aria-hidden': 'true' }),
        h('div', { className: 'g-tk-head' }, h(Wordmark, { size: 20, tone: 'auto', className: 'g-tk-logo' }), p.kicker ? h('span', { className: 'g-tk-tag' }, p.kicker) : null),
        h('div', { className: 'g-tk-main' },
          h('h3', { className: 'g-tk-name' }, p.name, p.hosted ? h('span', { className: 'g-tk-stop' }, '.') : null),
          h('div', { className: 'g-tk-facts' },
            when ? h('span', { className: 'g-tk-pill is-solid' }, when) : null,
            when && p.time ? h('span', { className: 'g-tk-arrow', 'aria-hidden': 'true' }, '→') : null,
            p.time ? h('span', { className: 'g-tk-pill is-solid' }, p.time) : null),
          p.venue ? h('div', { className: 'g-tk-facts' }, h('span', { className: 'g-tk-pill' }, p.venue)) : null),
        h('div', { className: 'g-tk-stub' },
          h(TicketCode, { code: p.code || p.number || p.name }),
          h('div', { className: 'g-tk-stub-meta' }, h('span', { className: 'g-tk-admit' }, p.admit || 'Admit one'), h('span', { className: 'g-tk-no' }, '#' + (p.number || '0001'))))));
  }


  /* ---------- v20 · Updates: quick glance, strong actions ---------- */
  /* lead: a night's 3D object (object), a person's photo (image), or gathr's tinted icon (icon + tone: go | limit | brand | wait) */
  /* a person with no photo (name, no image) gets centred initials, never a silhouette */
  function UpdateLead(p) {
    if (p.image) return h('span', { className: 'g-up-lead is-person' }, h('img', { src: p.image, alt: '' }));
    if (p.object) return h('span', { className: 'g-up-lead is-night' }, h('img', { src: p.object, alt: '' }));
    if (p.name) return h('span', { className: 'g-up-lead is-person is-initials', 'aria-hidden': 'true' }, initials(p.name));
    return h('span', { className: cx('g-up-lead', 'is-gathr', 'is-' + (p.tone || 'wait')) }, h(Icon, { name: p.icon || 'bell', size: 20 }));
  }
  /* Update: kind = task (one primary button) | chance (one violet button) | decide (Decline + Accept) | info (one line, no button) */
  function Update(p) {
    var kind = p.kind || 'info';
    var meta = [p.meta, p.time].filter(Boolean).join(' \u00b7 ');
    var link = kind === 'info' && typeof p.onOpen === 'function';
    var lead = h(UpdateLead, { object: p.object, image: p.image, name: p.name, icon: p.icon, tone: p.tone });
    var tag = link ? 'span' : 'p';
    var text = h(link ? 'span' : 'div', { className: 'g-up-text' }, h(tag, { className: 'g-up-title' }, p.title), meta ? h(tag, { className: 'g-up-meta' }, meta) : null);
    var end = null;
    if (kind === 'task') end = h(Button, { variant: 'primary', size: 'sm', onClick: p.onAction }, p.action || 'Fix');
    else if (kind === 'chance') end = h(Button, { variant: 'brand', size: 'sm', onClick: p.onAction }, p.action || 'Book');
    else if (kind === 'decide') end = h('div', { className: 'g-up-pair' },
      h('button', { type: 'button', className: 'g-up-round is-no', 'aria-label': p.declineLabel || 'Decline', onClick: p.onDecline }, h(Icon, { name: 'x', size: 20 })),
      h('button', { type: 'button', className: 'g-up-round is-yes', 'aria-label': p.acceptLabel || 'Accept', onClick: p.onAccept }, h(Icon, { name: 'check', size: 20 })));
    else end = h(Icon, { name: 'chevron-right', size: 16, className: 'g-up-chev' });
    var cls = cx('g-up', kind === 'info' ? 'is-info' : 'is-needs', p.unread === false && 'is-read', link && 'is-link', p.className);
    /* info rows open what they're about: with onOpen the whole row is a native button (Enter and Space work) */
    if (link) return h('div', { className: 'g-up-item', role: 'listitem' }, h('button', { type: 'button', className: cls, onClick: p.onOpen }, lead, text, end));
    return h('div', { className: cls, role: 'listitem' }, lead, text, end);
  }
  function UpdateGroup(p) {
    return h('section', { className: cx('g-upg', p.className) },
      h('header', { className: 'g-upg-head' }, h('h2', null, p.title), p.aside ? h('span', null, p.aside) : null),
      h('div', { className: 'g-upg-list', role: 'list' }, p.children));
  }
  /* Toast: the app's only toast, for every short message ("Removed from Plans", "Logged out") and for Undo.
     docked: fixed near the bottom, 32px up, or 12px above the tab bar (aboveTabBar).
     Stays 2.4 s, or 5 s when it has an action; onClose fires when the time is up. */
  var TOAST_MS = { plain: 2400, action: 5000 };
  function Toast(p) {
    var ms = p.duration || (p.action ? TOAST_MS.action : TOAST_MS.plain);
    var onClose = p.onClose;
    React.useEffect(function () {
      if (typeof onClose !== 'function') return;
      var t = setTimeout(onClose, ms);
      return function () { clearTimeout(t); };
    }, [onClose, ms]);
    return h('div', { className: cx('g-toast', p.docked && 'g-toast-dock', p.docked && p.aboveTabBar && 'is-above-tabbar', p.className), role: 'status', 'aria-live': 'polite' },
      h('span', null, p.children), p.action ? h('button', { type: 'button', onClick: p.onAction }, p.action) : null);
  }
  Toast.duration = TOAST_MS;

  /* ActionBar: round solid icon buttons (each with a label) beside one full-width main button. Use when two text buttons won't fit at 16px */
  function ActionBar(p) {
    var m = p.main || {};
    return h('div', { className: cx('g-actionbar', p.className) },
      (p.icons || []).slice(0, 2).map(function (b, i) { return h(IconButton, { key: i, variant: 'solid', icon: b.icon, label: b.label, onClick: b.onClick, className: 'g-actionbar-ic' }); }),
      h(Button, { variant: m.variant || 'brand', size: 'lg', icon: m.icon, disabled: !!m.disabled, onClick: m.onClick, className: 'g-actionbar-main' }, m.label || 'Get passes'));
  }

  /* ---------- Release 24: the door (home v3, from the Seeker app) ---------- */
  /* DoorVerdict: will they let us in? For the group set in Going as, always in words; the colour only repeats it.
     look 'pill' (hero card, event page: TagPill + source line, or "Ask the venue") · 'line' (tiles and rows: icon 16 + words) */
  var DV_ICON = { yes: 'check', 'if': 'check', unknown: 'info', no: 'x' };
  var DV_TONE = { yes: 'go', 'if': 'light', unknown: 'dark', no: 'dark' };
  /* the source line, short: "Set by host" · "Checked 3d ago" · "From 12 guests" (r25) */
  function doorSource(s) {
    if (!s || !s.kind) return null;
    if (s.kind === 'host') return 'Set by host';
    if (s.kind === 'guests') return 'From ' + s.count + ' guests';
    var t = s.checkedAt ? Date.parse(s.checkedAt) : NaN;
    if (s.tight || isNaN(t)) return 'Checked by gathr';
    var d = Math.max(0, Math.floor((Date.now() - t) / 86400000));
    return d === 0 ? 'Checked today' : 'Checked ' + d + 'd ago';
  }
  function DoorVerdict(p) {
    var state = DV_ICON[p.state] ? p.state : 'unknown', icon = p.icon || DV_ICON[state];
    var words = [h('span', { key: 'sr', className: 'g-sr' }, 'Door: '), p.text];
    if (p.look === 'line') {
      return h('span', { className: cx('g-dv', 'g-dv-line', 'is-' + state, p.className) },
        h(Icon, { name: icon, size: 16 }), h('span', { className: 'g-dv-text' }, words));
    }
    var src = p.showSource === false ? null : doorSource(p.source);
    /* r25.1: the pill holds only the verdict (2–3 words); the short source sits beside it on the same row, right-aligned */
    var ask = state === 'unknown' && p.onAsk ? h(Button, { variant: 'subtle', size: 'sm', onClick: p.onAsk }, 'Ask the venue') : null;
    return h('div', { className: cx('g-dv', 'g-dv-pill', 'is-' + state, p.className) },
      h(TagPill, { tone: DV_TONE[state], icon: icon, className: 'g-dv-tag' }, words),
      ask || (src ? h('span', { className: 'g-dv-src' }, src) : null));
  }
  DoorVerdict.source = doorSource;

  /* NightTile: a small poster tile for browsing many nights (rails), or a row in the full list (layout "row").
     The whole tile is one link, no buttons inside. Door (verdict line), crowd (on the photo), name, where and when, price */
  function NightTile(p) {
    var row = p.layout === 'row', price = p.price || null, crowd = CROWD[p.crowd] ? p.crowd : null;
    var base = cx('g-nt', row ? 'g-nt-row' : 'g-nt-tile', crowd === 'full' && 'is-soldout', p.className);
    if (p.loading) {
      return h('div', { className: cx(base, 'is-loading'), 'aria-hidden': 'true' },
        h('span', { className: 'g-nt-img g-nt-skel' }),
        h('span', { className: 'g-nt-body' }, h('span', { className: 'g-nt-skel g-nt-bar' }), h('span', { className: 'g-nt-skel g-nt-bar' }), h('span', { className: 'g-nt-skel g-nt-bar is-short' })));
    }
    var label = [p.verdict && p.verdict.text, [p.name, p.venue, p.time, price || 'Price not listed', crowd ? CROWD[crowd].label : null].filter(Boolean).join(', ')].filter(Boolean).join('. ');
    var badge = p.badge === 'Live' ? h(Badge, { tone: 'now', live: true }, 'Live') : p.badge === 'Promoted' ? h(Badge, { tone: 'glass' }, 'Promoted') : null;
    var verdict = p.verdict ? h(DoorVerdict, { look: 'line', state: p.verdict.state, text: p.verdict.text, icon: p.verdict.icon }) : null;
    var priceEl = price ? h('b', { className: 'g-nt-price' }, price) : h('span', { className: 'g-nt-noprice' }, 'Price not listed');
    var go = function (e) { if (p.onClick) p.onClick(e); };
    var link = p.href ? { href: p.href, onClick: p.onClick } : { role: 'link', tabIndex: 0, onClick: go, onKeyDown: function (e) { if (e.key === 'Enter') { e.preventDefault(); go(e); } } };
    var media = h(Media, { image: p.image, neutral: true, label: row ? null : 'Organiser image', className: 'g-nt-img' },
      p.image ? h('span', { className: 'g-grain g-nt-grain', 'aria-hidden': 'true' }) : null,
      !row && badge ? h('span', { className: 'g-nt-badge' }, badge) : null,
      !row && crowd ? h('span', { className: 'g-nt-crowd' }, h(CrowdMeter, { level: crowd, compact: true, glass: true })) : null);
    var body = row
      ? [h('span', { key: 'b', className: 'g-nt-body', 'aria-hidden': 'true' }, verdict,
          h('span', { className: 'g-nt-name' }, p.name),
          h('span', { className: 'g-nt-meta' }, [p.venue, p.distance, p.time].filter(Boolean).join(' · '))),
         h('span', { key: 'e', className: 'g-nt-end', 'aria-hidden': 'true' }, priceEl, crowd ? h(CrowdMeter, { level: crowd, compact: true }) : null)]
      : [h('span', { key: 'b', className: 'g-nt-body', 'aria-hidden': 'true' },
          /* r25: the night's name leads; where and when + price under it; the door line only when it asks something of you */
          h('span', { className: 'g-nt-name' }, p.name),
          h('span', { className: 'g-nt-foot' }, h('span', { className: 'g-nt-meta' }, [p.venue, p.time].filter(Boolean).join(' · ')), priceEl),
          p.verdict && p.verdict.state !== 'yes' ? verdict : null)];
    return h(p.href ? 'a' : 'div', Object.assign({}, link, { className: base, 'aria-label': label }), media, body);
  }

  /* NightRail: a titled horizontal row of NightTiles for one day. The next tile peeks from the right; tiles snap to their start.
     When the day has more nights than tiles (total), a "See all {n}" end tile closes the row */
  function NightRail(p) {
    var tiles = React.Children.toArray(p.children).filter(Boolean);
    if (!tiles.length) return null;
    var more = p.total && p.total > tiles.length;
    var see = function (e) { if (p.onSeeAll) p.onSeeAll(e); };
    return h('section', { className: cx('g-rail', p.className) },
      h('div', { className: 'g-rail-head' },
        h('h2', { className: 'g-rail-title' }, p.title),
        p.seeAllLabel && p.onSeeAll ? h(Button, { variant: 'subtle', size: 'sm', onClick: p.onSeeAll }, p.seeAllLabel) : null),
      h('div', { className: 'g-rail-scroll', role: 'list', 'aria-label': p.title + ', ' + (p.total || tiles.length) + ' nights', tabIndex: 0 },
        tiles.map(function (t, i) { return h('div', { key: t.key || i, role: 'listitem', className: 'g-rail-item' }, t); }),
        more ? h('div', { role: 'listitem', className: 'g-rail-item' },
          h('div', { role: 'link', tabIndex: 0, className: 'g-rail-end', onClick: see, onKeyDown: function (e) { if (e.key === 'Enter') { e.preventDefault(); see(e); } } },
            h('span', null, 'See all ' + p.total), h(Icon, { name: 'arrow-right', size: 20 }))) : null));
  }

  /* GroupPill: the one place the home says who you're going with: the active plan if there is one, otherwise Going as.
     state: plan-vote | plan-booked | group-set | group-unset. Solid, never glass, never violet (it isn't a selection) */
  function GroupPill(p) {
    var unset = p.state === 'group-unset', people = (p.people || []).slice(0, 4);
    return h('button', { type: 'button', className: cx('g-gp', 'is-' + (p.state || 'group-unset'), p.className), onClick: p.onOpen, 'aria-label': [p.title, p.line].filter(Boolean).join('. ') },
      h('span', { className: 'g-gp-faces', 'aria-hidden': 'true' },
        unset ? h('span', { className: 'g-gp-you' }, h(Icon, { name: 'user', size: 20 }))
          : people.map(function (x, i) { return h(Avatar, { key: (x.name || '') + i, name: x.name, image: x.image, size: 32, className: 'g-gp-face' }); })),
      h('span', { className: 'g-gp-copy', 'aria-hidden': 'true' },
        h('span', { className: 'g-gp-title' }, p.title),
        p.line ? h('span', { className: 'g-gp-line' }, p.line) : null),
      p.state === 'group-set' ? h('span', { className: 'g-gp-change', 'aria-hidden': 'true' }, 'Change') : h(Icon, { name: 'chevron-right', size: 20, className: 'g-gp-chev' }));
  }

  Icon.names = function () { return Object.keys(ICONS); }; Icon.groups = ICON_GROUPS; Icon.filledNames = function () { return Object.keys(FILLED_ICONS); };
  window.Gathr = Object.assign(window.Gathr || {}, {
    Wordmark: Wordmark, Icon: Icon, Button: Button, IconButton: IconButton, Chip: Chip, SearchField: SearchField,
    Badge: Badge, CrowdMeter: CrowdMeter, CrowdBlock: CrowdBlock, FactList: FactList, TonightSoFar: TonightSoFar, Avatar: Avatar, FriendsGoing: FriendsGoing, ProgressBar: ProgressBar, PageIndicator: PageIndicator,
    Bloom: Bloom, TopBar: TopBar, TabBar: TabBar, Sheet: Sheet,
    VenueHero: VenueHero, VenueCard: VenueCard, FeatureCard: FeatureCard, RankCard: RankCard, EventCard: EventCard, EventRow: EventRow, MapPin: MapPin,
    VibeTag: VibeTag, PhotoFrame: PhotoFrame, PillChain: PillChain, StatBubbles: StatBubbles, DotGrid: DotGrid,
    SocialSlide: SocialSlide, EventPoster: EventPoster, SiteHeader: SiteHeader,
    Sticker: Sticker, MoodTile: MoodTile, RingAvatar: RingAvatar, TagPill: TagPill, ReactionBubble: ReactionBubble, CommentBubble: CommentBubble,
    ActionBar: ActionBar, Update: Update, UpdateGroup: UpdateGroup, UpdateLead: UpdateLead, Toast: Toast,
    DoorVerdict: DoorVerdict, NightTile: NightTile, NightRail: NightRail, GroupPill: GroupPill,
    StoryCard: StoryCard, CardDeck: CardDeck, PhotoStack: PhotoStack, EchoPattern: EchoPattern, Ticket: Ticket
  });
})();

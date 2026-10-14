import { token } from './utils';

/* A night's StoryCard as a picture for the group chat (r25): the same card, drawn on a canvas at 1080 wide
   (the card's 3 : 4.3), every size scaled from the 264px card and every colour from the tokens.
   card = { image, title, meta, place, status, people: [{ name, image }] } → Promise<Blob (png)> */

const W = 1080,
  H = Math.round((W * 4.3) / 3),
  K = W / 264; // one card pixel

function load(src) {
  return new Promise((ok) => {
    if (!src) return ok(null);
    var im = new Image();
    im.crossOrigin = 'anonymous'; // organiser sites that don't allow it give no photo (a tainted canvas can't be shared)
    im.onload = () => ok(im);
    im.onerror = () => ok(null);
    im.src = src;
  });
}

function initials(n) {
  var w = String(n || '').trim().split(/\s+/).filter(Boolean);
  return w.length ? (w[0][0] + (w.length > 1 ? w[w.length - 1][0] : '')).toUpperCase() : '';
}

/* a picture drawn "cover" into a box, like the card's photo and the faces */
function cover(x, im, l, t, w, h) {
  var s = Math.max(w / im.width, h / im.height),
    dw = im.width * s,
    dh = im.height * s;
  x.drawImage(im, l + (w - dw) / 2, t + (h - dh) / 2, dw, dh);
}

/* a token colour (#rrggbb) at some opacity */
function alpha(hex, a) {
  var n = parseInt(hex.slice(1, 7), 16);
  return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
}

/* the title on at most two lines, the second cut with … */
function lines(x, text, max) {
  var words = String(text).split(/\s+/),
    out = [''];
  words.forEach((w) => {
    var i = out.length - 1,
      t = out[i] ? out[i] + ' ' + w : w;
    if (x.measureText(t).width <= max || !out[i]) out[i] = t;
    else out.push(w);
  });
  if (out.length > 2) {
    var last = out.slice(1).join(' ');
    while (last && x.measureText(last + '…').width > max) last = last.slice(0, -1);
    out = [out[0], last.trim() + '…'];
  }
  return out;
}

function round(x, l, t, w, h, r) {
  x.beginPath();
  x.roundRect(l, t, w, h, r);
}

export function storyImage(card) {
  return Promise.all([
    document.fonts ? document.fonts.ready : null,
    load(card.image),
    Promise.all((card.people || []).slice(0, 4).map((f) => load(f.image)))
  ]).then(([, photo, faces]) => {
    var cv = document.createElement('canvas');
    cv.width = W;
    cv.height = H;
    var x = cv.getContext('2d'),
      F = (w, sz, fam) => w + ' ' + Math.round(sz * K) + 'px ' + (fam || '"DM Sans", sans-serif'),
      JK = '"Plus Jakarta Sans", "DM Sans", sans-serif';

    // the photo, or the neutral night ground when there's none
    x.fillStyle = token('night-950');
    x.fillRect(0, 0, W, H);
    if (photo) cover(x, photo, 0, 0, W, H);

    // the fade from 35% down (.g-story-fade)
    var g = x.createLinearGradient(0, H * 0.35, 0, H);
    g.addColorStop(0, alpha(token('night-950'), 0));
    g.addColorStop(0.5, alpha(token('night-950'), 0.8));
    g.addColorStop(1, token('night-950'));
    x.fillStyle = g;
    x.fillRect(0, H * 0.35, W, H * 0.65);

    // the status chip, top left: a green dot with a tick, then the words (.g-story-status)
    if (card.status) {
      x.font = F(600, 13);
      var tw = x.measureText(card.status).width,
        ch = 32 * K,
        cw = 6 * K + 20 * K + 6 * K + tw + 12 * K,
        cl = 14 * K,
        ct = 14 * K;
      round(x, cl, ct, cw, ch, ch / 2);
      x.fillStyle = token('glass-scrim');
      x.fill();
      x.lineWidth = K;
      x.strokeStyle = token('glass-edge');
      x.stroke();
      var dx = cl + 6 * K + 10 * K,
        dy = ct + ch / 2;
      x.beginPath();
      x.arc(dx, dy, 10 * K, 0, Math.PI * 2);
      x.fillStyle = token('go');
      x.fill();
      x.beginPath();
      x.moveTo(dx - 3.6 * K, dy + 0.2 * K);
      x.lineTo(dx - 1 * K, dy + 2.8 * K);
      x.lineTo(dx + 3.8 * K, dy - 2.6 * K);
      x.lineWidth = 1.8 * K;
      x.lineCap = 'round';
      x.lineJoin = 'round';
      x.strokeStyle = token('on-fill');
      x.stroke();
      x.fillStyle = token('night-50');
      x.textBaseline = 'middle';
      x.textAlign = 'left';
      x.fillText(card.status, cl + 6 * K + 20 * K + 6 * K, dy + K);
    }

    // the body, bottom up: place, meta, title, then the faces (.g-story-body)
    x.textAlign = 'center';
    x.textBaseline = 'alphabetic';
    var y = H - 20 * K,
      mid = W / 2,
      metas = [card.place, card.meta].filter(Boolean);
    x.font = F(400, 13);
    x.fillStyle = token('night-500');
    metas.forEach((m) => {
      x.fillText(m, mid, y - 4 * K);
      y -= 18 * K;
    });
    y -= 4 * K + 2 * K; // the title's bottom margin and the gap
    x.font = F(700, 20, JK);
    x.fillStyle = token('night-50');
    var tl = lines(x, card.title, W - 36 * K);
    for (var i = tl.length - 1; i >= 0; i--) {
      x.fillText(tl[i], mid, y - 5 * K);
      y -= 24 * K;
    }
    var people = (card.people || []).slice(0, 4);
    if (people.length) {
      y -= 10 * K;
      var sizes = people.map((f, n) => (n === 1 ? 40 : 30) * K),
        total = sizes.reduce((a, b) => a + b, 0) - 6 * K * (people.length - 1),
        left = mid - total / 2,
        // the big middle face sits on the row's centre line, like the card
        line = y - 20 * K;
      people.forEach((f, n) => {
        var s = sizes[n],
          cxp = left + s / 2,
          r = s / 2;
        x.beginPath();
        x.arc(cxp, line, r + 2 * K, 0, Math.PI * 2);
        x.fillStyle = token('night-950');
        x.fill();
        x.save();
        x.beginPath();
        x.arc(cxp, line, r, 0, Math.PI * 2);
        x.clip();
        if (faces[n]) cover(x, faces[n], cxp - r, line - r, s, s);
        else {
          x.fillStyle = token('night-800');
          x.fillRect(cxp - r, line - r, s, s);
          x.fillStyle = token('night-50');
          x.font = F(600, (s / K) * 0.4);
          x.textBaseline = 'middle';
          x.fillText(initials(f.name), cxp, line + K);
          x.textBaseline = 'alphabetic';
        }
        x.restore();
        left += s - 6 * K;
      });
    }

    return new Promise((ok, no) => cv.toBlob((b) => (b ? ok(b) : no(new Error('blob'))), 'image/png'));
  });
}

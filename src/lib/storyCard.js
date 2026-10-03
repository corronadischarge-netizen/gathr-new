import { MO } from '../data/dates';
import { REC, levelOf, nightsCount } from '../data/sample';

/* Wrapped as a real 1080 x 1920 story image, drawn on a canvas */
export function storyCard(S) {
  return new Promise((ok, no) => {
    try {
      var W = 1080,
        H = 1920,
        cv = document.createElement('canvas');
      cv.width = W;
      cv.height = H;
      var x = cv.getContext('2d');
      var g = x.createRadialGradient(W / 2, H * 1.05, 60, W / 2, H * 1.05, H * 0.95);
      g.addColorStop(0, '#ff8fd0');
      g.addColorStop(0.4, '#9b7bff');
      g.addColorStop(0.75, '#531aff');
      g.addColorStop(1, '#0a0a0a');
      x.fillStyle = '#0a0a0a';
      x.fillRect(0, 0, W, H);
      x.fillStyle = g;
      x.fillRect(0, 0, W, H);
      var F = (w, sz) => w + ' ' + sz + 'px "Plus Jakarta Sans", "DM Sans", sans-serif';
      x.fillStyle = '#f7f5f0';
      x.textAlign = 'center';
      x.font = F(700, 64);
      x.fillText('gathr.', W / 2, 190);
      x.font = F(600, 52);
      x.fillStyle = '#b5b1aa';
      x.fillText(
        (S.me && S.me.name ? S.me.name.split(' ')[0].toLowerCase() + '’s ' : 'my ') +
          MO[new Date().getMonth()].toLowerCase(),
        W / 2,
        560
      );
      x.fillStyle = '#f7f5f0';
      x.font = F(700, 420);
      x.fillText(String(REC.length), W / 2, 960);
      x.font = F(600, 64);
      x.fillText('nights out in Pune', W / 2, 1070);
      var rows = [
        ['Top venue', 'Kukoo'],
        ['Top sound', 'Bollywood'],
        ['Your crew', 'Zoya & Aman'],
        ['Status', levelOf(nightsCount(S))[0]]
      ];
      rows.forEach((r, i) => {
        var cx = i % 2 ? W * 0.72 : W * 0.28,
          cy = 1260 + Math.floor(i / 2) * 190;
        x.font = F(600, 40);
        x.fillStyle = '#e6e2dc';
        x.fillText(r[0], cx, cy);
        x.font = F(700, 64);
        x.fillStyle = '#ffffff';
        x.fillText(r[1], cx, cy + 76);
      });
      x.font = F(600, 40);
      x.fillStyle = '#f7f5f0';
      x.fillText('pune after dark', W / 2, 1800);
      cv.toBlob((b) => {
        b ? ok(b) : no(new Error('blob'));
      }, 'image/png');
    } catch (e) {
      no(e);
    }
  });
}

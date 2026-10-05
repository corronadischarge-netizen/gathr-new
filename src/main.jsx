import { createRoot } from 'react-dom/client';
import { App } from './App';
import { listenForSelections } from './lib/haptics';

// Styles, in the same order the original single-page app declared them
import './styles/fonts.css';
import './styles/tokens.css';
import './design-system/design-system.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import './styles/app.css';
import './styles/motion.css';

/* Mount + scale: full screen on phones and in the native app, a scaled phone frame on desktop */
function fit() {
  var w = window.innerWidth,
    hh = window.innerHeight,
    q = (location.search + location.hash).toLowerCase();
  var full =
    w <= 560 || /full|app/.test(q) || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
  var root = document.documentElement;
  root.classList.toggle('is-full', !!full);
  // a phone held sideways (a phone-sized screen with no mouse) is asked to turn upright; laptops, touchscreen
  // ones too, and desktop previews never are
  var mq = (s) => window.matchMedia && matchMedia(s).matches,
    phone =
      /Android|iPhone|iPod/i.test(navigator.userAgent) &&
      mq('(hover: none) and (pointer: coarse)') &&
      Math.min(screen.width, screen.height) <= 500;
  var skipped = false;
  try {
    skipped = sessionStorage.getItem('gathr.sideways') === 'ok'; // tapped "Use it sideways anyway"
  } catch (e) {}
  root.classList.toggle('is-sideways', !!phone && w > hh && !skipped);
  if (full) {
    root.style.setProperty('--scale', '1');
    root.style.setProperty('--mapk', Math.max(w / 390, hh / 844).toFixed(3));
    root.style.setProperty('--appw', w + 'px');
    root.style.setProperty('--apph', hh + 'px');
  } else {
    var s = Math.min(1, (hh - 48) / 864, (w - 16) / 410);
    root.style.setProperty('--scale', s.toFixed(3));
    root.style.setProperty('--mapk', '1');
  }
}

window.addEventListener('resize', fit);
fit();
listenForSelections(document);
createRoot(document.getElementById('root')).render(<App />);

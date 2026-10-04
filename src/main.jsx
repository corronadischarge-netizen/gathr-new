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

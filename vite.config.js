import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative paths so the built app loads from any folder, including inside the iOS and Android apps
  base: './',
  build: {
    outDir: 'dist',
    // Match Capacitor 7's oldest supported web views (iOS 14, Android Chrome 60+)
    target: ['es2019', 'safari14', 'chrome64'],
    // MapLibre alone is ~800 kB, so the single bundle is ~1 MB (same code the old page inlined)
    chunkSizeWarningLimit: 1200
  }
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// GitHub Pages serves this project site under /taxi-pro/. During local dev the
// base is '/taxi-pro/' too. Override with VITE_BASE if deploying elsewhere.
// PWA assets are explicit static files in public/ (manifest.json + sw.js),
// registered manually in main.tsx.
const base = process.env.VITE_BASE ?? '/taxi-pro/';

export default defineConfig({
  base,
  server: { port: 5199, strictPort: true },
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
});

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
  build: {
    // Split heavy vendors into their own chunks so no single chunk trips the
    // 500 kB warning and the app shell caches/loads efficiently.
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          leaflet: ['leaflet', 'react-leaflet'],
          i18n: ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          vendor: ['axios', 'zustand', 'date-fns', 'dompurify', 'lucide-react'],
        },
      },
    },
  },
});

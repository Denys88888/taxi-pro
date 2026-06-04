import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'plugin-inspect-react-code'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [inspectAttr(), react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React framework
          'vendor-react': ['react', 'react-dom', 'react-router'],
          // Animation library
          'vendor-framer': ['framer-motion'],
          // UI and icons
          'vendor-ui': ['lucide-react'],
          // Pi SDK and payment
          'vendor-pi': ['./src/lib/pi-sdk.ts', './src/lib/payment-service.ts'],
          // Map components (heavy)
          'chunk-map': ['./src/components/MapView.tsx', './src/pages/MapHome.tsx'],
          // Driver mode (heavy)
          'chunk-driver': ['./src/pages/DriverModePage.tsx'],
          // Payment flow
          'chunk-payment': ['./src/pages/PaymentPage.tsx', './src/pages/BookPage.tsx'],
        },
      },
    },
  },
});

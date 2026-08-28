import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    // Raise warning threshold — our pages are intentionally large
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        // Manual chunk splitting to keep each vendor isolated
        manualChunks(id) {
          // React core — always loads first, tiny
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
          // React Router — only needed once routing starts
          if (id.includes('node_modules/react-router') || id.includes('node_modules/react-router-dom')) {
            return 'vendor-router';
          }
          // Leaflet maps — only loaded when Store Map / Tracking is open
          if (id.includes('node_modules/leaflet')) {
            return 'vendor-leaflet';
          }
          // Lucide icons — defer from initial paint
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          // Heavy product catalog — only needed by pages that use it
          if (id.includes('/customer/data/products') || id.includes('/data/products')) {
            return 'data-products';
          }
        },
      },
    },
  },

  // Optimize dependencies — pre-bundle heavy packages before first request
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
    ],
    // Exclude leaflet from pre-bundling — it's only used in map components
    exclude: ['leaflet'],
  },
})

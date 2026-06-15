import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/icon.svg'],
      manifest: {
        name: 'kalos.vzla',
        short_name: 'kalos',
        description: 'Cuadros, Fotos, Regalos, Flores y Arreglos en Maracaibo. Checkout por WhatsApp.',
        theme_color: '#005919',
        background_color: '#edf2e3',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icons/icon.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: 'icons/icon.svg', sizes: '512x512', type: 'image/svg+xml' },
          {
            src: 'icons/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Precache JS/CSS/HTML/icons but exclude large product images (>2MB).
        // Product images are cached on first access instead.
        globPatterns: ['**/*.{js,css,html,svg}', 'icons/*.{png,svg}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
    }),
  ],
});

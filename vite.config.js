import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'Js-Grw-Up',
        short_name: 'Js-Grw-Up',
        description: 'Co-parenting communication and coordination — together for the kids.',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        categories: ['lifestyle', 'productivity'],
        icons: [
          { src: 'icons/icon-72x72.png',   sizes: '72x72',   type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-96x96.png',   sizes: '96x96',   type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-128x128.png', sizes: '128x128', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-144x144.png', sizes: '144x144', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-152x152.png', sizes: '152x152', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-384x384.png', sizes: '384x384', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'icons/icon.svg',         sizes: 'any',      type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

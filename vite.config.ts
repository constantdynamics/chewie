import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// CHEWIE_TARGET=app  -> build bundled into the Capacitor Android app (relative base, no service worker)
// (default)          -> build for GitHub Pages under /chewie/ as an installable PWA
const isApp = process.env.CHEWIE_TARGET === 'app'
const BASE = isApp ? './' : '/chewie/'

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    // The service worker is only for the hosted PWA; inside the Capacitor shell it is unnecessary.
    ...(isApp
      ? []
      : [
          VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
            manifest: {
              name: 'Chewie — kauw rustig',
              short_name: 'Chewie',
              description: 'Eet langzamer, kauw bewuster, en blijf in je ideale hoeveelheid.',
              lang: 'nl',
              theme_color: '#4ade80',
              background_color: '#0b0f14',
              display: 'standalone',
              orientation: 'portrait',
              start_url: BASE,
              scope: BASE,
              icons: [
                { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
                { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
                { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
              ],
            },
            workbox: {
              globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
              navigateFallback: `${BASE}index.html`,
            },
          }),
        ]),
  ],
})

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'greenloop-icon.svg',
        'greenloop-icon-192.png',
        'greenloop-icon-512.png',
      ],
      manifest: {
        name: 'GreenLoop Melbourne',
        short_name: 'GreenLoop',
        description: 'Accessible recycling guidance and sustainability tools for Melbourne.',
        theme_color: '#198754',
        background_color: '#f7faf7',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/greenloop-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/greenloop-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/greenloop-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        cleanupOutdatedCaches: true,
        runtimeCaching: [],
      },
      devOptions: { enabled: false },
    }),
  ],
})

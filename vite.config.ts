import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest', // Needed for custom SW (Firebase)
      srcDir: 'src',
      filename: 'sw.ts', // We will write our own SW in TypeScript
      includeAssets: ['pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: '縮毛矯正タイマー',
        short_name: 'SalonPacer',
        description: '美容室の施術時間を管理するタイマーアプリ',
        theme_color: '#ffffff',
        display: 'standalone', // Makes it look like a native app
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      devOptions: {
        enabled: true, // Enable SW in dev mode for testing
        type: 'module',
      }
    })
  ],
  base: '/Time-schedule/',
})

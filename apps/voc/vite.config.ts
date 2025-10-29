// Plugins
import Vue from '@vitejs/plugin-vue'
import VueRouter from 'unplugin-vue-router/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

// Utilities
import { defineConfig, mergeConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import { baseViteConfig } from '../../vite.config.base'

// Hardcoded constants to avoid Node.js ESM resolution issues in vite.config
const BASE_PATH = 'voc'
const APP_TITLE = "Rabat's Wortspiel"

// https://vite.dev/config/
export default mergeConfig(
  baseViteConfig,
  defineConfig({
    base: `/${BASE_PATH}/`,
    server: {
      port: 5174,
      strictPort: true
    },
    preview: {
      port: 4174,
      strictPort: true
    },
    plugins: [
      Vue({
        template: { transformAssetUrls }
      }),
      quasar({
        sassVariables: fileURLToPath(new URL('./src/quasar-variables.sass', import.meta.url))
      }),
      VueRouter({
        dts: 'src/typed-router.d.ts'
      }),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'android-chrome-192x192.png'],
        manifest: {
          name: APP_TITLE,
          short_name: BASE_PATH,
          description: APP_TITLE,
          theme_color: '#1976d2',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          scope: `/${BASE_PATH}/`,
          start_url: `/${BASE_PATH}/`,
          icons: [
            {
              src: `/${BASE_PATH}/android-chrome-192x192.png`,
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: `/${BASE_PATH}/android-chrome-512x512.png`,
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: `/${BASE_PATH}/apple-touch-icon.png`,
              sizes: '180x180',
              type: 'image/png'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                }
              }
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    }
  })
)

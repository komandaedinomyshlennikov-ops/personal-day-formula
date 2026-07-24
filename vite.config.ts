import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { visualizer } from 'rollup-plugin-visualizer'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react({
      babel: {
        plugins: [
          ['babel-plugin-transform-remove-console', { exclude: ['error', 'warn'] }]
        ]
      }
    }),
    VitePWA({
      registerType: 'prompt',
      includeAssets: [
        'icon-192x192.png',
        'icon-512x512.png',
        'apple-touch-icon.png',
        'favicon-32.png',
        'vite.svg',
      ],
      manifest: {
        name: 'Астронавигатор — ваш личный день',
        short_name: 'АстроНав',
        description:
          'Персональный день по дате рождения: подсказка на сегодня и спокойный помощник.',
        theme_color: '#07060d',
        background_color: '#07060d',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        lang: 'ru',
        categories: ['lifestyle', 'productivity', 'health'],
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json}'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages',
              networkTimeoutSeconds: 5,
            },
          },
          {
            urlPattern: ({ request }) =>
              request.destination === 'script' ||
              request.destination === 'style' ||
              request.destination === 'worker',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'assets',
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-core';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'animations';
          }
          if (id.includes('node_modules/@radix-ui') || id.includes('node_modules/class-variance-authority') || id.includes('node_modules/clsx') || id.includes('node_modules/tailwind-merge')) {
            return 'ui-libs';
          }
          if (id.includes('node_modules/i18next') || id.includes('node_modules/react-i18next')) {
            return 'i18n';
          }
          if (id.includes('node_modules/jspdf') || id.includes('node_modules/html2canvas')) {
            return 'export-utils';
          }
          if (id.includes('node_modules/date-fns')) {
            return 'date-utils';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
          if (id.includes('node_modules/sonner')) {
            return 'notifications';
          }
          if (id.includes('node_modules/workbox') || id.includes('virtual:pwa')) {
            return 'pwa';
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (info) => {
          const infoSrc = info.name || '';
          if (/\.css$/.test(infoSrc)) {
            return 'assets/css/[name]-[hash][extname]';
          }
          if (/\.png$|\.jpg$|\.jpeg$|\.gif$|\.svg$|\.webp$/.test(infoSrc)) {
            return 'assets/img/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 600,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion'],
    exclude: ['@radix-ui/react-icons'],
  },
});

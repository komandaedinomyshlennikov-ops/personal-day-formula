import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { visualizer } from 'rollup-plugin-visualizer'

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
          // React core
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-core';
          }
          // Animation libraries
          if (id.includes('node_modules/framer-motion')) {
            return 'animations';
          }
          // UI components
          if (id.includes('node_modules/@radix-ui') || id.includes('node_modules/class-variance-authority') || id.includes('node_modules/clsx') || id.includes('node_modules/tailwind-merge')) {
            return 'ui-libs';
          }
          // i18n
          if (id.includes('node_modules/i18next') || id.includes('node_modules/react-i18next')) {
            return 'i18n';
          }
          // PDF and export utilities
          if (id.includes('node_modules/jspdf') || id.includes('node_modules/html2canvas')) {
            return 'export-utils';
          }
          // Date utilities
          if (id.includes('node_modules/date-fns')) {
            return 'date-utils';
          }
          // Icons
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
          // Notifications
          if (id.includes('node_modules/sonner')) {
            return 'notifications';
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

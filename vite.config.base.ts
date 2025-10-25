import type { UserConfig } from 'vite'

export const baseViteConfig: UserConfig = {
  build: {
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 500,
    cssCodeSplit: true,
    minify: 'esbuild',
    sourcemap: false,
    target: 'esnext'
  },

  optimizeDeps: {
    exclude: [
      'unplugin-vue-router/runtime',
      'unplugin-vue-router/data-loaders',
      'unplugin-vue-router/data-loaders/basic'
    ],
    include: ['vue', 'vue-router', 'quasar']
  },

  define: {
    'process.env': {}
  },

  resolve: {
    extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue']
  },

  preview: {
    port: 4173,
    strictPort: false
  },

  server: {
    port: 5173,
    strictPort: false
  }
}

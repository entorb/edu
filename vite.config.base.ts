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
      'unplugin-vue-router/data-loaders',
      'unplugin-vue-router/data-loaders/basic',
      'unplugin-vue-router/runtime'
    ],
    include: ['vue', 'vue-router', 'quasar']
  },

  define: {
    'process.env': {}
  },

  resolve: {
    extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue']
  }
}

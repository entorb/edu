import { configDefaults } from 'vitest/config'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'

export const getVitestConfig = (rootDir: string): any => ({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', rootDir))
    }
  },
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      exclude: [...configDefaults.exclude, '**/*.spec.ts', 'e2e/**']
    },
    css: {
      modules: {
        classNameStrategy: 'non-scoped'
      }
    },
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, 'e2e/**', 'node_modules/'],
    root: fileURLToPath(new URL('./', rootDir)),
    setupFiles: ['./src/__tests__/setup.ts']
  }
})

import { defineConfig } from 'vitest/config'
import { getVitestConfig } from '../../vitest.config.base'

export default defineConfig(getVitestConfig(import.meta.url))

import { defineConfig } from 'cypress'
import { BASE_PATH } from './src/constants'
import baseConfig from '../../cypress.config.base'

export default defineConfig({
  ...baseConfig,
  e2e: {
    ...baseConfig.e2e,
    baseUrl: `http://localhost:5174/${BASE_PATH}/`
  }
})

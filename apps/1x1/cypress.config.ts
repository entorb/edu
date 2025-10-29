import { defineConfig } from 'cypress'
import { BASE_PATH } from './src/config/constants'
import baseConfig from '../../cypress.config.base'

export default defineConfig({
  ...baseConfig,
  e2e: {
    ...baseConfig.e2e,
    baseUrl: `http://localhost:5173/${BASE_PATH}/`
  }
})

import { defineConfig } from 'cypress'
import baseConfig from '../../cypress.config.base'

const BASE_PATH = 'voc'

export default defineConfig({
  ...baseConfig,
  e2e: {
    ...baseConfig.e2e,
    baseUrl: `http://localhost:5174/${BASE_PATH}/`,
    setupNodeEvents(on, _config) {
      on('task', {
        log(message) {
          // eslint-disable-next-line no-console
          console.log(message)
          return null
        }
      })
    }
  }
})

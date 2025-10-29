import { defineConfig } from 'cypress'

export default defineConfig({
  screenshotOnRunFailure: false,
  e2e: {
    specPattern: 'cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}'
  }
})

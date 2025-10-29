import { createApp } from 'vue'
import { Quasar, Notify, Dialog } from 'quasar'
import { router } from './router'
import App from './App.vue'

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'

// Import Quasar css
import 'quasar/src/css/index.sass'

// Create app
const app = createApp(App)

app.use(Quasar, {
  plugins: {
    Notify,
    Dialog
  },
  config: {
    brand: {
      primary: '#1976d2',
      secondary: '#26A69A',
      accent: '#9C27B0',
      dark: '#1d1d1d',
      positive: '#21BA45',
      negative: '#C10015',
      info: '#31CCEC',
      warning: '#F2C037'
    }
  }
})

app.use(router)

app.mount('#app')

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  globalThis.addEventListener('load', () => {
    navigator.serviceWorker.register('/wordplay/sw.js').catch(() => {
      // Silently fail - PWA not critical
    })
  })
}

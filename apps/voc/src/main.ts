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

// Register PWA service worker after app is mounted
import { registerSW } from 'virtual:pwa-register'
import { TEXT_DE } from '@flashcards/shared'

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    // Prompt user before reloading to avoid data loss
    if (confirm(TEXT_DE.pwaUpdate.confirmMessage)) {
      updateSW(true)
    }
  }
})

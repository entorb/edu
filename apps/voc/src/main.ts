import { createApp } from 'vue'
import { Quasar, Dialog, Notify } from 'quasar'
import { router } from './router'
import App from './App.vue'

// Import Quasar css
import 'quasar/src/css/index.sass'

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'

const app = createApp(App)

app.use(Quasar, {
  plugins: {
    Dialog,
    Notify
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

import { createApp } from 'vue'
import { Quasar, Dialog, Notify } from 'quasar'
import { router } from './router'
import App from './App.vue'

// Import Quasar css
import 'quasar/dist/quasar.css'

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'

// Import global styles
import './styles/global.css'

// Register PWA service worker
import { registerSW } from 'virtual:pwa-register'
registerSW({ immediate: true })

const app = createApp(App)

app.use(Quasar, {
  plugins: {
    Dialog,
    Notify
  }
})

app.use(router)

app.mount('#app')

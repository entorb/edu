<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { TEXT_DE } from '../text-de'

const isPwaInstalled = ref(false)

onMounted(() => {
  // Detect if running in standalone mode (installed PWA)
  const isStandalone =
    globalThis.matchMedia('(display-mode: standalone)').matches ||
    (globalThis.navigator as Navigator & { standalone?: boolean }).standalone === true

  isPwaInstalled.value = isStandalone
})
</script>

<template>
  <q-card
    v-if="!isPwaInstalled"
    class="bg-blue-1"
    bordered
  >
    <q-card-section>
      <div class="row items-center q-mb-sm">
        <q-icon
          name="install_mobile"
          size="24px"
          color="primary"
          class="q-mr-sm"
        />
        <div class="text-subtitle1 text-weight-medium">
          {{ TEXT_DE.pwaInstall.title }}
        </div>
      </div>
      <div>
        <div class="q-mb-xs">
          <strong>{{ TEXT_DE.pwaInstall.android }}</strong>
          {{ TEXT_DE.pwaInstall.androidInstructions }}
        </div>
        <div>
          <strong>{{ TEXT_DE.pwaInstall.iPhone }}</strong>
          {{ TEXT_DE.pwaInstall.iPhoneInstructions }}
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

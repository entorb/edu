<script setup lang="ts">
import { TEXT_DE } from '../text-de'
</script>

<template>
  <q-card
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
          {{ TEXT_DE.common.pwaInstall.title }}
        </div>
      </div>
      <div>
        <div class="q-mb-xs">
          <strong>{{ TEXT_DE.common.pwaInstall.android }}</strong>
          {{ TEXT_DE.common.pwaInstall.androidInstructions }}
        </div>
        <div>
          <strong>{{ TEXT_DE.common.pwaInstall.iPhone }}</strong>
          {{ TEXT_DE.common.pwaInstall.iPhoneInstructions }}
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

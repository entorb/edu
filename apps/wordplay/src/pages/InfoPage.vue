<script setup lang="ts">
// TODO:
// cspell:disable

import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { TEXT_DE } from '@flashcards/shared'

const router = useRouter()

function handleGoBack() {
  router.push('/')
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    handleGoBack()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <q-header
    elevated
    class="bg-white text-grey-9"
  >
    <q-toolbar>
      <q-btn
        flat
        round
        dense
        icon="arrow_back"
        @click="handleGoBack"
      >
        <q-tooltip>{{ TEXT_DE.common.backToMenu }}</q-tooltip>
      </q-btn>
      <q-toolbar-title class="text-center">{{ TEXT_DE.wordplay.info.title }}</q-toolbar-title>
      <q-btn
        flat
        round
        dense
        icon="arrow_back"
        style="visibility: hidden"
      />
    </q-toolbar>
  </q-header>

  <q-page class="q-pa-md">
    <div
      class="q-mx-auto q-gutter-lg text-grey-8"
      style="max-width: 700px"
    >
      <p>
        {{ TEXT_DE.wordplay.info.description }}
      </p>

      <div>
        <h3 class="text-subtitle1 text-weight-bold q-mb-sm">
          {{ TEXT_DE.wordplay.info.basePointsTitle }}
        </h3>
        <p>
          {{ TEXT_DE.wordplay.info.basePointsDescription }}
        </p>
        <ul class="q-pl-md q-mt-sm">
          <li>
            <strong class="text-primary">{{ TEXT_DE.wordplay.info.basePointsLevel1 }}</strong>
          </li>
          <li>
            <strong class="text-primary">{{ TEXT_DE.wordplay.info.basePointsLevel2 }}</strong>
          </li>
          <li>
            <strong class="text-primary">{{ TEXT_DE.wordplay.info.basePointsLevel3 }}</strong>
          </li>
          <li>
            <strong class="text-primary">{{ TEXT_DE.wordplay.info.basePointsLevel4 }}</strong>
          </li>
          <li>
            <strong class="text-primary">{{ TEXT_DE.wordplay.info.basePointsLevel5 }}</strong>
          </li>
        </ul>
      </div>

      <div>
        <h3 class="text-subtitle1 text-weight-bold q-mb-sm">
          {{ TEXT_DE.wordplay.info.modeMultiplierTitle }}
        </h3>
        <p>{{ TEXT_DE.wordplay.info.modeMultiplierDescription }}</p>
        <ul class="q-pl-md q-mt-sm">
          <li>
            <strong class="text-primary">{{ TEXT_DE.wordplay.info.modeMultiplierChoice }}</strong>
          </li>
          <li>
            <strong class="text-primary">{{ TEXT_DE.wordplay.info.modeMultiplierBlind }}</strong>
          </li>
          <li>
            <strong class="text-primary">{{ TEXT_DE.wordplay.info.modeMultiplierTyping }}</strong>
          </li>
        </ul>
      </div>

      <div>
        <h3 class="text-subtitle1 text-weight-bold q-mb-sm">
          {{ TEXT_DE.wordplay.info.additionalRulesTitle }}
        </h3>
        <ul class="q-pl-md">
          <li class="q-mb-sm">
            {{ TEXT_DE.wordplay.info.additionalRuleFastCorrect }}
          </li>
          <li class="q-mb-sm">
            {{ TEXT_DE.wordplay.info.additionalRuleLanguageBonus }}
          </li>
          <li>{{ TEXT_DE.wordplay.info.additionalRuleWrong }}</li>
        </ul>
      </div>
    </div>
  </q-page>
</template>

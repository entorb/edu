<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../composables/useGameStore'
import { TEXT_DE } from '../config/text-de'
import FoxIcon from '../components/FoxIcon.vue'
import { helperStatsDataWrite } from '../utils/helpers'

const router = useRouter()
const { score, lastRoundUpdates, isFoxHappy } = useGameStore()

const ups = computed(() => lastRoundUpdates.value.filter(u => u.change === 'up').length)
const downs = computed(() => lastRoundUpdates.value.filter(u => u.change === 'down').length)

function handleGoHome() {
  router.push('/')
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    handleGoHome()
  }
}

onMounted(async () => {
  window.addEventListener('keydown', handleKeyDown)
  // Update usage stats in DB
  await helperStatsDataWrite()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <q-layout
    view="hHh lpR fFf"
    class="bg-grey-3"
  >
    <q-page-container>
      <q-page class="flex flex-center q-pa-md">
        <div
          class="text-center flex flex-center column q-mx-auto"
          style="max-width: 600px; width: 100%"
        >
          <FoxIcon
            :is-happy="isFoxHappy"
            :size="100"
          />

          <h2 class="text-h4 text-primary text-weight-bold q-mt-md q-mb-sm">
            {{ TEXT_DE.gameOver.title }}
          </h2>
          <p class="text-grey-7 q-mb-lg">
            {{ isFoxHappy ? TEXT_DE.gameOver.greatJob : TEXT_DE.gameOver.goodWork }}
          </p>

          <q-card
            class="q-mb-xl"
            flat
            bordered
            style="width: 100%; max-width: 400px; background-color: #f5f5f5"
          >
            <q-card-section>
              <p class="text-subtitle1 text-grey-7">{{ TEXT_DE.gameOver.finalScore }}</p>
              <p class="text-h2 text-primary text-weight-bold q-my-sm">
                {{ Math.round(score) }}
              </p>
              <div class="row justify-around q-mt-md">
                <div class="text-positive">
                  <div class="text-h5 text-weight-bold">{{ ups }}</div>
                  <p class="text-caption">{{ TEXT_DE.gameOver.leveledUp }}</p>
                </div>
                <div class="text-negative">
                  <div class="text-h5 text-weight-bold">{{ downs }}</div>
                  <p class="text-caption">{{ TEXT_DE.gameOver.leveledDown }}</p>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <q-btn
            color="primary"
            :label="TEXT_DE.gameOver.playAgain"
            no-caps
            size="lg"
            class="full-width"
            style="max-width: 400px"
            @click="handleGoHome"
          />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

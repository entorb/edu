<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../composables/useGameStore'
import { loadLastSettings } from '../services/storage'
import type { GameSettings } from '../types'
import { TEXT_DE, helperStatsDataRead } from '@edu/shared'
import { AppFooter } from '@edu/shared/components'
import { BASE_PATH } from '../config/constants'
import FoxIcon from '../components/FoxIcon.vue'
import GameStatsDisplay from '../components/GameStatsDisplay.vue'
import LevelDistribution from '../components/LevelDistribution.vue'

const router = useRouter()
const { allCards, gameStats, startGame } = useGameStore()

const settings = ref<GameSettings>({
  mode: 'multiple-choice',
  priority: 'low',
  language: 'en-de'
})

const totalGamesPlayedByAll = ref<number>(0)

const modeOptions = [
  { label: TEXT_DE.modes['multiple-choice'], value: 'multiple-choice' as const },
  { label: TEXT_DE.modes.blind, value: 'blind' as const },
  { label: TEXT_DE.modes.typing, value: 'typing' as const }
]

const priorityOptions = [
  { label: TEXT_DE.priority.low, value: 'low' as const },
  { label: TEXT_DE.priority.high, value: 'high' as const },
  { label: TEXT_DE.priority.slow, value: 'slow' as const }
]

const languageOptions = [
  { label: TEXT_DE.language['en-de'], value: 'en-de' as const },
  { label: TEXT_DE.language['de-en'], value: 'de-en' as const }
]

onMounted(async () => {
  const lastSettings = loadLastSettings()
  if (lastSettings) {
    settings.value = lastSettings
  }
  // Fetch total games played by all users from database
  totalGamesPlayedByAll.value = await helperStatsDataRead(BASE_PATH)
})

function handleSubmit() {
  startGame(settings.value)
  router.push('/game')
}
</script>

<template>
  <q-layout
    view="hHh lpR fFf"
    class="bg-grey-3"
  >
    <q-page-container>
      <q-page class="q-pa-md flex flex-center">
        <div
          class="q-mx-auto"
          style="max-width: 600px; width: 100%"
        >
          <!-- Header -->
          <div class="flex items-start justify-between q-mb-md">
            <h1 class="text-h4 text-weight-bold">{{ TEXT_DE.appTitle_wordplay }}</h1>
            <q-btn
              flat
              round
              dense
              icon="info_outline"
              color="grey-6"
              @click="router.push('/info')"
            >
              <q-tooltip>Info zu Scoring-Regeln</q-tooltip>
            </q-btn>
          </div>

          <!-- Fox and Stats -->
          <div class="text-center q-mb-md">
            <div
              class="flex justify-center items-center gap-4 q-mb-md"
              style="min-height: 96px"
            >
              <FoxIcon
                :is-happy="gameStats.totalScore > 1000"
                :size="80"
              />
              <GameStatsDisplay :stats="gameStats" />
            </div>
            <h2 class="text-h5 text-weight-bold">{{ TEXT_DE.home.welcome }}</h2>
          </div>

          <!-- Settings Form -->
          <q-form
            @submit="handleSubmit"
            class="q-gutter-md"
          >
            <!-- Mode Selection -->
            <div>
              <label class="text-subtitle2 text-weight-bold q-mb-sm block">{{
                TEXT_DE.home.mode
              }}</label>
              <q-btn-toggle
                v-model="settings.mode"
                spread
                no-caps
                toggle-color="primary"
                :options="modeOptions"
              />
            </div>

            <!-- Priority Selection -->
            <div>
              <label class="text-subtitle2 text-weight-bold q-mb-sm block">{{
                TEXT_DE.home.focus
              }}</label>
              <div class="row q-col-gutter-sm">
                <div
                  class="col-4"
                  v-for="option in priorityOptions"
                  :key="option.value"
                >
                  <q-btn
                    :outline="settings.priority !== option.value"
                    :color="settings.priority === option.value ? 'primary' : 'grey-8'"
                    :label="option.label"
                    no-caps
                    class="full-width"
                    @click="settings.priority = option.value"
                  />
                </div>
              </div>
            </div>

            <!-- Language Direction -->
            <div>
              <label class="text-subtitle2 text-weight-bold q-mb-sm block">{{
                TEXT_DE.home.direction
              }}</label>
              <q-btn-toggle
                v-model="settings.language"
                spread
                no-caps
                toggle-color="primary"
                :options="languageOptions"
              />
            </div>

            <!-- Start Button -->
            <q-btn
              type="submit"
              color="primary"
              :label="TEXT_DE.home.startRound"
              no-caps
              size="lg"
              class="full-width"
            />
          </q-form>

          <!-- Level Distribution -->
          <div
            class="q-mt-lg q-pt-lg"
            style="border-top: 1px solid #e0e0e0"
          >
            <LevelDistribution
              :all-cards="allCards"
              @click="router.push('/stats')"
            />
          </div>

          <!-- Navigation Buttons -->
          <div class="row q-gutter-sm q-mt-md">
            <div class="col">
              <q-btn
                outline
                color="grey-8"
                :label="TEXT_DE.home.cards"
                no-caps
                class="full-width"
                @click="router.push('/cards')"
              />
            </div>
            <div class="col">
              <q-btn
                outline
                color="grey-8"
                :label="TEXT_DE.home.history"
                no-caps
                class="full-width"
                @click="router.push('/history')"
              />
            </div>
          </div>

          <!-- Footer -->
          <AppFooter
            :total-games-played-by-all="totalGamesPlayedByAll"
            :base-path="BASE_PATH"
            :text-de="TEXT_DE"
          />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

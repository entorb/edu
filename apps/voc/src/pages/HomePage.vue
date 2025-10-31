<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../composables/useGameStore'
import { loadLastSettings } from '../services/storage'
import type { GameSettings } from '../types'
import { TEXT_DE, helperStatsDataRead } from '@flashcards/shared'
import {
  AppFooter,
  StatisticsCard,
  PwaInstallInfo,
  FocusSelector
} from '@flashcards/shared/components'
import { BASE_PATH } from '../constants'
import FoxIcon from '../components/FoxIcon.vue'

const router = useRouter()
const { gameStats, startGame: startGameStore } = useGameStore()

const settings = ref<GameSettings>({
  mode: 'multiple-choice',
  focus: 'weak',
  language: 'en-de'
})

const totalGamesPlayedByAll = ref<number>(0)

const modeOptions = [
  { label: TEXT_DE.voc.mode.multipleChoice, value: 'multiple-choice' as const },
  { label: TEXT_DE.voc.mode.blind, value: 'blind' as const },
  { label: TEXT_DE.voc.mode.typing, value: 'typing' as const }
]

const languageOptions = [
  { label: TEXT_DE.voc.language.en_de, value: 'en-de' as const },
  { label: TEXT_DE.voc.language.de_en, value: 'de-en' as const }
]

onMounted(async () => {
  const lastSettings = loadLastSettings()
  if (lastSettings) {
    settings.value = lastSettings
  }
  // Fetch total games played by all users from database
  totalGamesPlayedByAll.value = await helperStatsDataRead(BASE_PATH)
})

function startGame() {
  startGameStore(settings.value)
  router.push({ name: '/game' })
}

function goToHistory() {
  router.push({ name: '/history' })
}

function goToCards() {
  router.push({ name: '/cards' })
}

function goToInfo() {
  router.push({ name: '/info' })
}
</script>

<template>
  <q-page class="q-pa-md">
    <!-- Header with Info Button -->
    <div class="row items-center justify-between q-mb-md">
      <div
        class="text-h5"
        data-cy="app-title"
      >
        {{ TEXT_DE.appTitle_voc }}
      </div>
      <q-btn
        flat
        round
        dense
        icon="info_outline"
        color="grey-6"
        @click="goToInfo"
        data-cy="info-button"
      >
        <q-tooltip>{{ TEXT_DE.nav.infoTooltip }}</q-tooltip>
      </q-btn>
    </div>

    <!-- Mascot and Statistics -->
    <div class="row items-center justify-center q-mb-md">
      <div class="col-12 col-sm-auto text-center">
        <!-- Mascot happiness based on total points -->
        <FoxIcon
          :is-happy="gameStats.points > 1000"
          :size="100"
        />
      </div>
      <div
        class="col-12 col-sm"
        :class="$q.screen.gt.xs ? 'q-ml-md' : ''"
      >
        <StatisticsCard :statistics="gameStats" />
      </div>
    </div>

    <!-- Game Configuration -->
    <q-card class="q-mb-md">
      <q-card-section class="q-pa-md">
        <!-- Mode Selection -->
        <div class="q-mb-sm">
          <div class="text-subtitle2 q-mb-xs">{{ TEXT_DE.words.mode }}</div>
          <q-btn-toggle
            v-model="settings.mode"
            spread
            no-caps
            toggle-color="primary"
            :options="modeOptions"
          />
        </div>

        <!-- Language Direction -->
        <div>
          <div class="text-subtitle2 q-mb-xs">{{ TEXT_DE.words.direction }}</div>
          <q-btn-toggle
            v-model="settings.language"
            spread
            no-caps
            toggle-color="primary"
            :options="languageOptions"
          />
        </div>

        <!-- Focus Selection -->
        <div class="q-mb-sm">
          <FocusSelector v-model="settings.focus" />
        </div>
      </q-card-section>
    </q-card>

    <!-- Start Game Button -->
    <q-btn
      color="positive"
      size="lg"
      class="full-width q-mb-sm"
      @click="startGame"
      icon="play_arrow"
      data-cy="start-button"
    >
      <span class="text-body1">{{ TEXT_DE.common.start }}</span>
    </q-btn>

    <!-- Navigation Buttons -->
    <div class="row q-gutter-sm">
      <q-btn
        unelevated
        color="primary"
        size="md"
        class="col"
        @click="goToCards"
        icon="layers"
        :label="TEXT_DE.nav.cards"
        data-cy="cards-button"
      />
      <q-btn
        unelevated
        color="primary"
        size="md"
        class="col"
        @click="goToHistory"
        icon="history"
        :label="TEXT_DE.nav.history"
        data-cy="history-button"
      />
    </div>

    <PwaInstallInfo class="q-mt-md" />

    <AppFooter :base-path="BASE_PATH" />
  </q-page>
</template>

<script setup lang="ts">
// TODO:
// cspell:disable

import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../composables/useGameStore'
import { formatDate } from '../utils/helpers'
import { TEXT_DE } from '@flashcards/shared'

const router = useRouter()
const { history } = useGameStore()

const reversedHistory = computed(() => [...history.value].reverse())

function getModeText(mode: string): string {
  const modes: Record<string, string> = {
    'multiple-choice': TEXT_DE.wordplay.modes['multiple-choice'],
    blind: TEXT_DE.wordplay.modes.blind,
    typing: TEXT_DE.wordplay.modes.typing
  }
  return modes[mode] || mode
}

function getPriorityText(priority: string): string {
  return priority === 'low' ? TEXT_DE.wordplay.history.focusWeak : TEXT_DE.wordplay.history.focusStrong
}

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
  <q-layout
    view="hHh lpR fFf"
    class="bg-grey-3"
  >
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
        <q-toolbar-title class="text-center">{{ TEXT_DE.nav.history }}</q-toolbar-title>
        <q-btn
          flat
          round
          dense
          icon="arrow_back"
          style="visibility: hidden"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md">
        <div
          class="q-mx-auto"
          style="max-width: 700px"
        >
          <div
            v-if="reversedHistory.length === 0"
            class="text-center text-grey-6 q-mt-lg"
          >
            {{ TEXT_DE.wordplay.history.noGamesPlayed }}
          </div>

          <q-list
            v-else
            separator
          >
            <q-item
              v-for="(entry, index) in reversedHistory"
              :key="index"
            >
              <q-item-section>
                <q-item-label class="text-weight-bold">
                  {{ formatDate(entry.date) }}
                </q-item-label>
                <q-item-label caption>
                  {{ getModeText(entry.settings.mode) }} |
                  {{ getPriorityText(entry.settings.priority) }} |
                  {{ entry.settings.language.toUpperCase() }}
                </q-item-label>
              </q-item-section>
              <q-item-section
                side
                class="text-right"
              >
                <q-item-label class="text-h6 text-primary text-weight-bold">
                  {{ Math.round(entry.score) }} {{ TEXT_DE.wordplay.history.points }}
                </q-item-label>
                <q-item-label caption>
                  {{ entry.correctAnswers }} / {{ entry.totalCards }} {{ TEXT_DE.wordplay.history.correct }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

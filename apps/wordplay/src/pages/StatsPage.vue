<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../composables/useGameStore'
import { TEXT_DE } from '@flashcards/shared'

const router = useRouter()
const { allCards } = useGameStore()

function getLevelColor(level: number): string {
  const colors = ['red', 'orange', 'amber', 'light-green', 'green']
  return colors[level - 1] || 'grey'
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
        <q-toolbar-title class="text-center">Alle Karten im Stapel</q-toolbar-title>
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
          <q-list
            bordered
            separator
          >
            <q-item
              v-for="card in allCards"
              :key="card.id"
            >
              <q-item-section>
                <q-item-label>{{ card.en }} → {{ card.de }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge
                  :color="getLevelColor(card.level)"
                  :label="`Level ${card.level}`"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

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
  globalThis.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  globalThis.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <q-btn
        flat
        round
        icon="arrow_back"
        @click="handleGoBack"
        size="md"
      />
      <div class="text-h5 q-ml-sm text-weight-bold text-grey-8">
        {{ TEXT_DE.wordplay.stats.allCardsTitle }}
      </div>
    </div>

    <!-- Content -->
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
          :key="card.en"
        >
          <q-item-section>
            <q-item-label>{{ card.en }} → {{ card.de }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-badge
              :color="getLevelColor(card.level)"
              :label="`${TEXT_DE.stats.level} ${card.level}`"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>

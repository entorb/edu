<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore, type AnswerData } from '@/composables/useGameStore'
import { useGameTimer } from '@flashcards/shared'
import FlashCard from '@/components/FlashCard.vue'

const router = useRouter()
const {
  gameCards,
  currentCardIndex,
  points,
  currentCard,
  gameSettings,
  handleAnswer: storeHandleAnswer,
  nextCard,
  finishGame: storeFinishGame,
  discardGame
} = useGameStore()

// Use shared timer logic
const { elapsedTime, stopTimer } = useGameTimer(currentCard)

onMounted(() => {
  // Redirect home if there's no game in progress and no settings
  // This handles the case where user accessed /game directly without starting a game
  if (gameCards.value.length === 0 && !gameSettings.value) {
    router.push({ name: '/' })
  }
})

function handleAnswer(data: AnswerData) {
  stopTimer()
  storeHandleAnswer(data)
}

function handleNextCard() {
  const isGameOver = nextCard()
  if (isGameOver) {
    stopTimer()
    storeFinishGame()
    router.push({ name: '/game-over' })
  }
}

function handleGoHome() {
  stopTimer()
  discardGame()
  router.push({ name: '/' })
}

// Handle Escape key
function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    handleGoHome()
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
  <q-page
    class="q-pa-md"
    style="max-width: 600px; margin: 0 auto"
  >
    <!-- Header with Back Button and Game Progress -->
    <div class="row items-center justify-between q-mb-md">
      <q-btn
        flat
        round
        icon="arrow_back"
        @click="handleGoHome"
        size="md"
        data-cy="back-button"
      />
      <div
        class="text-h6 text-weight-bold"
        data-cy="current-points"
      >
        <q-icon
          name="emoji_events"
          color="amber"
          size="24px"
        />
        {{ points }}
      </div>
      <div
        class="text-h6 text-weight-bold"
        data-cy="game-progress"
      >
        {{ currentCardIndex + 1 }} / {{ gameCards.length }}
      </div>
    </div>

    <!-- FlashCard Component -->
    <FlashCard
      v-if="currentCard"
      :key="currentCard.question"
      :card="currentCard"
      :elapsed-time="elapsedTime"
      :selection="gameSettings?.select"
      @answer="handleAnswer"
      @next="handleNextCard"
    />
  </q-page>
</template>

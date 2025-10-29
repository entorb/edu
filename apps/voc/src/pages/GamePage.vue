<script setup lang="ts">
import { onUnmounted, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../composables/useGameStore'
import { useGameTimer, type AnswerResult } from '@flashcards/shared'
import { MAX_TIME } from '../constants'
import Flashcard from '../components/Flashcard.vue'

const router = useRouter()
const {
  allCards,
  gameCards,
  gameSettings,
  currentCardIndex,
  points,
  currentCard,
  handleAnswer: storeHandleAnswer,
  nextCard,
  finishGame,
  discardGame,
  startGame
} = useGameStore()

// Use shared timer logic with maxTime
const { elapsedTime, stopTimer } = useGameTimer(currentCard, MAX_TIME)

function handleAnswer(result: AnswerResult, answerTime: number) {
  stopTimer()
  storeHandleAnswer(result, answerTime)
}

function handleNextCard() {
  const isGameOver = nextCard()
  if (isGameOver) {
    stopTimer()
    finishGame()
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
  if (gameSettings.value) {
    startGame(gameSettings.value)
  }
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
      <div class="text-h6 text-weight-bold">
        <q-icon
          name="emoji_events"
          color="amber"
          size="24px"
        />
        {{ points }}
      </div>
      <div class="text-h6 text-weight-bold">
        {{ currentCardIndex + 1 }} / {{ gameCards.length }}
      </div>
    </div>

    <Flashcard
      v-if="currentCard"
      :key="currentCard.en"
      :card="currentCard"
      :all-cards="allCards"
      :settings="gameSettings!"
      :elapsed-time="elapsedTime"
      @answer="handleAnswer"
      @next="handleNextCard"
    />
  </q-page>
</template>

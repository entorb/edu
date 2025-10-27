<script setup lang="ts">
import { ref, watch, onUnmounted, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../composables/useGameStore'
import { MAX_TIME } from '../config/constants'
import type { AnswerResult } from '../types'
import FlashCard from '../components/FlashCard.vue'

const router = useRouter()
const {
  allCards,
  roundCards,
  gameSettings,
  currentCardIndex,
  score,
  currentCard,
  handleAnswer: storeHandleAnswer,
  nextCard,
  finishGame
} = useGameStore()

// Timer
const elapsedTime = ref(0)
let timerInterval: ReturnType<typeof setInterval> | null = null

// Redirect to home if no game settings
if (!gameSettings.value) {
  router.push('/')
}

// Start timer when card changes
watch(
  () => currentCard.value,
  () => {
    elapsedTime.value = 0
    if (timerInterval) clearInterval(timerInterval)
    timerInterval = setInterval(() => {
      elapsedTime.value += 0.1
      if (elapsedTime.value >= MAX_TIME) {
        elapsedTime.value = MAX_TIME
      }
    }, 100)
  },
  { immediate: true }
)

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

function handleAnswer(result: AnswerResult, answerTime: number) {
  if (timerInterval) clearInterval(timerInterval)
  storeHandleAnswer(result, answerTime)
}

function handleNextCard() {
  const isGameOver = nextCard()
  if (isGameOver) {
    if (timerInterval) clearInterval(timerInterval)
    finishGame()
    router.push('/game-over')
  }
}

function handleGoHome() {
  if (timerInterval) clearInterval(timerInterval)
  router.push('/')
}

// Handle Escape key
function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    handleGoHome()
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
      />
      <div class="text-h6 text-weight-bold">
        <q-icon
          name="emoji_events"
          color="amber"
          size="24px"
        />
        {{ score }}
      </div>
      <div class="text-h6 text-weight-bold">
        {{ currentCardIndex + 1 }} / {{ roundCards.length }}
      </div>
    </div>

    <FlashCard
      v-if="currentCard"
      :key="currentCard.id"
      :card="currentCard"
      :all-cards="allCards"
      :settings="gameSettings!"
      :elapsed-time="elapsedTime"
      @answer="handleAnswer"
      @next="handleNextCard"
    />
  </q-page>
</template>

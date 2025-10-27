<script setup lang="ts">
import { ref, computed, watch, onUnmounted, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../composables/useGameStore'
import { TEXT_DE } from '@flashcards/shared'
import { MAX_TIME } from '../config/constants'
import type { AnswerResult } from '../types'
import Flashcard from '../components/Flashcard.vue'
import Scoreboard from '../components/Scoreboard.vue'
import LevelDistribution from '../components/LevelDistribution.vue'

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

const timerProgress = computed(() => {
  return Math.min((elapsedTime.value / MAX_TIME) * 100, 100)
})

const timerColor = computed(() => {
  if (elapsedTime.value < 20) return 'positive'
  if (elapsedTime.value < 40) return 'warning'
  return 'negative'
})

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
        @click="handleGoHome"
      >
        <q-tooltip>{{ TEXT_DE.common.backToMenu }}</q-tooltip>
      </q-btn>
      <q-toolbar-title class="text-center">{{ TEXT_DE.wordplay.game.title }}</q-toolbar-title>
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
      class="q-mx-auto"
      style="max-width: 700px"
    >
      <!-- Level Distribution -->
      <div class="q-mb-md">
        <LevelDistribution :all-cards="allCards" />
      </div>

      <!-- Scoreboard -->
      <Scoreboard
        :score="score"
        :current="currentCardIndex + 1"
        :total="roundCards.length"
      />

      <!-- Timer Progress Bar -->
      <div class="q-mb-md">
        <div class="flex justify-between items-center q-mb-xs">
          <span class="text-caption text-grey-7">{{ TEXT_DE.wordplay.game.time }}</span>
          <span
            class="text-caption font-bold"
            :class="`text-${timerColor}`"
          >
            {{ elapsedTime.toFixed(1) }}s
          </span>
        </div>
        <q-linear-progress
          :value="timerProgress / 100"
          :color="timerColor"
          size="8px"
          rounded
        />
      </div>

      <!-- Flashcard -->
      <div class="flex flex-center q-mt-lg">
        <Flashcard
          v-if="currentCard"
          :key="currentCard.id"
          :card="currentCard"
          :all-cards="allCards"
          :settings="gameSettings!"
          :elapsed-time="elapsedTime"
          @answer="handleAnswer"
          @next="handleNextCard"
        />
      </div>
    </div>
  </q-page>
</template>

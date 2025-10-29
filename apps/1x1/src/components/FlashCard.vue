<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import type { Card } from '@/types'
import { TEXT_DE } from '@flashcards/shared'
import {
  AUTO_SUBMIT_DIGITS,
  AUTO_CLOSE_DURATION,
  BUTTON_DISABLE_DURATION,
  MAX_CARD_TIME,
  COUNTDOWN_INTERVAL
} from '@/config/constants'

interface Props {
  card: Card
  elapsedTime: number
}

interface AnswerData {
  isCorrect: boolean
  userAnswer: number
  basePoints: number
  levelBonus: number
  speedBonus: number
  totalPoints: number
  timeTaken: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  answer: [data: AnswerData]
  next: []
}>()

const userAnswer = ref<number | null>(null)
const showFeedback = ref(false)
const answerData = ref<AnswerData | null>(null)
const answerInput = ref()
const autoCloseCountdown = ref(0)
const isButtonDisabled = ref(false)
const buttonDisableCountdown = ref(0)
const isEnterDisabled = ref(false)

let autoCloseTimer: ReturnType<typeof setTimeout> | null = null
let countdownInterval: ReturnType<typeof setInterval> | null = null
let buttonDisableTimer: ReturnType<typeof setTimeout> | null = null
let buttonDisableCountdownInterval: ReturnType<typeof setInterval> | null = null
let enterDisableTimer: ReturnType<typeof setTimeout> | null = null

const displayQuestion = computed(() => {
  return props.card.question.replace('x', '\u00d7')
})

// Auto-submit after configured digit count
watch(userAnswer, newValue => {
  if (newValue !== null && newValue !== undefined && !showFeedback.value) {
    const valueStr = String(newValue)
    if (valueStr.length >= AUTO_SUBMIT_DIGITS) {
      submitAnswer()
    }
  }
})

// Reset state when card changes
watch(
  () => props.card,
  () => {
    userAnswer.value = null
    showFeedback.value = false
    answerData.value = null
    clearAllTimers()
    isButtonDisabled.value = false
    buttonDisableCountdown.value = 0
    isEnterDisabled.value = false
    nextTick(() => {
      nextTick(() => {
        answerInput.value?.focus()
      })
    })
  },
  { immediate: true }
)

function clearAllTimers() {
  if (buttonDisableTimer) clearTimeout(buttonDisableTimer)
  if (buttonDisableCountdownInterval) clearInterval(buttonDisableCountdownInterval)
  if (enterDisableTimer) clearTimeout(enterDisableTimer)
  if (autoCloseTimer) clearTimeout(autoCloseTimer)
  if (countdownInterval) clearInterval(countdownInterval)
}

function submitAnswer() {
  if (userAnswer.value === null || userAnswer.value === undefined) return

  const isCorrect = userAnswer.value === props.card.answer
  const timeTaken = props.elapsedTime

  let basePoints = 0
  let levelBonus = 0
  let speedBonus = 0

  if (isCorrect) {
    // Calculate points for correct answer
    const [x, y] = props.card.question.split('x').map(Number)
    basePoints = Math.min(x, y)
    levelBonus = 6 - props.card.level

    // Add speed bonus if last time < MAX_CARD_TIME and current time <= last time
    if (props.card.time < MAX_CARD_TIME && timeTaken <= props.card.time) {
      speedBonus = 1
    }
  }

  const totalPoints = basePoints + levelBonus + speedBonus

  answerData.value = {
    isCorrect,
    userAnswer: userAnswer.value,
    basePoints,
    levelBonus,
    speedBonus,
    totalPoints,
    timeTaken
  }

  showFeedback.value = true

  // Emit answer data to parent
  emit('answer', answerData.value)

  if (isCorrect) {
    // Auto-close after configured duration for correct answers
    isEnterDisabled.value = false
    startAutoCloseTimer(AUTO_CLOSE_DURATION / 1000)
  } else {
    // Wrong answer: disable button and Enter key
    startButtonDisableTimer()
    isEnterDisabled.value = true

    enterDisableTimer = setTimeout(() => {
      isEnterDisabled.value = false
    }, BUTTON_DISABLE_DURATION)
  }
}

function startAutoCloseTimer(seconds: number) {
  clearTimers()
  autoCloseCountdown.value = seconds

  // Update countdown
  countdownInterval = setInterval(() => {
    autoCloseCountdown.value--
    if (autoCloseCountdown.value <= 0) {
      clearInterval(countdownInterval!)
    }
  }, COUNTDOWN_INTERVAL)

  // Auto-close after the specified time
  autoCloseTimer = setTimeout(() => {
    handleContinue()
  }, seconds * 1000)
}

function clearTimers() {
  if (autoCloseTimer) {
    clearTimeout(autoCloseTimer)
    autoCloseTimer = null
  }
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
  autoCloseCountdown.value = 0
}

function startButtonDisableTimer() {
  isButtonDisabled.value = true
  buttonDisableCountdown.value = BUTTON_DISABLE_DURATION / 1000

  buttonDisableCountdownInterval = setInterval(() => {
    buttonDisableCountdown.value--
    if (buttonDisableCountdown.value <= 0) {
      clearInterval(buttonDisableCountdownInterval!)
    }
  }, COUNTDOWN_INTERVAL)

  buttonDisableTimer = setTimeout(() => {
    isButtonDisabled.value = false
    buttonDisableCountdown.value = 0
  }, BUTTON_DISABLE_DURATION)
}

function clearButtonDisableTimers() {
  if (buttonDisableTimer) {
    clearTimeout(buttonDisableTimer)
    buttonDisableTimer = null
  }
  if (buttonDisableCountdownInterval) {
    clearInterval(buttonDisableCountdownInterval)
    buttonDisableCountdownInterval = null
  }
  if (enterDisableTimer) {
    clearTimeout(enterDisableTimer)
    enterDisableTimer = null
  }
  isButtonDisabled.value = false
  buttonDisableCountdown.value = 0
  isEnterDisabled.value = false
}

function handleContinue() {
  clearTimers()
  clearButtonDisableTimers()
  showFeedback.value = false
  emit('next')
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter' && showFeedback.value && !isEnterDisabled.value) {
    handleContinue()
  }
}

onMounted(() => {
  globalThis.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  globalThis.removeEventListener('keydown', handleKeyDown)
  clearAllTimers()
  clearButtonDisableTimers()
})
</script>

<template>
  <div class="flashcard-container">
    <!-- Question Card -->
    <q-card class="q-mb-md">
      <q-card-section class="text-center q-pa-md">
        <div class="row justify-between items-center q-mb-sm">
          <q-badge
            color="primary"
            :label="`Level ${card.level}`"
            data-cy="card-level"
          />
          <div
            v-if="card.time < MAX_CARD_TIME"
            class="text-caption text-weight-medium text-grey-7"
            data-cy="card-time"
          >
            {{ card.time.toFixed(1) }}s
          </div>
        </div>
        <div
          class="q-my-md text-weight-bold"
          :class="$q.screen.gt.xs ? 'text-h2' : 'text-h3'"
          data-cy="question-display"
        >
          {{ displayQuestion }}
        </div>

        <!-- Show correct answer after submission -->
        <div
          v-if="showFeedback && answerData"
          class="q-mt-lg text-h5 text-weight-medium text-positive"
        >
          {{ card.answer }}
        </div>
      </q-card-section>
    </q-card>

    <!-- Answer Input Section -->
    <div v-if="!showFeedback">
      <q-input
        v-model.number="userAnswer"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        outlined
        class="q-mb-md"
        @keyup.enter="submitAnswer"
        autofocus
        input-class="text-h3 text-center"
        ref="answerInput"
        :rules="[val => val === null || Number.isInteger(val)]"
        data-cy="answer-input"
      />

      <q-btn
        color="primary"
        size="lg"
        class="full-width q-mb-md"
        @click="submitAnswer"
        :disable="userAnswer === null || userAnswer === undefined || isButtonDisabled"
        icon="check"
        :label="isButtonDisabled ? `${TEXT_DE.common.wait}` : TEXT_DE.common.check"
        data-cy="submit-answer-button"
      />
    </div>

    <!-- Feedback Button Section (without large colored card) -->
    <div v-else-if="answerData">
      <!-- Show user answer vs correct answer comparison on wrong answers -->
      <q-card
        v-if="!answerData.isCorrect"
        class="q-mb-md"
        data-cy="wrong-answer-feedback"
      >
        <q-card-section class="text-center q-pa-md">
          <div class="row items-center justify-center text-h5">
            <span
              class="text-negative text-weight-bold"
              style="text-decoration: line-through; text-decoration-thickness: 3px"
              >{{ answerData.userAnswer }}</span
            >
            <q-icon
              name="arrow_forward"
              size="sm"
              class="q-mx-sm"
            />
            <span class="text-positive text-weight-bold text-h4">{{ card.answer }}</span>
          </div>
        </q-card-section>
      </q-card>

      <!-- Points display on correct answers -->
      <q-card
        v-else
        class="q-mb-md bg-positive-1"
        data-cy="correct-answer-feedback"
      >
        <q-card-section class="text-center q-pa-md">
          <div class="text-h5 text-weight-bold text-positive">
            +{{ answerData.totalPoints }} Punkte
          </div>
          <div class="text-caption q-mt-xs text-weight-medium text-grey-8">
            <span v-if="answerData.speedBonus > 0">
              {{ answerData.levelBonus }} + {{ answerData.basePoints }} +
              {{ answerData.speedBonus }} = {{ answerData.totalPoints }}
            </span>
            <span v-else>
              {{ answerData.levelBonus }} + {{ answerData.basePoints }} =
              {{ answerData.totalPoints }}
            </span>
          </div>
        </q-card-section>
      </q-card>

      <!-- Continue Button with icon -->
      <q-btn
        size="lg"
        class="full-width"
        :color="answerData.isCorrect ? 'positive' : 'negative'"
        :disable="isButtonDisabled || isEnterDisabled"
        :label="
          isButtonDisabled || isEnterDisabled ? `${TEXT_DE.common.wait}` : TEXT_DE.common.continue
        "
        @click="handleContinue"
        data-cy="continue-button"
        :icon="answerData.isCorrect ? 'check_circle' : 'cancel'"
      />
    </div>
  </div>
</template>

<style scoped>
.flashcard-container {
  width: 100%;
  max-width: 600px;
}
</style>

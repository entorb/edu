<script setup lang="ts">
import { ref, computed, watch, onUnmounted, onMounted } from 'vue'
import type { Card, GameSettings } from '../types'
import { normalizeString, levenshteinDistance } from '../utils/helpers'
import { shuffleArray } from '@flashcards/shared/utils'
import { TEXT_DE, type AnswerResult } from '@flashcards/shared'
import { MAX_TIME, LEVENSHTEIN_THRESHOLD } from '../config/constants'

interface Props {
  card: Card
  allCards: Card[]
  settings: GameSettings
  elapsedTime?: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  answer: [result: AnswerResult, answerTime: number]
  next: []
}>()

const showAnswer = ref(false)
const answerStatus = ref<AnswerResult | null>(null)
const userAnswer = ref('')
const options = ref<string[]>([])
const feedbackData = ref<{
  type: 'simple' | 'close' | 'typing-incorrect'
  message?: string
  userInput?: string
  correctText?: string
  highlightedText?: string
}>({ type: 'simple' })
const showProceedButton = ref(false)
const isProceedDisabled = ref(false)
const startTime = ref<number>(0)
const disableStartTime = ref<number>(0)

let nextCardTimer: ReturnType<typeof setTimeout> | null = null
let proceedEnableTimer: ReturnType<typeof setTimeout> | null = null

// Compute question and answer based on language direction
const question = computed(() => {
  return props.settings.language === 'en-de' ? props.card.en : props.card.de
})

const correctAnswer = computed(() => {
  return props.settings.language === 'en-de' ? props.card.de : props.card.en
})

const targetLang = computed(() => {
  return props.settings.language === 'en-de' ? 'de' : 'en'
})

// Determine which time to display based on mode
const displayTime = computed(() => {
  if (props.settings.mode === 'blind') {
    return props.card.time_blind
  } else if (props.settings.mode === 'typing') {
    return props.card.time_typing
  }
  return MAX_TIME // Don't show time for multiple-choice
})

// Generate options for multiple choice
watch(
  () => [props.card, props.settings.mode],
  () => {
    if (props.settings.mode === 'multiple-choice') {
      const otherAnswers = props.allCards
        .filter(c => c.en !== props.card.en)
        .map(c => c[targetLang.value])

      const shuffledOthers = shuffleArray(otherAnswers)
      const incorrectOptions = [...new Set(shuffledOthers)].slice(0, 3)

      options.value = shuffleArray([...incorrectOptions, correctAnswer.value])
    }
  },
  { immediate: true }
)

// Reset state when card changes and start timer
watch(
  () => props.card,
  () => {
    showAnswer.value = false
    answerStatus.value = null
    userAnswer.value = ''
    feedbackData.value = { type: 'simple' }
    showProceedButton.value = false
    isProceedDisabled.value = false
    startTime.value = Date.now()
    if (nextCardTimer) clearTimeout(nextCardTimer)
    if (proceedEnableTimer) clearTimeout(proceedEnableTimer)
  },
  { immediate: true }
)

// Handle Enter key to proceed when button is enabled
function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter' && showProceedButton.value && !isProceedDisabled.value) {
    event.preventDefault()
    emit('next')
  }
}

onMounted(() => {
  globalThis.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  globalThis.removeEventListener('keydown', handleKeyDown)
  if (nextCardTimer) clearTimeout(nextCardTimer)
  if (proceedEnableTimer) clearTimeout(proceedEnableTimer)
})

function processAnswer(result: AnswerResult) {
  if (answerStatus.value) return

  // Calculate answer time in seconds
  const answerTime = (Date.now() - startTime.value) / 1000
  emit('answer', result, answerTime)
  answerStatus.value = result
  showAnswer.value = true

  // Always show proceed button for all answer types
  showProceedButton.value = true

  if (result === 'correct') {
    // For correct answers: auto-advance after 3 seconds, but allow manual continue
    isProceedDisabled.value = false
    nextCardTimer = setTimeout(() => emit('next'), 3000)
  } else {
    // For incorrect/close answers: disable button for 3 seconds
    isProceedDisabled.value = true
    disableStartTime.value = Date.now()
    proceedEnableTimer = setTimeout(() => (isProceedDisabled.value = false), 3000)

    if (result === 'close') {
      const mainCorrectAnswer = correctAnswer.value.split('/')[0].trim()
      feedbackData.value = {
        type: 'close',
        userInput: userAnswer.value,
        correctText: mainCorrectAnswer
      }
    } else if (props.settings.mode === 'typing') {
      feedbackData.value = {
        type: 'typing-incorrect',
        userInput: userAnswer.value,
        correctText: correctAnswer.value
      }
    }
  }
}

function handleMultipleChoiceSubmit(option: string) {
  processAnswer(option === correctAnswer.value ? 'correct' : 'incorrect')
}

function handleBlindSubmit(correct: boolean) {
  if (correct) {
    // For correct answers in blind mode, show button and auto-advance
    if (answerStatus.value) return
    const answerTime = (Date.now() - startTime.value) / 1000
    emit('answer', 'correct', answerTime)
    answerStatus.value = 'correct'
    showAnswer.value = true
    showProceedButton.value = true
    isProceedDisabled.value = false
    // Auto-advance after 3 seconds, but allow manual continue
    nextCardTimer = setTimeout(() => emit('next'), 3000)
  } else {
    processAnswer('incorrect')
  }
}

function handleTypingSubmit() {
  if (answerStatus.value) return

  const normalizedUserAnswer = normalizeString(userAnswer.value)
  const possibleAnswers = correctAnswer.value.split('/').map(normalizeString)

  // If DE->EN, also accept answers without the leading "to "
  if (props.settings.language === 'de-en') {
    const answersWithoutTo = possibleAnswers
      .filter(ans => ans.startsWith('to '))
      .map(ans => ans.substring(3))
    possibleAnswers.push(...answersWithoutTo)
  }

  if (possibleAnswers.some(ans => ans === normalizedUserAnswer)) {
    processAnswer('correct')
    return
  }

  // Check for "close" answers using configurable threshold
  if (
    possibleAnswers.some(
      ans => levenshteinDistance(normalizedUserAnswer, ans) <= LEVENSHTEIN_THRESHOLD
    )
  ) {
    processAnswer('close')
    return
  }

  processAnswer('incorrect')
}
</script>

<template>
  <div class="flashcard-container">
    <!-- Question Card - 1x1 style -->
    <q-card class="q-mb-md">
      <q-card-section class="text-center q-pa-md">
        <div class="row justify-between items-center q-mb-sm">
          <q-badge
            color="primary"
            :label="`Level ${card.level}`"
          />
          <div
            v-if="displayTime < MAX_TIME"
            class="text-caption text-weight-medium text-grey-7"
          >
            {{ displayTime.toFixed(1) }}s
          </div>
        </div>
        <div
          class="q-my-md text-weight-bold text-h4"
          data-cy="game-page-question"
        >
          {{ question }}
        </div>
        <!-- Show answer if revealed -->
        <div
          v-if="showAnswer"
          class="q-mt-md text-weight-bold text-h4"
        >
          {{ correctAnswer }}
        </div>
      </q-card-section>
    </q-card>

    <!-- Input Section -->
    <div class="q-mt-md">
      <!-- Feedback Details (without big colored card) -->
      <q-card
        v-if="answerStatus && answerStatus !== 'correct' && feedbackData.type !== 'simple'"
        class="q-mb-md"
      >
        <q-card-section class="text-center q-pa-md">
          <!-- Close answer feedback -->
          <div v-if="feedbackData.type === 'close'">
            <div class="text-subtitle1 text-weight-medium q-mb-md text-warning">
              {{ TEXT_DE.wordplay.game.closeAnswer }}
            </div>
            <div class="row items-center justify-center text-h6">
              <span
                class="text-warning text-weight-bold"
                style="text-decoration: line-through; text-decoration-thickness: 2px"
                >{{ feedbackData.userInput }}</span
              >
              <q-icon
                name="arrow_forward"
                size="sm"
                class="q-mx-sm"
              />
              <span class="text-positive text-weight-bold">{{ feedbackData.correctText }}</span>
            </div>
          </div>

          <!-- Typing mode incorrect feedback -->
          <div v-else-if="feedbackData.type === 'typing-incorrect'">
            <div class="row items-center justify-center text-h6">
              <span
                class="text-negative text-weight-bold"
                style="text-decoration: line-through; text-decoration-thickness: 2px"
                >{{ feedbackData.userInput }}</span
              >
              <q-icon
                name="arrow_forward"
                size="sm"
                class="q-mx-sm"
              />
              <span class="text-positive text-weight-bold">{{ feedbackData.correctText }}</span>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Continue Button with icon when feedback is shown -->
      <q-btn
        v-if="answerStatus && showProceedButton"
        size="lg"
        class="full-width q-mb-md"
        :color="
          answerStatus === 'correct'
            ? 'positive'
            : answerStatus === 'close'
              ? 'warning'
              : 'negative'
        "
        :disable="isProceedDisabled"
        :label="isProceedDisabled ? `${TEXT_DE.common.wait}` : TEXT_DE.common.continue"
        @click="emit('next')"
        data-cy="continue-button"
        :icon="
          answerStatus === 'correct'
            ? 'check_circle'
            : answerStatus === 'close'
              ? 'warning'
              : 'cancel'
        "
      />

      <!-- Multiple Choice -->
      <div
        v-else-if="settings.mode === 'multiple-choice'"
        class="row q-col-gutter-sm"
      >
        <div
          v-for="option in options"
          :key="option"
          class="col-6"
        >
          <q-btn
            :disable="!!answerStatus"
            outline
            color="grey-8"
            :label="option"
            no-caps
            class="full-width"
            @click="handleMultipleChoiceSubmit(option)"
            data-cy="multiple-choice-option"
          />
        </div>
      </div>

      <!-- Blind Mode -->
      <div v-else-if="settings.mode === 'blind'">
        <q-btn
          v-if="!showAnswer"
          color="primary"
          :label="TEXT_DE.wordplay.game.revealAnswer"
          no-caps
          class="full-width"
          @click="showAnswer = true"
          data-cy="reveal-answer-button"
        />
        <div
          v-else
          class="q-gutter-sm"
        >
          <p class="text-center text-grey-7 q-mb-sm">
            {{ TEXT_DE.wordplay.game.wasYourAnswerCorrect }}
          </p>
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-btn
                :disable="!!answerStatus"
                color="negative"
                :label="TEXT_DE.common.no"
                no-caps
                class="full-width"
                @click="handleBlindSubmit(false)"
                data-cy="blind-no-button"
              />
            </div>
            <div class="col-6">
              <q-btn
                :disable="!!answerStatus"
                color="positive"
                :label="TEXT_DE.common.yes"
                no-caps
                class="full-width"
                @click="handleBlindSubmit(true)"
                data-cy="blind-yes-button"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Typing Mode -->
      <q-form
        v-else-if="settings.mode === 'typing' && !answerStatus"
        @submit.prevent="handleTypingSubmit"
      >
        <q-input
          v-model="userAnswer"
          autofocus
          outlined
          :placeholder="TEXT_DE.wordplay.game.typePlaceholder"
          autocapitalize="none"
          autocorrect="off"
          spellcheck="false"
          class="q-mb-sm"
          data-cy="typing-input"
        />
        <q-btn
          type="submit"
          color="primary"
          :label="TEXT_DE.common.check"
          no-caps
          class="full-width"
          data-cy="check-answer-button"
        />
      </q-form>
    </div>
  </div>
</template>

<style scoped>
.flashcard-container {
  width: 100%;
  max-width: 500px;
}
</style>

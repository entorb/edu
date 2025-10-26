<script setup lang="ts">
// TODO:
// cspell:disable

import { ref, computed, watch, onUnmounted } from 'vue'
import type { Card, GameSettings, AnswerResult } from '../types'
import { shuffleArray, normalizeString, levenshteinDistance } from '../utils/helpers'
import { TEXT_DE } from '@flashcards/shared'
import { MAX_TIME } from '../config/constants'

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

const isFlipped = ref(false)
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

// Generate options for multiple choice
watch(
  () => [props.card, props.settings.mode],
  () => {
    if (props.settings.mode === 'multiple-choice') {
      const otherAnswers = props.allCards
        .filter(c => c.id !== props.card.id)
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
    isFlipped.value = false
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

onUnmounted(() => {
  if (nextCardTimer) clearTimeout(nextCardTimer)
  if (proceedEnableTimer) clearTimeout(proceedEnableTimer)
})

function processAnswer(result: AnswerResult) {
  if (answerStatus.value) return

  // Calculate answer time in seconds
  const answerTime = (Date.now() - startTime.value) / 1000
  emit('answer', result, answerTime)
  answerStatus.value = result
  isFlipped.value = true

  if (result === 'correct') {
    nextCardTimer = setTimeout(() => emit('next'), 2000)
  } else {
    showProceedButton.value = true
    isProceedDisabled.value = true
    proceedEnableTimer = setTimeout(() => (isProceedDisabled.value = false), 3000)

    if (result === 'close') {
      const mainCorrectAnswer = correctAnswer.value.split('/')[0].trim()
      feedbackData.value = {
        type: 'close',
        userInput: userAnswer.value,
        correctText: mainCorrectAnswer
      }
    } else {
      if (props.settings.mode === 'typing') {
        feedbackData.value = {
          type: 'typing-incorrect',
          userInput: userAnswer.value,
          correctText: correctAnswer.value
        }
      }
    }
  }
}

function handleMultipleChoiceSubmit(option: string) {
  processAnswer(option === correctAnswer.value ? 'correct' : 'incorrect')
}

function handleBlindSubmit(correct: boolean) {
  processAnswer(correct ? 'correct' : 'incorrect')
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

  // Check for "close" answers
  if (possibleAnswers.some(ans => levenshteinDistance(normalizedUserAnswer, ans) === 1)) {
    processAnswer('close')
    return
  }

  processAnswer('incorrect')
}

// Compute character-by-character diff for "close" answers
const charDiff = computed(() => {
  if (feedbackData.value.type !== 'close') return []

  const userInput = feedbackData.value.userInput || ''
  const correctText = feedbackData.value.correctText || ''

  return correctText.split('').map((correctChar, index) => ({
    char: correctChar,
    isDifferent:
      index >= userInput.length ||
      userInput.charAt(index).toLowerCase() !== correctChar.toLowerCase()
  }))
})
</script>

<template>
  <div class="flashcard-container">
    <!-- Card with flip animation -->
    <div
      class="flip-container"
      :style="{ perspective: '1000px' }"
    >
      <div
        class="flip-card"
        :style="{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.5s'
        }"
      >
        <!-- Front of card -->
        <q-card
          class="flip-card-face flip-card-front"
          :style="{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }"
        >
          <q-card-section style="min-height: 144px">
            <div class="row justify-between items-center q-mb-sm">
              <q-badge
                color="primary"
                :label="`Level ${card.level}`"
              />
              <div
                v-if="elapsedTime !== undefined && elapsedTime < MAX_TIME"
                class="text-caption text-weight-medium text-grey-7"
              >
                {{ elapsedTime.toFixed(1) }}s
              </div>
            </div>
            <div class="flex flex-center text-center">
              <h2 class="text-h5 text-weight-bold">{{ question }}</h2>
            </div>
          </q-card-section>
        </q-card>

        <!-- Back of card -->
        <q-card
          class="flip-card-face flip-card-back"
          :style="{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }"
        >
          <q-card-section style="min-height: 144px">
            <div class="row justify-between items-center q-mb-sm">
              <q-badge
                color="primary"
                :label="`Level ${card.level}`"
              />
              <div
                v-if="elapsedTime !== undefined && elapsedTime < MAX_TIME"
                class="text-caption text-weight-medium text-grey-7"
              >
                {{ elapsedTime.toFixed(1) }}s
              </div>
            </div>
            <div class="flex flex-center text-center column">
              <p class="text-h6 text-grey-6 q-mb-sm">{{ question }}</p>
              <h2 class="text-h5 text-weight-bold">{{ correctAnswer }}</h2>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Input Section -->
    <div class="q-mt-md">
      <!-- Feedback -->
      <div
        v-if="answerStatus && feedbackData.type"
        class="text-center q-mb-md"
      >
        <!-- Close answer feedback -->
        <div
          v-if="feedbackData.type === 'close'"
          class="text-warning"
        >
          <p class="q-mb-xs">
            Du hast getippt:
            <code class="bg-warning-1 text-warning px-1 rounded">{{ feedbackData.userInput }}</code>
          </p>
          <p class="q-mt-xs">
            Fast richtig! Korrekt:
            <span class="text-weight-bold">
              <template
                v-for="(item, idx) in charDiff"
                :key="idx"
              >
                <strong
                  v-if="item.isDifferent"
                  class="text-negative text-decoration-underline"
                  >{{ item.char }}</strong
                >
                <template v-else>{{ item.char }}</template>
              </template>
            </span>
          </p>
        </div>

        <!-- Typing mode incorrect feedback -->
        <div
          v-else-if="feedbackData.type === 'typing-incorrect'"
          class="text-negative"
        >
          <p>
            Du hast getippt:
            <code class="bg-negative-1 text-negative px-1 rounded">{{
              feedbackData.userInput
            }}</code
            >, richtig ist:
            <strong class="text-positive">{{ feedbackData.correctText }}</strong>
          </p>
        </div>

        <q-btn
          v-if="showProceedButton"
          :disable="isProceedDisabled"
          color="primary"
          :label="TEXT_DE.common.continue"
          no-caps
          class="q-mt-sm full-width"
          @click="emit('next')"
        />
      </div>

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
          />
        </div>
      </div>

      <!-- Blind Mode -->
      <div v-else-if="settings.mode === 'blind'">
        <q-btn
          v-if="!isFlipped"
          color="primary"
          :label="TEXT_DE.wordplay.game.revealAnswer"
          no-caps
          class="full-width"
          @click="isFlipped = true"
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
                color="positive"
                :label="TEXT_DE.common.yes"
                no-caps
                class="full-width"
                @click="handleBlindSubmit(true)"
              />
            </div>
            <div class="col-6">
              <q-btn
                :disable="!!answerStatus"
                color="negative"
                :label="TEXT_DE.common.no"
                no-caps
                class="full-width"
                @click="handleBlindSubmit(false)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Typing Mode -->
      <q-form
        v-else-if="settings.mode === 'typing'"
        @submit.prevent="handleTypingSubmit"
      >
        <q-input
          v-model="userAnswer"
          :disable="!!answerStatus"
          autofocus
          outlined
          :placeholder="TEXT_DE.wordplay.game.typePlaceholder"
          autocapitalize="none"
          autocorrect="off"
          spellcheck="false"
          class="q-mb-sm"
        />
        <q-btn
          :disable="!!answerStatus"
          type="submit"
          color="primary"
          :label="TEXT_DE.common.check"
          no-caps
          class="full-width"
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

.flip-container {
  width: 100%;
}

.flip-card {
  position: relative;
  width: 100%;
  min-height: 144px;
}

.flip-card-face {
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
}

.flip-card-front,
.flip-card-back {
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>

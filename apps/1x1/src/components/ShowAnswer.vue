<script setup lang="ts">
import type { Card } from '@/types'
import { AnswerFeedback } from '@flashcards/shared/components'

interface Props {
  show: boolean
  isCorrect: boolean
  currentCard: Card | undefined
  userAnswer: number | null
  lastPoints: number
  basePoints: number
  levelBonus: number
  speedBonus: number
  autoCloseCountdown: number
  isButtonDisabled: boolean
  buttonDisableCountdown: number
  isEnterDisabled: boolean
}

interface Emits {
  (e: 'continue'): void
  (e: 'handleEnter'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

function handleContinue() {
  emit('continue')
}

function handleKeyup(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    emit('handleEnter')
  }
}
</script>

<template>
  <q-dialog
    :model-value="show"
    persistent
    @keyup="handleKeyup"
  >
    <div style="min-width: 350px; max-width: 90vw">
      <AnswerFeedback
        :status="isCorrect ? 'correct' : 'incorrect'"
        icon-size="100px"
        :is-button-disabled="isButtonDisabled || isEnterDisabled"
        :button-disable-countdown="buttonDisableCountdown"
        :auto-close-countdown="autoCloseCountdown"
        @continue="handleContinue"
      >
        <template #header>
          <div
            v-if="isCorrect"
            class="q-mt-md"
          >
            <div class="text-h5 text-weight-bold">+{{ lastPoints }} Punkte</div>
            <div class="text-caption q-mt-xs text-weight-medium">
              <span v-if="speedBonus > 0">
                {{ basePoints }} + {{ levelBonus }} + {{ speedBonus }} = {{ lastPoints }}
              </span>
              <span v-else> {{ basePoints }} + {{ levelBonus }} = {{ lastPoints }} </span>
            </div>
          </div>
        </template>

        <template
          v-if="!isCorrect"
          #details
        >
          <div class="text-h4 q-mb-md text-grey-8 text-weight-medium">
            {{ currentCard?.question.replace('x', '×') }}
          </div>
          <div class="row items-center justify-center text-h5">
            <span
              class="text-negative text-weight-bold"
              style="text-decoration: line-through; text-decoration-thickness: 3px"
              >{{ userAnswer }}</span
            >
            <q-icon
              name="arrow_forward"
              size="sm"
              class="q-mx-sm"
            />
            <span class="text-positive text-weight-bold text-h4">{{ currentCard?.answer }}</span>
          </div>
        </template>
      </AnswerFeedback>
    </div>
  </q-dialog>
</template>

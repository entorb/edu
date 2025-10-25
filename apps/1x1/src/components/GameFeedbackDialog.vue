<script setup lang="ts">
import type { Card } from '@/types'
import { TEXT_DE } from '@/config/text-de'

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
    class="feedback-dialog"
  >
    <q-card class="feedback-card">
      <q-card-section
        :class="[isCorrect ? 'bg-positive' : 'bg-negative']"
        class="text-white text-center q-pa-lg"
      >
        <q-icon
          :name="isCorrect ? 'check_circle' : 'cancel'"
          color="white"
          size="100px"
          class="q-mb-md animate-scale-in"
        />
        <div class="text-h3 text-weight-bold q-mb-sm">
          {{ isCorrect ? TEXT_DE.correct : TEXT_DE.wrong }}
        </div>
        <div
          v-if="isCorrect"
          class="q-mt-md"
        >
          <div class="text-h5 text-weight-bold">+{{ lastPoints }} Punkte</div>
          <div class="text-caption q-mt-xs points-calculation">
            <span v-if="speedBonus > 0">
              {{ basePoints }} + {{ levelBonus }} + {{ speedBonus }} = {{ lastPoints }}
            </span>
            <span v-else> {{ basePoints }} + {{ levelBonus }} = {{ lastPoints }} </span>
          </div>
        </div>
      </q-card-section>

      <q-card-section
        v-if="!isCorrect"
        class="text-center q-pa-lg"
      >
        <div class="text-h4 q-mb-md text-grey-8 text-weight-medium">
          {{ currentCard?.question.replace('x', '×') }}
        </div>
        <div class="text-h5 answer-comparison">
          <span class="text-negative text-weight-bold wrong-answer">{{ userAnswer }}</span>
          <q-icon
            name="arrow_forward"
            size="sm"
            class="q-mx-sm"
          />
          <span class="text-positive text-weight-bold correct-answer">{{
            currentCard?.answer
          }}</span>
        </div>
      </q-card-section>

      <q-card-actions
        align="center"
        class="q-pa-md"
        :class="isCorrect ? 'bg-positive-1' : 'bg-negative-1'"
      >
        <q-btn
          :color="isCorrect ? 'positive' : 'negative'"
          :label="
            isButtonDisabled ? `${TEXT_DE.wait} ${buttonDisableCountdown}s...` : TEXT_DE.continue
          "
          size="lg"
          unelevated
          class="full-width continue-btn text-weight-medium"
          autofocus
          :disable="isButtonDisabled || isEnterDisabled"
          @click="handleContinue"
        />
        <div
          v-if="autoCloseCountdown > 0"
          class="text-caption q-mt-sm text-grey-7 full-width text-center"
        >
          {{ TEXT_DE.autoCloseIn }} {{ autoCloseCountdown }}s...
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
/* Quasar handles most styling - keep only unique patterns */
.feedback-card {
  min-width: 350px;
  max-width: 90vw;
  border-radius: 16px;
  overflow: hidden;
}

.points-calculation {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.answer-comparison {
  display: flex;
  align-items: center;
  justify-content: center;
}

.wrong-answer {
  text-decoration: line-through;
  text-decoration-thickness: 3px;
}

.correct-answer {
  font-size: 1.8rem;
}

.continue-btn {
  height: 56px;
  border-radius: 8px;
}
</style>

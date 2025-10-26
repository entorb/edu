<script setup lang="ts">
import type { Card } from '@/types'
import { TEXT_DE } from '@flashcards/shared'

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
    <q-card style="min-width: 350px; max-width: 90vw">
      <q-card-section
        :class="[isCorrect ? 'bg-positive' : 'bg-negative']"
        class="text-white text-center q-pa-lg"
      >
        <q-icon
          :name="isCorrect ? 'check_circle' : 'cancel'"
          color="white"
          size="100px"
          class="q-mb-md"
        />
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
      </q-card-section>

      <q-card-section
        v-if="!isCorrect"
        class="text-center q-pa-lg"
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
      </q-card-section>

      <q-card-actions
        align="center"
        class="q-pa-md"
        :class="isCorrect ? 'bg-positive-1' : 'bg-negative-1'"
      >
        <q-btn
          :color="isCorrect ? 'positive' : 'negative'"
          :label="
            isButtonDisabled
              ? `${TEXT_DE.common.wait} ${buttonDisableCountdown}s...`
              : TEXT_DE.common.continue
          "
          size="lg"
          unelevated
          class="full-width text-weight-medium"
          autofocus
          :disable="isButtonDisabled || isEnterDisabled"
          @click="handleContinue"
        />
        <div
          v-if="autoCloseCountdown > 0"
          class="text-caption q-mt-sm text-grey-7 full-width text-center"
        >
          {{ TEXT_DE.multiply.autoCloseIn }} {{ autoCloseCountdown }}s...
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { TEXT_DE } from '../text-de'

type FeedbackStatus = 'correct' | 'close' | 'incorrect'

interface Props {
  status: FeedbackStatus
  iconSize?: string
  showContinueButton?: boolean
  isButtonDisabled?: boolean
  buttonDisableCountdown?: number
  autoCloseCountdown?: number
}

type Emits = (e: 'continue') => void

withDefaults(defineProps<Props>(), {
  iconSize: '80px',
  showContinueButton: true,
  isButtonDisabled: false,
  buttonDisableCountdown: 0,
  autoCloseCountdown: 0
})

const emit = defineEmits<Emits>()

function handleContinue() {
  emit('continue')
}

function getIcon(status: FeedbackStatus): string {
  switch (status) {
    case 'correct':
      return 'check_circle'
    case 'close':
      return 'warning'
    case 'incorrect':
      return 'cancel'
  }
}

function getBackgroundClass(status: FeedbackStatus): string {
  switch (status) {
    case 'correct':
      return 'bg-positive'
    case 'close':
      return 'bg-warning'
    case 'incorrect':
      return 'bg-negative'
  }
}

function getButtonBackgroundClass(status: FeedbackStatus): string {
  switch (status) {
    case 'correct':
      return 'bg-positive-1'
    case 'close':
      return 'bg-warning-1'
    case 'incorrect':
      return 'bg-negative-1'
  }
}

function getColor(status: FeedbackStatus): string {
  switch (status) {
    case 'correct':
      return 'positive'
    case 'close':
      return 'warning'
    case 'incorrect':
      return 'negative'
  }
}
</script>

<template>
  <q-card
    class="q-mb-md"
    :data-cy="
      status === 'correct'
        ? 'correct-answer-feedback'
        : status === 'incorrect'
          ? 'wrong-answer-feedback'
          : ''
    "
  >
    <!-- Icon Section -->
    <q-card-section
      :class="[getBackgroundClass(status)]"
      class="text-white text-center q-pa-lg"
    >
      <q-icon
        :name="getIcon(status)"
        color="white"
        :size="iconSize"
        class="q-mb-md"
      />

      <!-- Header slot for status text or points -->
      <slot name="header" />
    </q-card-section>

    <!-- Details Section -->
    <q-card-section
      v-if="$slots.details"
      class="text-center q-pa-lg"
    >
      <slot name="details" />
    </q-card-section>

    <!-- Continue Button -->
    <q-card-actions
      v-if="showContinueButton"
      align="center"
      class="q-pa-md"
      :class="getButtonBackgroundClass(status)"
    >
      <q-btn
        :color="getColor(status)"
        :label="isButtonDisabled ? TEXT_DE.common.wait : TEXT_DE.common.continue"
        size="lg"
        unelevated
        class="full-width text-weight-medium"
        :disable="isButtonDisabled"
        @click="handleContinue"
        data-cy="continue-button"
      />
    </q-card-actions>
  </q-card>
</template>

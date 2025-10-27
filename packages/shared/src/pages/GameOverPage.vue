<script setup lang="ts">
import { computed } from 'vue'
import { TEXT_DE } from '../text-de'

interface BonusReason {
  label: string
  points: number
}

interface Props {
  points: number
  correctAnswers: number
  totalCards: number
  bonusReasons?: BonusReason[]
  showMascot: boolean
}

interface Emits {
  (e: 'goHome'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const bonusPoints = computed(() => {
  return props.bonusReasons?.reduce((sum, r) => sum + r.points, 0) || 0
})

const totalPoints = computed(() => {
  return props.points + bonusPoints.value
})

function handleGoHome() {
  emit('goHome')
}
</script>

<template>
  <q-page
    class="flex flex-center q-pa-md"
    style="max-width: 600px; margin: 0 auto"
  >
    <div class="full-width text-center">
      <!-- Mascot or Trophy Icon -->
      <div class="flex flex-center q-mb-md">
        <slot
          v-if="showMascot"
          name="mascot"
        />
        <q-icon
          v-else
          name="emoji_events"
          color="amber"
          size="100px"
        />
      </div>

      <!-- Results Card -->
      <q-card class="q-mt-lg">
        <q-card-section class="q-pa-lg">
          <div class="row q-gutter-md justify-center">
            <div style="min-width: 90px">
              <div class="text-h4 text-primary text-weight-bold">
                <q-icon
                  name="emoji_events"
                  color="amber"
                  size="36px"
                />
                {{ points }}
              </div>
            </div>
            <div style="min-width: 90px">
              <span class="text-h4 text-positive text-weight-bold">
                {{ correctAnswers }}
              </span>
              <span class="text-h4 text-weight-bold">
                /
                {{ totalCards }}
              </span>
            </div>
          </div>

          <!-- Bonus Points Section -->
          <div
            v-if="bonusReasons && bonusReasons.length > 0"
            class="q-mt-md q-pa-sm bg-amber-1 rounded-borders"
          >
            <q-separator class="q-mb-md" />
            <div class="text-subtitle2 text-amber-8 text-weight-bold q-mb-sm">
              <q-icon
                name="star"
                color="amber"
              />
              {{ TEXT_DE.multiply.bonusPoints }}
            </div>
            <div
              v-for="(reason, index) in bonusReasons"
              :key="index"
              class="row justify-center q-mb-xs"
            >
              <q-chip
                color="amber-2"
                text-color="amber-9"
                icon="add"
                dense
              >
                +{{ reason.points }} {{ reason.label }}
              </q-chip>
            </div>
            <div class="row justify-center q-mt-sm">
              <div class="text-h6 text-weight-bold">
                {{ points }} + {{ bonusPoints }} = {{ totalPoints }}
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Home Button -->
      <q-btn
        color="primary"
        size="lg"
        class="full-width q-mt-lg"
        icon="home"
        :label="TEXT_DE.common.backToHome"
        unelevated
        @click="handleGoHome"
      />
    </div>
  </q-page>
</template>

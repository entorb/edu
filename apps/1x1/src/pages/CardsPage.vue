<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  loadCards,
  resetCards,
  loadExtendedFeatures,
  addExtendedCards,
  deleteExtendedCards
} from '@/services/storage'
import type { Card } from '@/types'
import {
  MIN_CARD_TIME,
  MAX_CARD_TIME,
  LEVEL_COLORS,
  TIME_COLORS,
  TIME_COLOR_THRESHOLDS,
  BG_COLORS
} from '@/constants'
import { TEXT_DE, useResetCards } from '@flashcards/shared'
import { LevelDistribution } from '@flashcards/shared/components'
import { useQuasar } from 'quasar'

const router = useRouter()
const $q = useQuasar()
const { showResetDialog } = useResetCards()
const cards = ref<Card[]>([])
const extendedFeatures = ref({ feature1x2: false, feature1x12: false, feature1x20: false })

const minTime = computed(() => {
  if (cards.value.length === 0) return MIN_CARD_TIME
  return Math.max(MIN_CARD_TIME, Math.min(...cards.value.map(c => c.time)))
})
const maxTime = computed(() => {
  if (cards.value.length === 0) return MAX_CARD_TIME
  return Math.min(MAX_CARD_TIME, Math.max(...cards.value.map(c => c.time)))
})

// Get Y values to display based on extended features
const yValues = computed(() => {
  const values = [3, 4, 5, 6, 7, 8, 9]
  if (extendedFeatures.value.feature1x2) {
    values.unshift(2)
  }
  if (extendedFeatures.value.feature1x12) {
    values.push(11, 12)
  }
  if (extendedFeatures.value.feature1x20) {
    for (let i = 13; i <= 20; i++) {
      values.push(i)
    }
  }
  return values
})

// Get X values to display based on extended features
const xValues = computed(() => {
  const values = [3, 4, 5, 6, 7, 8, 9]
  if (extendedFeatures.value.feature1x2) {
    values.unshift(2)
  }
  if (extendedFeatures.value.feature1x12) {
    values.push(11, 12)
  }
  if (extendedFeatures.value.feature1x20) {
    for (let i = 13; i <= 20; i++) {
      values.push(i)
    }
  }
  return values
})

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    goHome()
  }
}

onMounted(() => {
  cards.value = loadCards()
  extendedFeatures.value = loadExtendedFeatures()
  globalThis.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  globalThis.removeEventListener('keydown', handleKeyDown)
})

function getCard(y: number, x: number): Card | undefined {
  return cards.value.find(card => card.question === `${y}x${x}`)
}

function getTimeTextColor(time: number): string {
  if (cards.value.length === 0) return '#666666'

  const min = minTime.value
  const max = maxTime.value
  const range = max - min

  if (range === 0) return TIME_COLORS.veryFast

  const normalized = (time - min) / range

  // Green (fast) to Red (slow) using thresholds
  if (normalized < TIME_COLOR_THRESHOLDS.veryFast) return TIME_COLORS.veryFast
  if (normalized < TIME_COLOR_THRESHOLDS.fast) return TIME_COLORS.fast
  if (normalized < TIME_COLOR_THRESHOLDS.medium) return TIME_COLORS.medium
  if (normalized < TIME_COLOR_THRESHOLDS.slow) return TIME_COLORS.slow
  return TIME_COLORS.verySlow
}

function getCellStyle(y: number, x: number): Record<string, string> {
  // For y > x, use the card from x, y (symmetric)
  const card = y > x ? getCard(x, y) : getCard(y, x)

  if (!card) {
    return {
      backgroundColor: BG_COLORS.disabled,
      color: '#666666'
    }
  }

  return {
    backgroundColor: LEVEL_COLORS[card.level as keyof typeof LEVEL_COLORS] || BG_COLORS.disabled,
    color: getTimeTextColor(card.time)
  }
}

function resetCardsHandler() {
  showResetDialog(() => {
    resetCards()
    cards.value = loadCards()
  })
}

function toggleExtendedFeature(feature: 'feature1x2' | 'feature1x12' | 'feature1x20') {
  const isActive = extendedFeatures.value[feature]

  if (isActive) {
    // Deactivate feature
    $q.dialog({
      title: TEXT_DE.multiply.extendedCards.confirmDeleteTitle,
      message: TEXT_DE.multiply.extendedCards.confirmDeleteMessage,
      cancel: true,
      persistent: true
    }).onOk(() => {
      deleteExtendedCards(feature)
      extendedFeatures.value = loadExtendedFeatures()
      cards.value = loadCards()
      // Show warning if feature1x12 was deactivated
      if (feature === 'feature1x12') {
        $q.notify({
          type: 'warning',
          message: TEXT_DE.multiply.extendedCards.feature1x12Warning,
          position: 'top'
        })
      }
    })
  } else {
    // Activate feature
    // If activating 1x20, also activate 1x12 if not already active
    if (feature === 'feature1x20' && !extendedFeatures.value.feature1x12) {
      addExtendedCards('feature1x12')
    }
    addExtendedCards(feature)
    extendedFeatures.value = loadExtendedFeatures()
    cards.value = loadCards()
    $q.notify({
      type: 'positive',
      message: TEXT_DE.multiply.extendedCards.addSuccess,
      position: 'top'
    })
  }
}

function goHome() {
  router.push({ name: '/' })
}
</script>

<template>
  <q-page
    class="q-pa-md"
    style="max-width: 1200px; margin: 0 auto"
  >
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <q-btn
        flat
        round
        icon="arrow_back"
        @click="goHome"
        size="md"
        data-cy="back-button"
      />
    </div>

    <!-- Content -->
    <div>
      <!-- Level Distribution -->
      <LevelDistribution
        :cards="cards"
        @reset="resetCardsHandler"
        class="q-mb-md"
      />

      <!-- Cards Grid/Matrix -->
      <q-card class="grid-card">
        <q-card-section>
          <div class="text-h6 q-mb-md">
            <q-icon
              name="grid_on"
              class="q-mr-xs"
            />
            {{ TEXT_DE.words.cards }}
          </div>

          <div class="cards-grid-container">
            <div
              class="cards-grid"
              :style="{ gridTemplateColumns: `40px repeat(${xValues.length}, 1fr)` }"
            >
              <!-- Header row with X values -->
              <div class="grid-header"></div>
              <div
                v-for="x in xValues"
                :key="`header-${x}`"
                class="grid-header text-center text-weight-bold"
              >
                {{ x }}
              </div>

              <!-- Rows for each Y value -->
              <template
                v-for="y in yValues"
                :key="`row-${y}`"
              >
                <!-- Y label -->
                <div class="grid-header text-center text-weight-bold">{{ y }}</div>

                <!-- Cells for each X value -->
                <div
                  v-for="x in xValues"
                  :key="`cell-${y}-${x}`"
                  class="grid-cell"
                  :style="getCellStyle(y, x)"
                >
                  <div class="cell-content q-pa-xs">
                    <div class="text-caption text-weight-medium">
                      <!-- Level -->
                      L{{ (y > x ? getCard(x, y) : getCard(y, x))?.level || 1 }}
                    </div>
                    <!-- Question and Answer -->
                    <div class="cell-answer q-my-xs">{{ y }}x{{ x }}<br />= {{ x * y }}</div>
                    <!-- Time -->
                    <div class="text-caption text-weight-medium">
                      {{ (y > x ? getCard(x, y) : getCard(y, x))?.time.toFixed(1) || 60 }}s
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <!-- Legend -->
          <q-separator class="q-my-md" />
          <div class="legend">
            <div class="text-subtitle2 q-mb-sm text-grey-8">
              <q-icon
                name="info_outline"
                size="18px"
                class="q-mr-xs"
              />
              {{ TEXT_DE.cards.legend }}
            </div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <q-chip
                  dense
                  square
                  class="legend-chip"
                >
                  <q-icon
                    name="palette"
                    size="16px"
                    class="q-mr-xs"
                  />
                  <span class="text-caption">{{ TEXT_DE.cards.legendBackground }}</span>
                </q-chip>
              </div>
              <div class="col-12 col-sm-6">
                <q-chip
                  dense
                  square
                  class="legend-chip"
                >
                  <q-icon
                    name="schedule"
                    size="16px"
                    class="q-mr-xs"
                  />
                  <span class="text-caption">{{ TEXT_DE.cards.legendTextColor }}</span>
                </q-chip>
              </div>
            </div>
          </div>

          <!-- Extended Cards Section -->
          <q-separator class="q-my-md" />
          <div class="extended-cards-section">
            <div class="text-subtitle2 q-mb-md text-grey-8">
              <q-icon
                name="extension"
                size="18px"
                class="q-mr-xs"
              />
              {{ TEXT_DE.multiply.extendedCards.title }}
            </div>
            <div class="row q-col-gutter-md">
              <!-- 1x2 Feature -->
              <div class="col-12 col-sm-6 col-md-4">
                <div class="feature-toggle">
                  <div class="feature-label">
                    {{ TEXT_DE.multiply.extendedCards.feature1x2 }}
                  </div>
                  <q-toggle
                    :model-value="extendedFeatures.feature1x2"
                    @update:model-value="toggleExtendedFeature('feature1x2')"
                    data-cy="feature-1x2-toggle"
                  />
                </div>
              </div>

              <!-- 1x12 Feature -->
              <div class="col-12 col-sm-6 col-md-4">
                <div class="feature-toggle">
                  <div class="feature-label">
                    {{ TEXT_DE.multiply.extendedCards.feature1x12 }}
                  </div>
                  <q-toggle
                    :model-value="extendedFeatures.feature1x12"
                    @update:model-value="toggleExtendedFeature('feature1x12')"
                    data-cy="feature-1x12-toggle"
                  />
                </div>
              </div>

              <!-- 1x20 Feature -->
              <div class="col-12 col-sm-6 col-md-4">
                <div class="feature-toggle">
                  <div class="feature-label">
                    {{ TEXT_DE.multiply.extendedCards.feature1x20 }}
                  </div>
                  <q-toggle
                    :model-value="extendedFeatures.feature1x20"
                    @update:model-value="toggleExtendedFeature('feature1x20')"
                    data-cy="feature-1x20-toggle"
                  />
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<style scoped>
/* Essential grid system - CSS Grid is optimal for multiplication table layout */
.cards-grid-container {
  overflow-x: auto;
}

.cards-grid {
  display: grid;
  gap: 6px;
  min-width: 700px;
}

.grid-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  color: #616161;
}

.grid-cell {
  aspect-ratio: 1;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
  min-height: 100px;
  min-width: 100px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.grid-cell:hover {
  transform: scale(1.08);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.cell-content {
  text-align: center;
  width: 100%;
}

.cell-answer {
  font-weight: 700;
  font-size: 1.1rem;
}

/* Extended Cards Section */
.extended-cards-section {
  margin-top: 16px;
}

.feature-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
}

.feature-label {
  font-weight: 500;
  font-size: 0.95rem;
  color: #424242;
}

/* Mobile: compact grid */
@media (max-width: 599.98px) {
  .cards-grid {
    grid-template-columns: 28px repeat(7, 1fr);
    gap: 3px;
    min-width: 360px;
  }

  .grid-cell {
    min-height: 85px;
    min-width: 85px;
    border-width: 1px;
  }

  .cell-content {
    padding: 2px !important;
  }

  .cell-answer {
    font-size: 0.8rem;
    line-height: 1.1;
  }

  .text-caption {
    font-size: 0.65rem !important;
  }

  .feature-toggle {
    flex-direction: column;
    gap: 12px;
  }
}
</style>

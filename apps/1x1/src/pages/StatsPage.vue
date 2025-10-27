<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { loadCards, resetCards } from '@/services/storage'
import type { Card } from '@/types'
import {
  MIN_CARD_TIME,
  MAX_CARD_TIME,
  LEVEL_COLORS,
  TIME_COLORS,
  TIME_COLOR_THRESHOLDS,
  BG_COLORS
} from '@/config/constants'
import { TEXT_DE } from '@flashcards/shared'
import { PwaInstallInfo } from '@flashcards/shared/components'

const router = useRouter()
const $q = useQuasar()
const cards = ref<Card[]>([])

const minTime = computed(() => {
  if (cards.value.length === 0) return MIN_CARD_TIME
  return Math.max(MIN_CARD_TIME, Math.min(...cards.value.map(c => c.time)))
})
const maxTime = computed(() => {
  if (cards.value.length === 0) return MAX_CARD_TIME
  return Math.min(MAX_CARD_TIME, Math.max(...cards.value.map(c => c.time)))
})

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    goHome()
  }
}

onMounted(() => {
  cards.value = loadCards()
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

function getCardCountByLevel(level: number): number {
  return cards.value.filter(card => card.level === level).length
}

function getCard(y: number, x: number): Card | undefined {
  return cards.value.find(card => card.question === `${y}x${x}`)
}

function getLevelBackgroundColor(level: number): string {
  return LEVEL_COLORS[level as keyof typeof LEVEL_COLORS] || BG_COLORS.disabled
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
    backgroundColor: getLevelBackgroundColor(card.level),
    color: getTimeTextColor(card.time)
  }
}

function resetCardsHandler() {
  $q.dialog({
    title: TEXT_DE.multiply.resetCards.title,
    message: TEXT_DE.multiply.resetCards.message,
    cancel: {
      label: TEXT_DE.common.cancel,
      flat: true
    },
    ok: {
      label: TEXT_DE.common.reset,
      color: 'negative'
    },
    persistent: true
  }).onOk(() => {
    resetCards()
    cards.value = loadCards()
    $q.notify({
      type: 'positive',
      message: TEXT_DE.multiply.resetCards.success,
      position: 'top'
    })
  })
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
      <div
        class="text-h5 q-ml-sm"
        data-cy="stats-page-title"
      >
        {{ TEXT_DE.stats.title }}
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="cards.length === 0"
      class="text-center q-mt-xl"
    >
      <q-icon
        name="bar_chart"
        size="80px"
        color="grey-5"
      />
      <div class="text-h6 text-grey-6 q-mt-md">{{ TEXT_DE.stats.noDataAvailable }}</div>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Level Distribution -->
      <q-card class="q-mb-md level-card">
        <q-card-section>
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6">
              <q-icon
                name="layers"
                class="q-mr-xs"
              />
              {{ TEXT_DE.stats.cardsPerLevel }}
            </div>
            <q-btn
              flat
              dense
              color="negative"
              icon="refresh"
              :label="TEXT_DE.common.reset"
              size="sm"
              @click="resetCardsHandler"
            />
          </div>

          <div class="row q-col-gutter-sm level-stats">
            <div
              v-for="level in [1, 2, 3, 4, 5]"
              :key="level"
              class="col"
            >
              <q-card
                flat
                class="level-badge"
                :style="{ backgroundColor: getLevelBackgroundColor(level) }"
              >
                <q-card-section class="text-center q-pa-sm">
                  <div class="text-caption text-grey-8">{{ TEXT_DE.stats.level }}{{ level }}</div>
                  <div class="text-h5 text-weight-bold text-grey-9">
                    {{ getCardCountByLevel(level) }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Cards Grid -->
      <q-card class="grid-card">
        <q-card-section>
          <div class="text-h6 q-mb-md">
            <q-icon
              name="grid_on"
              class="q-mr-xs"
            />
            {{ TEXT_DE.stats.cardsOverview }}
          </div>

          <div class="cards-grid-container">
            <div class="cards-grid">
              <!-- Header row with X values -->
              <div class="grid-header"></div>
              <div
                v-for="x in [3, 4, 5, 6, 7, 8, 9]"
                :key="`header-${x}`"
                class="grid-header text-center text-weight-bold"
              >
                {{ x }}
              </div>

              <!-- Rows for each Y value -->
              <template
                v-for="y in [3, 4, 5, 6, 7, 8, 9]"
                :key="`row-${y}`"
              >
                <!-- Y label -->
                <div class="grid-header text-center text-weight-bold">{{ y }}</div>

                <!-- Cells for each X value -->
                <div
                  v-for="x in [3, 4, 5, 6, 7, 8, 9]"
                  :key="`cell-${y}-${x}`"
                  class="grid-cell"
                  :style="getCellStyle(y, x)"
                >
                  <div class="cell-content q-pa-xs">
                    <div class="text-caption text-weight-medium">
                      L{{ (y > x ? getCard(x, y) : getCard(y, x))?.level || 1 }}
                    </div>
                    <div class="cell-answer q-my-xs">{{ y }}x{{ x }}<br />{{ x * y }}</div>
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
              {{ TEXT_DE.stats.legend }}
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
                  <span class="text-caption">{{ TEXT_DE.stats.legendBackground }}</span>
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
                  <span class="text-caption">{{ TEXT_DE.stats.legendTextColor }}</span>
                </q-chip>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- PWA Installation Info -->
      <PwaInstallInfo class="q-mt-md" />
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
  grid-template-columns: 40px repeat(7, 1fr);
  gap: 6px;
  min-width: 500px;
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
  min-height: 70px;
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

/* Mobile: compact grid */
@media (max-width: 599.98px) {
  .cards-grid {
    grid-template-columns: 28px repeat(7, 1fr);
    gap: 3px;
    min-width: 360px;
  }

  .grid-cell {
    min-height: 54px;
    border-width: 1px;
  }

  .cell-answer {
    font-size: 0.85rem;
  }
}
</style>

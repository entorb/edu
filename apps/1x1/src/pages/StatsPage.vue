<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { StorageService } from '@/services/storage'
import type { Card } from '@/types'
import {
  MIN_CARD_TIME,
  MAX_CARD_TIME,
  LEVEL_COLORS,
  TIME_COLORS,
  TIME_COLOR_THRESHOLDS,
  BG_COLORS
} from '@/config/constants'
import { TEXT_DE } from '@/config/text-de'

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
  cards.value = StorageService.getCards()
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
  if (y > x) {
    return {
      backgroundColor: BG_COLORS.disabled
    }
  }

  const card = getCard(y, x)
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

function resetCards() {
  $q.dialog({
    title: TEXT_DE.resetCardsTitle,
    message: TEXT_DE.resetCardsMessage,
    cancel: {
      label: TEXT_DE.cancel,
      flat: true
    },
    ok: {
      label: TEXT_DE.reset,
      color: 'negative'
    },
    persistent: true
  }).onOk(() => {
    StorageService.resetCards()
    cards.value = StorageService.getCards()
    $q.notify({
      type: 'positive',
      message: TEXT_DE.resetCardsSuccess,
      position: 'top'
    })
  })
}

function goHome() {
  router.push({ name: '/' })
}
</script>

<template>
  <q-page class="q-pa-md page-container">
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <q-btn
        flat
        round
        icon="arrow_back"
        @click="goHome"
        size="md"
      />
      <div class="text-h5 q-ml-sm">{{ TEXT_DE.statistics }}</div>
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
      <div class="text-h6 text-grey-6 q-mt-md">{{ TEXT_DE.noDataAvailable }}</div>
    </div>

    <!-- Content -->
    <div
      v-else
      class="stats-content"
    >
      <!-- Level Distribution -->
      <q-card class="q-mb-md level-card">
        <q-card-section>
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6">
              <q-icon
                name="layers"
                class="q-mr-xs"
              />
              {{ TEXT_DE.cardsPerLevel }}
            </div>
            <q-btn
              flat
              dense
              color="negative"
              icon="refresh"
              :label="TEXT_DE.reset"
              size="sm"
              @click="resetCards"
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
                  <div class="text-caption text-grey-8">{{ TEXT_DE.level }}{{ level }}</div>
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
            {{ TEXT_DE.cardsOverview }}
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
                  :class="{ disabled: y > x }"
                  :style="getCellStyle(y, x)"
                >
                  <div
                    v-if="y <= x"
                    class="cell-content q-pa-xs"
                  >
                    <div class="text-caption text-weight-medium">{{ y }}x{{ x }}</div>
                    <div class="cell-answer q-my-xs">{{ y * x }}</div>
                    <div class="text-caption text-weight-medium">
                      <span>L{{ getCard(y, x)?.level || 1 }}</span>
                      <span class="q-ml-xs">{{ getCard(y, x)?.time.toFixed(1) || 60 }}s</span>
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
              {{ TEXT_DE.legend }}
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
                  <span class="text-caption">{{ TEXT_DE.legendBackground }}</span>
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
                  <span class="text-caption">{{ TEXT_DE.legendTextColor }}</span>
                </q-chip>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- PWA Installation Info -->
      <q-card class="q-mt-md pwa-info-card">
        <q-card-section>
          <div class="row items-center q-mb-sm">
            <q-icon
              name="install_mobile"
              size="24px"
              color="primary"
              class="q-mr-sm"
            />
            <div class="text-subtitle1 text-weight-medium">{{ TEXT_DE.pwaInstallTitle }}</div>
          </div>
          <div class="pwa-instructions">
            <div class="q-mb-xs">
              <strong>{{ TEXT_DE.pwaAndroid }}</strong> {{ TEXT_DE.pwaAndroidInstructions }}
            </div>
            <div>
              <strong>{{ TEXT_DE.pwaIPhone }}</strong> {{ TEXT_DE.pwaIPhoneInstructions }}
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<style scoped>
/* Quasar handles most styling - keep only essential grid and unique patterns */
.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.stats-content {
  animation: fadeIn 0.3s ease-in;
}

/* Cards grid system - unique layout Quasar can't handle */
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
}

.grid-cell:not(.disabled) {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.grid-cell:not(.disabled):hover {
  transform: scale(1.08);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.grid-cell.disabled {
  background-color: #fafafa;
  opacity: 0.5;
}

.cell-content {
  text-align: center;
  width: 100%;
}

.cell-answer {
  font-weight: 700;
  font-size: 1.1rem;
}

.pwa-info-card {
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  border: 2px solid #bbdefb;
}

.footer-links {
  border-top: 1px solid #e0e0e0;
}

.footer-links a {
  color: #616161;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: #000;
  text-decoration: underline;
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

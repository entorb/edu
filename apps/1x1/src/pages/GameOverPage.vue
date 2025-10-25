<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { StorageService } from '@/services/storage'
import GroundhogMascot from '@/components/GroundhogMascot.vue'
import type { GameResult } from '@/types'
import { FIRST_GAME_BONUS, STREAK_GAME_BONUS, STREAK_GAME_INTERVAL } from '@/config/constants'
import { TEXT_DE } from '@/config/text-de'
import { helperStatsDataWrite } from '@/util/helpers'

const router = useRouter()

const result = ref<GameResult | null>(null)
const bonusPoints = ref(0)
const bonusReasons = ref<string[]>([])

const successRate = computed(() => {
  if (!result.value) return 0
  return result.value.correctAnswers / result.value.totalCards
})

const showMascot = computed(() => {
  return successRate.value >= 0.7
})

const totalPoints = computed(() => {
  if (!result.value) return 0
  return result.value.points + bonusPoints.value
})

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    goHome()
  }
}

onMounted(async () => {
  result.value = StorageService.getGameResult()

  if (!result.value) {
    // No result found, redirect to home
    router.push({ name: '/' })
  } else {
    // Calculate daily bonuses
    const dailyInfo = StorageService.incrementDailyGames()

    if (dailyInfo.isFirstGame) {
      bonusPoints.value += FIRST_GAME_BONUS
      bonusReasons.value.push(TEXT_DE.firstGameBonus)
    }

    if (dailyInfo.gamesPlayedToday % STREAK_GAME_INTERVAL === 0) {
      bonusPoints.value += STREAK_GAME_BONUS
      bonusReasons.value.push(`${dailyInfo.gamesPlayedToday}. ${TEXT_DE.streakGameBonus}`)
    }

    // Update statistics with bonus points
    if (bonusPoints.value > 0) {
      StorageService.updateStatistics(bonusPoints.value, 0)
    }

    // update usage stats in DB
    await helperStatsDataWrite()
  }

  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

function goHome() {
  // Clear game result from session storage
  StorageService.clearGameResult()
  router.push({ name: '/' })
}
</script>

<template>
  <q-page class="game-over-page q-pa-md">
    <div
      v-if="result"
      class="text-center content-container"
    >
      <!-- Mascot or Trophy Icon -->
      <div class="mascot-container q-mb-md">
        <GroundhogMascot
          v-if="showMascot"
          smile
          class="mascot"
        />
        <q-icon
          v-else
          name="emoji_events"
          color="amber"
          size="100px"
          class="animate-bounce"
        />
      </div>

      <!-- Title -->
      <div class="text-h4 q-mt-md text-weight-bold text-primary">{{ TEXT_DE.gameOver }}</div>

      <!-- Results Card -->
      <q-card class="q-mt-lg results-card">
        <q-card-section class="q-pa-lg">
          <div class="text-h5 q-mb-md text-weight-bold text-grey-8">{{ TEXT_DE.results }}</div>
          <div class="row q-gutter-md justify-center">
            <div class="stat-item">
              <div class="text-caption text-uppercase text-grey-7 q-mb-xs">
                {{ TEXT_DE.pointsLabel }}
              </div>
              <div class="text-h4 text-primary text-weight-bold stat-value">
                {{ result.points }}
              </div>
            </div>
            <div class="stat-item">
              <div class="text-caption text-uppercase text-grey-7 q-mb-xs">
                {{ TEXT_DE.correct_plural }}
              </div>
              <div class="text-h4 text-positive text-weight-bold stat-value">
                {{ result.correctAnswers }}
              </div>
            </div>
            <div class="stat-item">
              <div class="text-caption text-uppercase text-grey-7 q-mb-xs">{{ TEXT_DE.from }}</div>
              <div class="text-h4 text-weight-bold stat-value">{{ result.totalCards }}</div>
            </div>
          </div>

          <!-- Bonus Points -->
          <div
            v-if="bonusPoints > 0"
            class="q-mt-md bonus-section q-pa-sm"
          >
            <q-separator class="q-mb-md" />
            <div class="text-subtitle2 text-amber-8 text-weight-bold q-mb-sm">
              <q-icon
                name="star"
                color="amber"
              />
              {{ TEXT_DE.bonusPoints }}
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
                +{{ reason === TEXT_DE.firstGameBonus ? FIRST_GAME_BONUS : STREAK_GAME_BONUS }}
                {{ reason }}
              </q-chip>
            </div>
            <div class="row justify-center q-mt-sm">
              <div class="text-h6 text-weight-bold">
                {{ result.points }} + {{ bonusPoints }} = {{ totalPoints }}
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Home Button -->
      <q-btn
        color="primary"
        size="lg"
        class="full-width q-mt-lg home-btn text-weight-medium"
        icon="home"
        :label="TEXT_DE.backToHome"
        unelevated
        @click="goHome"
      />
    </div>
  </q-page>
</template>

<style scoped>
/* Quasar handles most styling - keep only unique patterns */
.game-over-page {
  max-width: 600px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-container {
  width: 100%;
}

.mascot-container {
  display: flex;
  justify-content: center;
}

.mascot {
  width: 150px;
  height: 150px;
}

.results-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-item {
  min-width: 90px;
}

.home-btn {
  height: 56px;
  border-radius: 12px;
  box-shadow: 0 3px 8px rgba(25, 118, 210, 0.3);
}

.bonus-section {
  background-color: #fffbf0;
  border-radius: 8px;
}

/* Tablet and larger */
@media (min-width: 600px) {
  .mascot {
    width: 170px;
    height: 170px;
  }
}
</style>

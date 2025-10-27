<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../composables/useGameStore'
import {
  helperStatsDataWrite,
  calculateDailyBonuses,
  type DailyBonusConfig
} from '@flashcards/shared'
import { GameOverPage } from '@flashcards/shared/pages'
import {
  BASE_PATH,
  FIRST_GAME_BONUS,
  STREAK_GAME_BONUS,
  STREAK_GAME_INTERVAL
} from '../config/constants'
import FoxIcon from '../components/FoxIcon.vue'
import { incrementDailyGames } from '../services/storage'
import { saveGameStats, loadGameStats } from '../services/storage'

const router = useRouter()
const { points, correctAnswersCount, gameCards, isFoxHappy } = useGameStore()

const bonusReasons = ref<Array<{ label: string; points: number }>>([])

const successRate = computed(() => {
  if (gameCards.value.length === 0) return 0
  return correctAnswersCount.value / gameCards.value.length
})

const showMascot = computed(() => {
  return successRate.value >= 0.7
})

function handleGoHome() {
  router.push({ name: '/' })
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    handleGoHome()
  }
}

onMounted(async () => {
  // Calculate daily bonuses using shared helper
  const dailyInfo = incrementDailyGames()
  const bonusConfig: DailyBonusConfig = {
    firstGameBonus: FIRST_GAME_BONUS,
    streakGameBonus: STREAK_GAME_BONUS,
    streakGameInterval: STREAK_GAME_INTERVAL
  }

  const calculatedBonuses = calculateDailyBonuses(dailyInfo, bonusConfig)
  bonusReasons.value = calculatedBonuses

  // Update statistics with bonus points
  const totalBonusPoints = bonusReasons.value.reduce((sum, r) => sum + r.points, 0)
  if (totalBonusPoints > 0) {
    const stats = loadGameStats()
    saveGameStats({
      ...stats,
      points: stats.points + totalBonusPoints
    })
  }

  window.addEventListener('keydown', handleKeyDown)
  // Update usage stats in DB
  await helperStatsDataWrite(BASE_PATH)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <GameOverPage
    :points="Math.round(points)"
    :correct-answers="correctAnswersCount"
    :total-cards="gameCards.length"
    :bonus-reasons="bonusReasons"
    :show-mascot="showMascot"
    @go-home="handleGoHome"
  >
    <template #mascot>
      <FoxIcon
        :is-happy="isFoxHappy"
        :size="150"
      />
    </template>
  </GameOverPage>
</template>

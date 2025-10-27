<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../composables/useGameStore'
import { TEXT_DE, helperStatsDataWrite } from '@flashcards/shared'
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
const { score, correctAnswersCount, roundCards, isFoxHappy } = useGameStore()

const bonusReasons = ref<Array<{ label: string; points: number }>>([])

const successRate = computed(() => {
  if (roundCards.value.length === 0) return 0
  return correctAnswersCount.value / roundCards.value.length
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
  // Calculate daily bonuses
  const dailyInfo = incrementDailyGames()

  if (dailyInfo.isFirstGame) {
    bonusReasons.value.push({ label: TEXT_DE.multiply.firstGameBonus, points: FIRST_GAME_BONUS })
  }

  if (dailyInfo.gamesPlayedToday % STREAK_GAME_INTERVAL === 0) {
    bonusReasons.value.push({
      label: `${dailyInfo.gamesPlayedToday}. ${TEXT_DE.multiply.streakGameBonus}`,
      points: STREAK_GAME_BONUS
    })
  }

  // Update statistics with bonus points
  const totalBonusPoints = bonusReasons.value.reduce((sum, r) => sum + r.points, 0)
  if (totalBonusPoints > 0) {
    const stats = loadGameStats()
    saveGameStats({
      ...stats,
      totalScore: stats.totalScore + totalBonusPoints
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
    :points="Math.round(score)"
    :correct-answers="correctAnswersCount"
    :total-cards="roundCards.length"
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

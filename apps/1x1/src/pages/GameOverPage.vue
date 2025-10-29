<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/composables/useGameStore'
import {
  getGameResult,
  incrementDailyGames,
  clearGameResult,
  saveHistory,
  loadGameStats,
  saveGameStats
} from '@/services/storage'
import GroundhogMascot from '@/components/GroundhogMascot.vue'
import type { GameResult } from '@flashcards/shared'
import { FIRST_GAME_BONUS, STREAK_GAME_BONUS, STREAK_GAME_INTERVAL, BASE_PATH } from '@/constants'
import { TEXT_DE, helperStatsDataWrite } from '@flashcards/shared'
import { GameOverPage } from '@flashcards/shared/pages'

const router = useRouter()
const { history: gameStoreHistory } = useGameStore()

const result = ref<GameResult | null>(null)
const bonusReasons = ref<Array<{ label: string; points: number }>>([])

const successRate = computed(() => {
  if (!result.value) return 0
  return result.value.correctAnswers / result.value.totalCards
})

const showMascot = computed(() => {
  return successRate.value >= 0.7
})

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    goHome()
  }
}

onMounted(async () => {
  result.value = getGameResult()

  // No result found, redirect to home
  if (!result.value) {
    router.push({ name: '/' })
    return
  }

  // ONLY place where history and stats are persisted

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

  // Persist history and stats with bonus points
  const totalBonusPoints = bonusReasons.value.reduce((sum, r) => sum + r.points, 0)

  // Use history from game store (which includes the new entry added by finishGame)
  if (gameStoreHistory.value.length > 0) {
    const lastEntry = gameStoreHistory.value[gameStoreHistory.value.length - 1]
    lastEntry.points += totalBonusPoints
    saveHistory(gameStoreHistory.value)
  }

  // Load and update stats
  const stats = loadGameStats()
  stats.points += totalBonusPoints
  saveGameStats(stats)

  // update usage stats in DB
  await helperStatsDataWrite(BASE_PATH)

  globalThis.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  globalThis.removeEventListener('keydown', handleKeyDown)
})

function goHome() {
  // Clear game result from session storage
  clearGameResult()
  router.push({ name: '/' })
}
</script>

<template>
  <GameOverPage
    v-if="result"
    :points="result.points"
    :correct-answers="result.correctAnswers"
    :total-cards="result.totalCards"
    :bonus-reasons="bonusReasons"
    :show-mascot="showMascot"
    @go-home="goHome"
  >
    <template #mascot>
      <GroundhogMascot
        smile
        style="width: 150px; height: 150px"
      />
    </template>
  </GameOverPage>
</template>

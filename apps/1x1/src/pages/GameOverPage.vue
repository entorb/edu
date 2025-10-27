<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  getGameResult,
  incrementDailyGames,
  updateBonusPoints,
  clearGameResult,
  loadHistory,
  saveHistory
} from '@/services/storage'
import GroundhogMascot from '@/components/GroundhogMascot.vue'
import type { GameResult } from '@flashcards/shared'
import {
  FIRST_GAME_BONUS,
  STREAK_GAME_BONUS,
  STREAK_GAME_INTERVAL,
  BASE_PATH
} from '@/config/constants'
import { TEXT_DE, helperStatsDataWrite } from '@flashcards/shared'
import { GameOverPage } from '@flashcards/shared/pages'

const router = useRouter()

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

  if (!result.value) {
    // No result found, redirect to home
    router.push({ name: '/' })
  } else {
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
      // Update the last history entry to include bonus points
      const history = loadHistory()
      if (history.length > 0) {
        const lastEntry = history[history.length - 1]
        lastEntry.points += totalBonusPoints
        saveHistory(history)
      }

      // Update bonus points in stats (doesn't increment gamesPlayed - already done by saveGameResults)
      updateBonusPoints(totalBonusPoints)
    }

    // update usage stats in DB
    await helperStatsDataWrite(BASE_PATH)
  }

  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
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

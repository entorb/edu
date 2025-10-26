<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { StorageService } from '@/services/storage'
import GroundhogMascot from '@/components/GroundhogMascot.vue'
import type { GameResult } from '@/types'
import {
  FIRST_GAME_BONUS,
  STREAK_GAME_BONUS,
  STREAK_GAME_INTERVAL,
  BASE_PATH
} from '@/config/constants'
import { TEXT_DE } from '@flashcards/shared'
import { helperStatsDataWrite } from '@flashcards/shared'

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
      bonusReasons.value.push(TEXT_DE.multiply.firstGameBonus)
    }

    if (dailyInfo.gamesPlayedToday % STREAK_GAME_INTERVAL === 0) {
      bonusPoints.value += STREAK_GAME_BONUS
      bonusReasons.value.push(`${dailyInfo.gamesPlayedToday}. ${TEXT_DE.multiply.streakGameBonus}`)
    }

    // Update statistics with bonus points
    if (bonusPoints.value > 0) {
      StorageService.updateStatistics(bonusPoints.value, 0)
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
  StorageService.clearGameResult()
  router.push({ name: '/' })
}
</script>

<template>
  <q-page
    v-if="result"
    class="flex flex-center q-pa-md"
    style="max-width: 600px; margin: 0 auto"
  >
    <div class="full-width text-center">
      <!-- Mascot or Trophy Icon -->
      <div class="flex flex-center q-mb-md">
        <GroundhogMascot
          v-if="showMascot"
          smile
          :style="$q.screen.gt.xs ? 'width: 170px; height: 170px' : 'width: 150px; height: 150px'"
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
                {{ result.points }}
              </div>
            </div>
            <div style="min-width: 90px">
              <span class="text-h4 text-positive text-weight-bold">
                {{ result.correctAnswers }}
              </span>
              <span class="text-h4 text-weight-bold">
                /
                {{ result.totalCards }}
              </span>
            </div>
          </div>

          <!-- Bonus Points -->
          <div
            v-if="bonusPoints > 0"
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
                +{{
                  reason === TEXT_DE.multiply.firstGameBonus ? FIRST_GAME_BONUS : STREAK_GAME_BONUS
                }}
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
        class="full-width q-mt-lg"
        icon="home"
        :label="TEXT_DE.common.backToHome"
        unelevated
        @click="goHome"
      />
    </div>
  </q-page>
</template>

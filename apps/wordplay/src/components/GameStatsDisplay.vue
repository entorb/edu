<script setup lang="ts">
import type { GameStats } from '../types'

interface Props {
  stats: GameStats
}

defineProps<Props>()
</script>

<template>
  <div
    v-if="stats.totalGamesPlayed && stats.totalGamesPlayed > 0"
    class="relative bg-primary/10 p-4 rounded-lg shadow-md"
  >
    <div class="grid grid-cols-3 gap-4 text-center">
      <div>
        <div class="text-xs text-primary uppercase tracking-wider font-semibold">Runden</div>
        <div class="text-2xl font-bold text-primary">{{ stats.totalGamesPlayed }}</div>
      </div>
      <div>
        <div class="text-xs text-primary uppercase tracking-wider font-semibold">Punkte</div>
        <div class="text-2xl font-bold text-primary">{{ Math.round(stats.totalScore) }}</div>
      </div>
      <div>
        <div class="text-xs text-primary uppercase tracking-wider font-semibold">Richtig</div>
        <div class="text-2xl font-bold text-primary">{{ stats.totalCorrectAnswers }}</div>
      </div>
    </div>
    <!-- Speech bubble tail -->
    <div
      class="absolute top-1/2 -left-2 transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-primary/10"
    ></div>
  </div>
</template>

<style scoped>
.text-primary {
  color: var(--q-primary);
}
.bg-primary\/10 {
  background-color: rgba(25, 118, 210, 0.1);
}
.border-r-primary\/10 {
  border-right-color: rgba(25, 118, 210, 0.1);
}
</style>

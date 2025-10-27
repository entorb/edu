<script setup lang="ts">
import { TEXT_DE } from '../text-de'

interface Statistics {
  gamesPlayed?: number
  totalGamesPlayed?: number
  totalPoints?: number
  totalScore?: number
  totalCorrectAnswers: number
}

interface Props {
  statistics: Statistics
}

defineProps<Props>()

// Normalize the games played property name
function getGamesPlayed(stats: Statistics): number {
  return stats.gamesPlayed ?? stats.totalGamesPlayed ?? 0
}

// Normalize the points/score property name
function getPointsOrScore(stats: Statistics): number {
  return stats.totalPoints ?? stats.totalScore ?? 0
}
</script>

<template>
  <q-card
    flat
    bordered
    class="rounded-borders"
  >
    <q-card-section class="q-pa-sm">
      <div class="row text-center q-gutter-sm justify-around">
        <div class="col-3">
          <div class="text-caption">{{ TEXT_DE.stats.games }}</div>
          <div class="text-h6">{{ getGamesPlayed(statistics) }}</div>
        </div>
        <div class="col-3">
          <div class="text-caption">{{ TEXT_DE.stats.points }}</div>
          <div class="text-h6">{{ getPointsOrScore(statistics) }}</div>
        </div>
        <div class="col-4">
          <div class="text-caption">{{ TEXT_DE.stats.correctAnswers }}</div>
          <div class="text-h6">{{ statistics.totalCorrectAnswers }}</div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

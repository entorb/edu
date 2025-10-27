<script setup lang="ts">
import { TEXT_DE } from '../text-de'

interface Statistics {
  gamesPlayed: number
  points: number
  correctAnswers: number
}

interface Props {
  statistics: Statistics
}

defineProps<Props>()

// Normalize the games played property name
function getGamesPlayed(stats: Statistics): number {
  return stats.gamesPlayed ?? stats.gamesPlayed ?? 0
}

// Normalize the points/score property name
function getPointsOrScore(stats: Statistics): number {
  return stats.points ?? stats.points ?? 0
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
          <div
            class="text-h6"
            data-cy="stats-games-played"
          >
            {{ getGamesPlayed(statistics) }}
          </div>
        </div>
        <div class="col-3">
          <div class="text-caption">{{ TEXT_DE.stats.points }}</div>
          <div
            class="text-h6"
            data-cy="stats-total-points"
          >
            {{ getPointsOrScore(statistics) }}
          </div>
        </div>
        <div class="col-4">
          <div class="text-caption">{{ TEXT_DE.stats.correctAnswers }}</div>
          <div
            class="text-h6"
            data-cy="stats-correct-answers"
          >
            {{ statistics.correctAnswers }}
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

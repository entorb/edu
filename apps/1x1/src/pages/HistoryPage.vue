<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { HistoryPage } from '@flashcards/shared/pages'
import { StorageService } from '@/services/storage'
import type { GameHistory } from '@/types'
import { TEXT_DE } from '@flashcards/shared'

const history = ref<GameHistory[]>([])

onMounted(() => {
  history.value = StorageService.getHistory()
})

function formatSelection(select: number[] | string): string {
  if (typeof select === 'string') {
    return select
  }
  return select.join(', ')
}

function formatDetails(game: any): string {
  return `${TEXT_DE.multiply.selectionPrefix}${formatSelection(game.select)}`
}

function getPoints(game: any): number {
  return game.points
}

function getCorrectAnswers(game: any): string {
  return `${game.correctAnswers}${TEXT_DE.stats.correctSuffix}`
}
</script>

<template>
  <HistoryPage
    :history="history"
    :format-details="formatDetails"
    :get-points="getPoints"
    :get-correct-answers="getCorrectAnswers"
  />
</template>

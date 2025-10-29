<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { HistoryPage } from '@flashcards/shared/pages'
import { loadHistory } from '@/services/storage'
import type { GameHistory } from '@/types'
import { TEXT_DE, getFocusText } from '@flashcards/shared'

const history = ref<GameHistory[]>([])

onMounted(() => {
  history.value = loadHistory()
})

function formatSelection(select: number[] | string): string {
  if (typeof select === 'string') {
    return select
  }
  return select.join(', ')
}

function formatDetails(game: any): string {
  const selection = `${TEXT_DE.multiply.selection}: ${formatSelection(game.settings.select)}`
  const focus = `${TEXT_DE.words.focus}: ${getFocusText(game.settings.focus)}`
  return `${selection} | ${focus}`
}

function getPoints(game: any): number {
  return game.points
}

function getCorrectAnswers(game: any): string {
  return `${game.correctAnswers}`
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

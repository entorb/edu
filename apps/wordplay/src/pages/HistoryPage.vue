<script setup lang="ts">
import { HistoryPage } from '@flashcards/shared/pages'
import { useGameStore } from '../composables/useGameStore'
import { TEXT_DE } from '@flashcards/shared'

const { history } = useGameStore()

function getModeText(mode: string): string {
  const modes: Record<string, string> = {
    'multiple-choice': TEXT_DE.wordplay.modes['multiple-choice'],
    blind: TEXT_DE.wordplay.modes.blind,
    typing: TEXT_DE.wordplay.modes.typing
  }
  return modes[mode] || mode
}

function getFocusText(focus: string): string {
  return focus === 'weak'
    ? TEXT_DE.wordplay.history.focusWeak
    : TEXT_DE.wordplay.history.focusStrong
}

function formatDetails(entry: any): string {
  return `${getModeText(entry.settings.mode)} | ${getFocusText(entry.settings.focus)} | ${entry.settings.language.toUpperCase()}`
}

function getPoints(entry: any): number {
  return Math.round(entry.points)
}

function getCorrectAnswers(entry: any): string {
  return `${entry.correctAnswers} ${TEXT_DE.wordplay.history.correct}`
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

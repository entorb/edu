<script setup lang="ts">
import { computed } from 'vue'
import type { Card } from '../types'

interface Props {
  allCards: Card[]
  onClick?: () => void
}

const props = defineProps<Props>()

const levelCounts = computed(() => {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  props.allCards.forEach(card => {
    if (counts[card.level] !== undefined) {
      counts[card.level]++
    }
  })
  return counts
})

const containerClasses = computed(() => {
  const base = 'w-full p-2 rounded-lg transition-colors focus:outline-none'
  const clickable = props.onClick
    ? 'hover:bg-grey-2 cursor-pointer focus:ring-2 focus:ring-primary'
    : ''
  return `${base} ${clickable}`
})
</script>

<template>
  <component
    :is="onClick ? 'button' : 'div'"
    :class="containerClasses"
    :aria-label="onClick ? 'Übersicht aller Karten anzeigen' : undefined"
    @click="onClick"
  >
    <div class="flex justify-center gap-2 text-xs">
      <div
        v-for="level in [1, 2, 3, 4, 5]"
        :key="level"
        class="px-2 py-1 bg-grey-3 rounded"
      >
        <span class="font-bold">L{{ level }}</span
        >: {{ levelCounts[level] }}
      </div>
    </div>
  </component>
</template>

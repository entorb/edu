<script setup lang="ts">
interface Props {
  score: number
  current: number
  total: number
}

defineProps<Props>()
</script>

<template>
  <div class="flex justify-between items-center mb-4 p-3 bg-grey-2 rounded-lg">
    <div>
      <span class="text-sm text-grey-7">SCORE</span>
      <p class="text-2xl font-bold text-primary">{{ Math.round(score) }}</p>
    </div>
    <div>
      <span class="text-sm text-grey-7">CARD</span>
      <p class="text-2xl font-bold">{{ current }} / {{ total }}</p>
    </div>
  </div>
</template>

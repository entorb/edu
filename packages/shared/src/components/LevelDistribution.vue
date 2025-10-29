<script setup lang="ts">
import type { BaseCard } from '../types'
import { TEXT_DE } from '../text-de'
import { LEVEL_COLORS } from '../constants'

interface Props {
  cards: BaseCard[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  reset: []
}>()

function getCardCountByLevel(level: number): number {
  return props.cards.filter(card => card.level === level).length
}

function getLevelBackgroundColor(level: number): string {
  return LEVEL_COLORS[level] || '#f5f5f5'
}

function handleReset() {
  emit('reset')
}
</script>

<template>
  <q-card class="level-card">
    <q-card-section>
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6">
          <q-icon
            name="layers"
            class="q-mr-xs"
          />
          {{ TEXT_DE.stats.cardsPerLevel }}
        </div>
        <q-btn
          flat
          dense
          color="negative"
          icon="refresh"
          :label="TEXT_DE.common.reset"
          size="sm"
          @click="handleReset"
          data-cy="reset-levels-button"
        />
      </div>

      <div class="row q-col-gutter-sm level-stats">
        <div
          v-for="level in [1, 2, 3, 4, 5]"
          :key="level"
          class="col"
        >
          <q-card
            flat
            class="level-badge"
            :style="{ backgroundColor: getLevelBackgroundColor(level) }"
          >
            <q-card-section class="text-center q-pa-sm">
              <div class="text-caption text-grey-8">{{ TEXT_DE.stats.level }} {{ level }}</div>
              <div class="text-h5 text-weight-bold text-grey-9">
                {{ getCardCountByLevel(level) }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

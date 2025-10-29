<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/composables/useGameStore'
import type { SelectionType } from '@/types'
import type { FocusType } from '@flashcards/shared'
import GroundhogMascot from '@/components/GroundhogMascot.vue'
import { SELECT_OPTIONS, DEFAULT_SELECT, FOCUS_OPTIONS, BASE_PATH } from '@/config/constants'
import { TEXT_DE } from '@flashcards/shared'
import { AppFooter, StatisticsCard } from '@flashcards/shared/components'
import { loadGameStats } from '@/services/storage'

const router = useRouter()

const { gameStats, gameSettings, startGame: storeStartGame } = useGameStore()

const select = ref<SelectionType>(DEFAULT_SELECT)
const focus = ref<FocusType>('weak')
const selectOptions = SELECT_OPTIONS
const focusOptions = FOCUS_OPTIONS

// Check if a number is selected
const isNumberSelected = computed(() => (num: number) => {
  if (typeof select.value === 'string') return false
  return select.value.includes(num)
})

// Check if x² is selected
const isSquaresSelected = computed(() => select.value === 'x²')

onMounted(() => {
  // Restore select and focus from gameSettings in store
  if (gameSettings.value) {
    select.value = gameSettings.value.select
    focus.value = gameSettings.value.focus
  }

  // Reload stats from storage in case they were updated during a game
  gameStats.value = loadGameStats()
})

// Watch for changes and save to gameSettings in store
watch(
  [select, focus],
  () => {
    if (gameSettings.value) {
      gameSettings.value.select = select.value
      gameSettings.value.focus = focus.value
    }
  },
  { deep: true }
)

function startGame() {
  // Save game config to store and navigate
  storeStartGame({
    select: select.value,
    focus: focus.value
  })

  // Navigate to game page without query parameters
  router.push({ name: '/game' })
}

function goToHistory() {
  router.push({ name: '/history' })
}

function goToStats() {
  router.push({ name: '/stats' })
}

function toggleSelect(option: number) {
  // Convert string selections to array first
  if (typeof select.value === 'string') {
    select.value = [option]
    return
  }

  const allSelected = selectOptions.every(
    opt => Array.isArray(select.value) && select.value.includes(opt)
  )

  if (allSelected && Array.isArray(select.value) && select.value.length > 1) {
    // If all are selected and clicking one number, select only that number
    select.value = [option]
  } else if (Array.isArray(select.value) && select.value.includes(option)) {
    // If already selected, select all
    select.value = [...selectOptions]
  } else if (Array.isArray(select.value)) {
    // Not selected, add it
    select.value = [...select.value, option].sort()
  }
}

function toggleSquares() {
  if (select.value === 'x²') {
    // If x² is already selected, deselect and go to all
    select.value = [...selectOptions]
  } else {
    // Select x² mode
    select.value = 'x²'
  }
}
</script>

<template>
  <q-page class="q-pa-md">
    <div
      class="text-h5 q-mb-md"
      data-cy="app-title"
    >
      {{ TEXT_DE.appTitle_1x1 }}
    </div>

    <!-- Mascot and Statistics -->
    <div class="row items-center justify-center q-mb-md">
      <div class="col-12 col-sm-auto text-center">
        <GroundhogMascot
          style="width: 100px; height: 100px"
          data-cy="mascot"
        />
      </div>
      <div
        class="col-12 col-sm"
        :class="$q.screen.gt.xs ? 'q-ml-md' : ''"
      >
        <StatisticsCard
          :statistics="gameStats"
          data-cy="statistics-card"
        />
      </div>
    </div>

    <!-- Game Configuration -->
    <q-card class="q-mb-md">
      <q-card-section class="q-pa-md">
        <!-- Select Rows -->
        <div class="q-mb-sm">
          <div class="text-subtitle2 q-mb-xs">{{ TEXT_DE.multiply.selection }}</div>
          <div class="row q-gutter-xs">
            <q-btn
              v-for="option in selectOptions"
              :key="option"
              :outline="!isNumberSelected(option)"
              :unelevated="isNumberSelected(option)"
              :color="isNumberSelected(option) ? 'primary' : 'grey-5'"
              size="md"
              class="col"
              @click="toggleSelect(option)"
              :data-cy="`table-selection-button-${option}`"
            >
              <div class="text-body1">{{ option }}</div>
            </q-btn>
            <q-btn
              :outline="!isSquaresSelected"
              :unelevated="isSquaresSelected"
              :color="isSquaresSelected ? 'secondary' : 'grey-5'"
              size="md"
              class="col squares-btn"
              @click="toggleSquares"
              data-cy="table-selection-button-squares"
            >
              <div class="text-body1">{{ TEXT_DE.multiply.selectionSquares }}</div>
            </q-btn>
          </div>
        </div>

        <!-- Focus Selection -->
        <div>
          <div class="text-subtitle2 q-mb-xs">{{ TEXT_DE.words.focus }}</div>
          <q-select
            v-model="focus"
            :options="focusOptions"
            outlined
            dense
            emit-value
            map-options
            data-cy="focus-select"
          >
            <template #option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-icon :name="scope.opt.icon" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
      </q-card-section>
    </q-card>

    <!-- Start Game Button -->
    <q-btn
      color="positive"
      size="lg"
      class="full-width q-mb-sm"
      @click="startGame"
      icon="play_arrow"
      data-cy="start-button"
    >
      <span class="text-body1">{{ TEXT_DE.common.start }}</span>
    </q-btn>

    <!-- Navigation Buttons -->
    <div class="row q-gutter-sm">
      <q-btn
        unelevated
        color="primary"
        size="md"
        class="col"
        @click="goToStats"
        icon="layers"
        :label="TEXT_DE.nav.cards"
        data-cy="stats-button"
      />
      <q-btn
        unelevated
        color="primary"
        size="md"
        class="col"
        @click="goToHistory"
        icon="history"
        :label="TEXT_DE.nav.history"
        data-cy="history-button"
      />
    </div>
    <AppFooter :base-path="BASE_PATH" />
  </q-page>
</template>

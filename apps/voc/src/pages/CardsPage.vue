<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useGameStore } from '../composables/useGameStore'
import { TEXT_DE, useResetCards, LEVEL_COLORS } from '@flashcards/shared'
import { LevelDistribution } from '@flashcards/shared/components'
import { MIN_LEVEL, MAX_LEVEL } from '../constants'

const router = useRouter()
const $q = useQuasar()
const { showResetDialog } = useResetCards()
const { allCards, moveAllCards } = useGameStore()
const store = useGameStore()

const targetLevel = ref(1)

function handleGoBack() {
  router.push('/')
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    handleGoBack()
  }
}

onMounted(() => {
  globalThis.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  globalThis.removeEventListener('keydown', handleKeyDown)
})

function handleEditCards() {
  router.push('/cards-edit')
}

function handleMoveClick() {
  const level = Number(targetLevel.value)
  if (level < MIN_LEVEL || level > MAX_LEVEL) {
    $q.notify({
      type: 'negative',
      message: TEXT_DE.voc.cards.invalidLevelError
        .replace('{min}', MIN_LEVEL.toString())
        .replace('{max}', MAX_LEVEL.toString())
    })
    return
  }

  $q.dialog({
    title: TEXT_DE.voc.cards.confirmMoveTitle,
    message: TEXT_DE.voc.cards.confirmMoveMessage
      .replace('{count}', allCards.value.length.toString())
      .replace('{level}', level.toString()),
    cancel: true
  }).onOk(() => {
    moveAllCards(level)
    $q.notify({ type: 'positive', message: TEXT_DE.voc.cards.moveSuccess })
  })
}

function handleResetCards() {
  showResetDialog(() => {
    moveAllCards(1)
  })
}

function handleResetCardsToDefaultSet() {
  showResetDialog(() => {
    store.resetCards()
  })
}

function getLevelColor(level: number): string {
  return LEVEL_COLORS[level] || LEVEL_COLORS[1]
}
</script>

<template>
  <q-page
    class="q-pa-md card-management-page"
    style="max-width: 700px; margin: 0 auto"
  >
    <!-- Header-like section with back button and title -->
    <div class="row items-center justify-between q-mb-lg">
      <q-btn
        flat
        round
        dense
        icon="arrow_back"
        @click="handleGoBack"
        data-cy="back-button"
      >
        <q-tooltip>{{ TEXT_DE.nav.backToHome }}</q-tooltip>
      </q-btn>
    </div>

    <div class="q-gutter-lg">
      <!-- Level Distribution -->
      <LevelDistribution
        :cards="allCards"
        @reset="handleResetCards"
      />

      <!-- Current Deck -->
      <div class="q-pt-lg">
        <h3 class="text-h6 text-weight-bold q-mb-md">
          {{ TEXT_DE.words.cards }} ({{ allCards.length }})
        </h3>
        <div style="max-height: 300px; overflow-y: auto">
          <q-list
            bordered
            separator
          >
            <q-item
              v-for="card in allCards"
              :key="card.en"
            >
              <q-item-section>
                <q-item-label>{{ card.en }} → {{ card.de }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge
                  :label="`Level ${card.level}`"
                  :style="{ backgroundColor: getLevelColor(card.level) }"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>

      <!-- Edit Cards -->
      <div>
        <h3 class="text-subtitle1 text-weight-bold q-mb-xs">
          {{ TEXT_DE.voc.cards.editCardsTitle }}
        </h3>
        <q-btn
          outline
          color="grey-8"
          :label="TEXT_DE.voc.cards.editCardsButton"
          no-caps
          @click="handleEditCards"
          data-cy="edit-cards-button"
        />
      </div>

      <!-- Move All Cards -->
      <div>
        <h3 class="text-subtitle1 text-weight-bold q-mb-xs">
          {{ TEXT_DE.voc.cards.moveAllTitle }}
        </h3>
        <div class="row q-gutter-sm items-center">
          <q-input
            v-model.number="targetLevel"
            type="number"
            :min="MIN_LEVEL"
            :max="MAX_LEVEL"
            outlined
            dense
            style="width: 80px"
          />
          <q-btn
            outline
            color="grey-8"
            :label="TEXT_DE.voc.cards.moveAll"
            no-caps
            @click="handleMoveClick"
          />
        </div>
      </div>

      <!-- Danger Zone -->
      <div
        class="q-pt-lg"
        style="border-top: 1px solid #e0e0e0"
      >
        <h3 class="text-subtitle1 text-weight-bold q-mb-xs text-negative">
          {{ TEXT_DE.voc.cards.dangerZoneTitle }}
        </h3>
        <q-btn
          outline
          color="negative"
          :label="TEXT_DE.voc.cards.reset"
          no-caps
          @click="handleResetCardsToDefaultSet"
        />
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.card-management-page {
  min-height: 100vh;
  padding-bottom: 100px !important;
}
</style>

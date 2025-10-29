<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useGameStore } from '../composables/useGameStore'
import { TEXT_DE, useResetCards, LEVEL_COLORS } from '@flashcards/shared'
import { LevelDistribution } from '@flashcards/shared/components'
import { MIN_LEVEL, MAX_LEVEL } from '../constants'
import { parseCardsFromText } from '../utils/helpers'

const router = useRouter()
const $q = useQuasar()
const { showResetDialog } = useResetCards()
const { allCards, importCards, moveAllCards } = useGameStore()

const exportButtonText = ref<string>(TEXT_DE.voc.cards.export)
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

function handleExport() {
  const header = 'en\tde\tlevel\n'
  const tsvContent = allCards.value.map(c => `${c.en}\t${c.de}\t${c.level}`).join('\n')
  navigator.clipboard
    .writeText(header + tsvContent)
    .then(() => {
      exportButtonText.value = TEXT_DE.voc.cards.copied
      setTimeout(() => (exportButtonText.value = TEXT_DE.voc.cards.export), 2000)
    })
    .catch(() => {
      $q.notify({
        type: 'negative',
        message: TEXT_DE.voc.cards.clipboardError
      })
    })
}

function showImportDialog() {
  $q.dialog({
    title: TEXT_DE.voc.cards.importDialogTitle,
    message: TEXT_DE.voc.cards.importDialogMessage,
    prompt: {
      model: '',
      type: 'textarea',
      outlined: true
    },
    cancel: true,
    class: 'bordered'
  }).onOk((text: string) => {
    handleParseText(text)
  })
}

function handleParseText(text: string) {
  if (!text) {
    $q.notify({ type: 'negative', message: TEXT_DE.voc.cards.emptyTextError })
    return
  }

  const parseResult = parseCardsFromText(text)

  if (!parseResult) {
    $q.notify({
      type: 'negative',
      message: TEXT_DE.voc.cards.noDelimiterError
    })
    return
  }

  const { cards: newCards, delimiter } = parseResult

  if (newCards.length === 0) {
    $q.notify({
      type: 'negative',
      message: TEXT_DE.voc.cards.noCardsFoundError.replace('{delimiter}', delimiter)
    })
    return
  }

  $q.dialog({
    title: TEXT_DE.voc.cards.confirmImportTitle,
    message: TEXT_DE.voc.cards.confirmImportMessage.replace('{count}', newCards.length.toString()),
    cancel: true
  }).onOk(() => {
    importCards(newCards)
    $q.notify({
      type: 'positive',
      message: TEXT_DE.voc.cards.importSuccess.replace('{count}', newCards.length.toString())
    })
  })
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

      <!-- Export -->
      <div>
        <h3 class="text-subtitle1 text-weight-bold q-mb-xs">
          {{ TEXT_DE.voc.cards.exportTitle }}
        </h3>
        <p class="text-caption text-grey-7 q-mb-sm">
          {{ TEXT_DE.voc.cards.exportDescription }}
        </p>
        <q-btn
          outline
          color="grey-8"
          :label="exportButtonText"
          no-caps
          @click="handleExport"
        />
      </div>

      <!-- Import -->
      <div>
        <h3 class="text-subtitle1 text-weight-bold q-mb-xs">
          {{ TEXT_DE.voc.cards.importTitle }}
        </h3>
        <p class="text-caption text-grey-7 q-mb-sm">
          {{ TEXT_DE.voc.cards.importDescription }}
        </p>
        <q-btn
          outline
          color="grey-8"
          :label="TEXT_DE.voc.cards.import"
          no-caps
          @click="showImportDialog"
        />
      </div>

      <!-- Move All Cards -->
      <div>
        <h3 class="text-subtitle1 text-weight-bold q-mb-xs">
          {{ TEXT_DE.voc.cards.moveAllTitle }}
        </h3>
        <p class="text-caption text-grey-7 q-mb-sm">
          {{ TEXT_DE.voc.cards.moveAllDescription }}
        </p>
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
        <p class="text-caption text-grey-7 q-mb-sm">
          {{ TEXT_DE.voc.cards.dangerZoneDescription }}
        </p>
        <q-btn
          outline
          color="negative"
          :label="TEXT_DE.voc.cards.reset"
          no-caps
          @click="handleResetCards"
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

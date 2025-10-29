<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useGameStore } from '../composables/useGameStore'
import { TEXT_DE } from '@flashcards/shared'
import { MIN_LEVEL, MAX_LEVEL, DEFAULT_TIME } from '../config/constants'
import type { Card } from '../types'

const router = useRouter()
const $q = useQuasar()
const { allCards, resetCards, importCards, moveAllCards } = useGameStore()

const exportButtonText = ref<string>(TEXT_DE.wordplay.cardManagement.export)
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
      exportButtonText.value = TEXT_DE.wordplay.cardManagement.copied
      setTimeout(() => (exportButtonText.value = TEXT_DE.wordplay.cardManagement.export), 2000)
    })
    .catch(() => {
      $q.notify({
        type: 'negative',
        message: TEXT_DE.wordplay.cardManagement.clipboardError
      })
    })
}

function showImportDialog() {
  $q.dialog({
    title: TEXT_DE.wordplay.cardManagement.importDialogTitle,
    message: TEXT_DE.wordplay.cardManagement.importDialogMessage,
    prompt: {
      model: '',
      type: 'textarea'
    },
    cancel: true
  }).onOk((text: string) => {
    handleParseText(text)
  })
}

function handleParseText(text: string) {
  if (!text) {
    $q.notify({ type: 'negative', message: TEXT_DE.wordplay.cardManagement.emptyTextError })
    return
  }

  const lines = text.trim().split('\n')
  const firstLine = lines[0]
  let delimiter = ''
  if (firstLine.includes('\t')) delimiter = '\t'
  else if (firstLine.includes(';')) delimiter = ';'
  else if (firstLine.includes(',')) delimiter = ','
  else if (firstLine.includes('/')) delimiter = '/'
  else {
    $q.notify({
      type: 'negative',
      message: TEXT_DE.wordplay.cardManagement.noDelimiterError
    })
    return
  }

  const newCards: Card[] = []
  lines.forEach((line, index) => {
    if (index === 0 && line.toLowerCase().includes('en') && line.toLowerCase().includes('de')) {
      return // Skip header
    }

    const parts = line.split(delimiter)
    if (parts.length >= 2 && parts[0].trim() && parts[1].trim()) {
      newCards.push({
        en: parts[0].trim(),
        de: parts[1].trim(),
        level: parseInt(parts[2], 10) || 1,
        time_blind: DEFAULT_TIME,
        time_typing: DEFAULT_TIME
      })
    }
  })

  if (newCards.length === 0) {
    $q.notify({
      type: 'negative',
      message: TEXT_DE.wordplay.cardManagement.noCardsFoundError.replace('{delimiter}', delimiter)
    })
    return
  }

  $q.dialog({
    title: TEXT_DE.wordplay.cardManagement.confirmImportTitle,
    message: TEXT_DE.wordplay.cardManagement.confirmImportMessage.replace(
      '{count}',
      newCards.length.toString()
    ),
    cancel: true
  }).onOk(() => {
    importCards(newCards)
    $q.notify({
      type: 'positive',
      message: TEXT_DE.wordplay.cardManagement.importSuccess.replace(
        '{count}',
        newCards.length.toString()
      )
    })
  })
}

function handleMoveClick() {
  const level = Number(targetLevel.value)
  if (level < MIN_LEVEL || level > MAX_LEVEL) {
    $q.notify({
      type: 'negative',
      message: TEXT_DE.wordplay.cardManagement.invalidLevelError
        .replace('{min}', MIN_LEVEL.toString())
        .replace('{max}', MAX_LEVEL.toString())
    })
    return
  }

  $q.dialog({
    title: TEXT_DE.wordplay.cardManagement.confirmMoveTitle,
    message: TEXT_DE.wordplay.cardManagement.confirmMoveMessage
      .replace('{count}', allCards.value.length.toString())
      .replace('{level}', level.toString()),
    cancel: true
  }).onOk(() => {
    moveAllCards(level)
    $q.notify({ type: 'positive', message: TEXT_DE.wordplay.cardManagement.moveSuccess })
  })
}

function showResetDialog() {
  $q.dialog({
    title: TEXT_DE.wordplay.cardManagement.confirmResetTitle,
    message: TEXT_DE.wordplay.cardManagement.confirmResetMessage,
    cancel: true,
    color: 'negative'
  }).onOk(() => {
    resetCards()
    $q.notify({ type: 'positive', message: TEXT_DE.wordplay.cardManagement.resetSuccess })
  })
}

function getLevelColor(level: number): string {
  const colors = ['red', 'orange', 'amber', 'light-green', 'green']
  return colors[level - 1] || 'grey'
}
</script>

<template>
  <q-page class="q-pa-md card-management-page">
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
        <q-tooltip>{{ TEXT_DE.common.backToMenu }}</q-tooltip>
      </q-btn>
      <h1
        class="text-h5 text-weight-bold q-my-none"
        data-cy="card-management-page-title"
      >
        {{ TEXT_DE.wordplay.cardManagement.title }}
      </h1>
      <div style="width: 40px" />
    </div>

    <div
      class="q-mx-auto q-pb-xl"
      style="max-width: 700px"
    >
      <div class="q-gutter-lg">
        <!-- Current Deck -->
        <div
          class="q-pt-lg"
          style="border-top: 1px solid #e0e0e0"
        >
          <h3 class="text-h6 text-weight-bold q-mb-md">
            {{ TEXT_DE.wordplay.cardManagement.currentDeck }} ({{ allCards.length }})
          </h3>
          <div style="max-height: 150px; overflow-y: auto">
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
                    :color="getLevelColor(card.level)"
                    :label="`Level ${card.level}`"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>

        <!-- Export -->
        <div>
          <h3 class="text-subtitle1 text-weight-bold q-mb-xs">
            {{ TEXT_DE.wordplay.cardManagement.exportTitle }}
          </h3>
          <p class="text-caption text-grey-7 q-mb-sm">
            {{ TEXT_DE.wordplay.cardManagement.exportDescription }}
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
            {{ TEXT_DE.wordplay.cardManagement.importTitle }}
          </h3>
          <p class="text-caption text-grey-7 q-mb-sm">
            {{ TEXT_DE.wordplay.cardManagement.importDescription }}
          </p>
          <q-btn
            outline
            color="grey-8"
            :label="TEXT_DE.wordplay.cardManagement.import"
            no-caps
            @click="showImportDialog"
          />
        </div>

        <!-- Move All Cards -->
        <div>
          <h3 class="text-subtitle1 text-weight-bold q-mb-xs">
            {{ TEXT_DE.wordplay.cardManagement.moveAllTitle }}
          </h3>
          <p class="text-caption text-grey-7 q-mb-sm">
            {{ TEXT_DE.wordplay.cardManagement.moveAllDescription }}
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
              :label="TEXT_DE.wordplay.cardManagement.moveAll"
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
            {{ TEXT_DE.wordplay.cardManagement.dangerZoneTitle }}
          </h3>
          <p class="text-caption text-grey-7 q-mb-sm">
            {{ TEXT_DE.wordplay.cardManagement.dangerZoneDescription }}
          </p>
          <q-btn
            outline
            color="negative"
            :label="TEXT_DE.wordplay.cardManagement.reset"
            no-caps
            @click="showResetDialog"
          />
        </div>
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

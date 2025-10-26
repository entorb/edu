<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useGameStore } from '../composables/useGameStore'
import { TEXT_DE } from '@edu/shared'
import { MIN_LEVEL, MAX_LEVEL, DEFAULT_TIME } from '../config/constants'
import type { Card } from '../types'

const router = useRouter()
const $q = useQuasar()
const { allCards, resetCards, importCards, moveAllCards } = useGameStore()

const exportButtonText = ref<string>(TEXT_DE.cardManagement.export)
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
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

function handleExport() {
  const header = 'en\tde\tlevel\n'
  const tsvContent = allCards.value.map(c => `${c.en}\t${c.de}\t${c.level}`).join('\n')
  navigator.clipboard
    .writeText(header + tsvContent)
    .then(() => {
      exportButtonText.value = TEXT_DE.cardManagement.copied
      setTimeout(() => (exportButtonText.value = TEXT_DE.cardManagement.export), 2000)
    })
    .catch(() => {
      $q.notify({
        type: 'negative',
        message: 'Konnte nicht in die Zwischenablage kopieren.'
      })
    })
}

function showImportDialog() {
  $q.dialog({
    title: 'Karten importieren',
    message: 'Füge deinen Kartentext ein (EN[Tab/,]DE[Tab/,]LEVEL):',
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
    $q.notify({ type: 'negative', message: 'Das Textfeld ist leer.' })
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
      message: 'Konnte kein Trennzeichen (Tab, Komma, Semikolon) finden.'
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
        id: Date.now() + index,
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
      message: `Keine gültigen Karten gefunden. Format: EN${delimiter}DE${delimiter}LEVEL (optional)`
    })
    return
  }

  $q.dialog({
    title: 'Import bestätigen',
    message: `${newCards.length} Karten gefunden. Importieren?`,
    cancel: true
  }).onOk(() => {
    importCards(newCards)
    $q.notify({
      type: 'positive',
      message: `${newCards.length} Karten erfolgreich importiert!`
    })
  })
}

function handleMoveClick() {
  const level = Number(targetLevel.value)
  if (level < MIN_LEVEL || level > MAX_LEVEL) {
    $q.notify({
      type: 'negative',
      message: `Bitte gib ein Level zwischen ${MIN_LEVEL} und ${MAX_LEVEL} ein.`
    })
    return
  }

  $q.dialog({
    title: 'Verschieben bestätigen',
    message: `Alle ${allCards.value.length} Karten auf Level ${level} setzen?`,
    cancel: true
  }).onOk(() => {
    moveAllCards(level)
    $q.notify({ type: 'positive', message: 'Alle Karten verschoben!' })
  })
}

function showResetDialog() {
  $q.dialog({
    title: 'Zurücksetzen bestätigen',
    message: 'Diese Aktion setzt alle Karten und deinen Lernfortschritt zurück. Fortfahren?',
    cancel: true,
    color: 'negative'
  }).onOk(() => {
    resetCards()
    $q.notify({ type: 'positive', message: 'Kartenstapel wurde zurückgesetzt!' })
  })
}

function getLevelColor(level: number): string {
  const colors = ['red', 'orange', 'amber', 'light-green', 'green']
  return colors[level - 1] || 'grey'
}
</script>

<template>
  <q-layout
    view="hHh lpR fFf"
    class="bg-grey-3"
  >
    <q-header
      elevated
      class="bg-white text-grey-9"
    >
      <q-toolbar>
        <q-btn
          flat
          round
          dense
          icon="arrow_back"
          @click="handleGoBack"
        >
          <q-tooltip>{{ TEXT_DE.game.backToMenu }}</q-tooltip>
        </q-btn>
        <q-toolbar-title class="text-center">{{ TEXT_DE.cardManagement.title }}</q-toolbar-title>
        <q-btn
          flat
          round
          dense
          icon="arrow_back"
          style="visibility: hidden"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md">
        <div
          class="q-mx-auto"
          style="max-width: 700px"
        >
          <div class="q-gutter-lg">
            <!-- Export -->
            <div>
              <h3 class="text-subtitle1 text-weight-bold q-mb-xs">Karten Exportieren</h3>
              <p class="text-caption text-grey-7 q-mb-sm">
                Speichere deinen aktuellen Kartenstapel in der Zwischenablage im TSV-Format.
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
              <h3 class="text-subtitle1 text-weight-bold q-mb-xs">Karten Importieren</h3>
              <p class="text-caption text-grey-7 q-mb-sm">
                Ersetze deinen aktuellen Stapel durch Kartendaten aus der Zwischenablage.
              </p>
              <q-btn
                outline
                color="grey-8"
                :label="TEXT_DE.cardManagement.import"
                no-caps
                @click="showImportDialog"
              />
            </div>

            <!-- Move All Cards -->
            <div>
              <h3 class="text-subtitle1 text-weight-bold q-mb-xs">Alle Karten verschieben</h3>
              <p class="text-caption text-grey-7 q-mb-sm">
                Setze alle Karten im Stapel auf ein bestimmtes Level.
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
                  :label="TEXT_DE.cardManagement.moveAll"
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
              <h3 class="text-subtitle1 text-weight-bold q-mb-xs text-negative">Gefahrenzone</h3>
              <p class="text-caption text-grey-7 q-mb-sm">
                Setze alle Karten und deinen gesamten Lernfortschritt auf den ursprünglichen Zustand
                zurück.
              </p>
              <q-btn
                outline
                color="negative"
                :label="TEXT_DE.cardManagement.reset"
                no-caps
                @click="showResetDialog"
              />
            </div>

            <!-- Current Deck -->
            <div
              class="q-pt-lg"
              style="border-top: 1px solid #e0e0e0"
            >
              <h3 class="text-h6 text-weight-bold q-mb-md">
                {{ TEXT_DE.cardManagement.currentDeck }} ({{ allCards.length }})
              </h3>
              <q-list
                bordered
                separator
              >
                <q-item
                  v-for="card in allCards"
                  :key="card.id"
                >
                  <q-item-section>
                    <q-item-label>{{ card.en }} → {{ card.de }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-badge
                      :color="getLevelColor(card.level)"
                      :label="`L${card.level}`"
                    />
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

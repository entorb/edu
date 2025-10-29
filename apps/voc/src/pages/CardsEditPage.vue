<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useGameStore } from '../composables/useGameStore'
import { TEXT_DE } from '@flashcards/shared'
import { MIN_LEVEL, MAX_LEVEL } from '../constants'
import { parseCardsFromText } from '../utils/helpers'
import type { Card } from '../types'

const router = useRouter()
const $q = useQuasar()
const { allCards, importCards } = useGameStore()

// Create a working copy of cards for editing
const editingCards = ref<Card[]>([])
const exportButtonText = ref<string>(TEXT_DE.voc.cards.export)
const hasChanges = ref(false)

onMounted(() => {
  // Initialize with a copy of current cards
  editingCards.value = allCards.value.map(card => ({ ...card }))
  globalThis.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  globalThis.removeEventListener('keydown', handleKeyDown)
})

function handleGoBack() {
  if (hasChanges.value) {
    $q.dialog({
      title: TEXT_DE.voc.cards.unsavedChangesTitle,
      message: TEXT_DE.voc.cards.unsavedChangesMessage,
      cancel: true
    }).onOk(() => {
      router.push('/cards')
    })
  } else {
    router.push('/cards')
  }
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    handleGoBack()
  }
}

function handleExport() {
  const header = 'en\tde\tlevel\n'
  const tsvContent = editingCards.value.map(c => `${c.en}\t${c.de}\t${c.level}`).join('\n')
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

async function handleImport() {
  try {
    const clipboardText = await navigator.clipboard.readText()
    processImportText(clipboardText)
  } catch {
    // Clipboard access failed (permission denied or other issue)
    // Offer manual paste as fallback
    showManualImportDialog()
  }
}

function showManualImportDialog() {
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
    processImportText(text)
  })
}

function processImportText(text: string) {
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

  editingCards.value = newCards
  hasChanges.value = true
  $q.notify({
    type: 'positive',
    message: TEXT_DE.voc.cards.importSuccess.replace('{count}', newCards.length.toString())
  })
}

function handleSave() {
  // Validate all cards
  for (const card of editingCards.value) {
    if (!card.en.trim()) {
      $q.notify({
        type: 'negative',
        message: TEXT_DE.voc.cards.validationEnEmpty
      })
      return
    }
    if (!card.de.trim()) {
      $q.notify({
        type: 'negative',
        message: TEXT_DE.voc.cards.validationDeEmpty
      })
      return
    }
    if (card.level < MIN_LEVEL || card.level > MAX_LEVEL) {
      $q.notify({
        type: 'negative',
        message: TEXT_DE.voc.cards.invalidLevelError
          .replace('{min}', MIN_LEVEL.toString())
          .replace('{max}', MAX_LEVEL.toString())
      })
      return
    }
  }

  // Import the edited cards (replaces current cards)
  importCards(editingCards.value)
  hasChanges.value = false

  $q.notify({
    type: 'positive',
    message: TEXT_DE.voc.cards.saveSuccess
  })

  router.push('/cards')
}

function addNewCard() {
  editingCards.value.push({
    en: '',
    de: '',
    level: 1,
    time_blind: 60,
    time_typing: 60
  })
  hasChanges.value = true
}

function removeCard(index: number) {
  editingCards.value.splice(index, 1)
  hasChanges.value = true
}

function onCardChange() {
  hasChanges.value = true
}
</script>

<template>
  <q-page
    class="q-pa-md card-edit-page"
    style="max-width: 1000px; margin: 0 auto"
  >
    <!-- Header with back button -->
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
      <h2 class="q-ma-none text-h6">{{ TEXT_DE.voc.cards.editCardsTitle }}</h2>
      <div style="width: 40px" />
    </div>

    <div class="q-gutter-lg">
      <!-- Export and Import buttons -->
      <div class="row q-gutter-md items-center">
        <q-btn
          outline
          color="primary"
          icon="arrow_upward"
          :label="exportButtonText"
          no-caps
          @click="handleExport"
          data-cy="export-button"
        />
        <q-btn
          outline
          color="primary"
          icon="arrow_downward"
          :label="TEXT_DE.voc.cards.import"
          no-caps
          @click="handleImport"
          data-cy="import-button"
        />
        <q-btn
          outline
          color="primary"
          icon="add"
          :label="TEXT_DE.voc.cards.addNewCard"
          no-caps
          @click="addNewCard"
          data-cy="add-card-button"
        />
      </div>

      <div>{{ TEXT_DE.voc.cards.importHintExcel }}</div>

      <!-- Editable Cards Table -->
      <div style="overflow-x: auto">
        <q-list
          bordered
          separator
          style="min-width: 600px"
        >
          <!-- Header Row -->
          <q-item class="bg-grey-2">
            <q-item-section style="flex: 0 0 40%">
              <q-item-label class="text-weight-bold">{{ TEXT_DE.words.english }}</q-item-label>
            </q-item-section>
            <q-item-section style="flex: 0 0 40%">
              <q-item-label class="text-weight-bold">{{ TEXT_DE.words.german }}</q-item-label>
            </q-item-section>
            <q-item-section style="flex: 0 0 15%">
              <q-item-label class="text-weight-bold">{{ TEXT_DE.words.level }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label class="text-weight-bold">{{ TEXT_DE.words.actions }}</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Data Rows -->
          <q-item
            v-for="(card, index) in editingCards"
            :key="index"
          >
            <q-item-section style="flex: 0 0 40%">
              <q-input
                v-model="card.en"
                outlined
                dense
                :placeholder="TEXT_DE.voc.cards.enPlaceholder"
                @update:model-value="onCardChange"
                data-cy="`card-en-${index}`"
              />
            </q-item-section>
            <q-item-section style="flex: 0 0 40%">
              <q-input
                v-model="card.de"
                outlined
                dense
                :placeholder="TEXT_DE.voc.cards.dePlaceholder"
                @update:model-value="onCardChange"
                data-cy="`card-de-${index}`"
              />
            </q-item-section>
            <q-item-section style="flex: 0 0 15%">
              <q-input
                v-model.number="card.level"
                type="number"
                outlined
                dense
                :min="MIN_LEVEL"
                :max="MAX_LEVEL"
                style="width: 60px"
                @update:model-value="onCardChange"
                data-cy="`card-level-${index}`"
              />
            </q-item-section>
            <q-item-section side>
              <q-btn
                flat
                round
                dense
                icon="delete"
                color="negative"
                size="sm"
                @click="removeCard(index)"
                data-cy="`delete-card-${index}`"
              >
                <q-tooltip>{{ TEXT_DE.words.delete }}</q-tooltip>
              </q-btn>
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- Save Button -->
      <div class="row q-gutter-md q-pt-lg justify-end">
        <q-btn
          outline
          color="grey-8"
          :label="TEXT_DE.common.cancel"
          no-caps
          @click="handleGoBack"
          data-cy="cancel-button"
        />
        <q-btn
          :outline="!hasChanges"
          :unelevated="hasChanges"
          :color="hasChanges ? 'positive' : 'primary'"
          icon="save"
          :label="TEXT_DE.voc.cards.save"
          no-caps
          @click="handleSave"
          data-cy="save-button"
          :class="{ 'save-btn-changed': hasChanges }"
        />
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.card-edit-page {
  min-height: 100vh;
  padding-bottom: 100px !important;
}

.save-btn-changed {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
  }

  50% {
    box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);
  }
}
</style>

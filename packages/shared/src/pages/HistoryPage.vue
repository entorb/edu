<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { TEXT_DE } from '../text-de'

interface HistoryItem {
  date: string
  [key: string]: any
}

interface Props {
  history: HistoryItem[]
  formatDetails: (item: HistoryItem) => string
  getPoints: (item: HistoryItem) => number
  getCorrectAnswers: (item: HistoryItem) => string
}

const props = defineProps<Props>()

const router = useRouter()

const sortedHistory = computed(() => {
  return [...props.history].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
})

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }
  return new Intl.DateTimeFormat('de-DE', options).format(date)
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    goHome()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

function goHome() {
  router.push({ name: '/' })
}
</script>

<template>
  <q-page
    class="q-pa-md"
    style="max-width: 800px; margin: 0 auto"
  >
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <q-btn
        flat
        round
        icon="arrow_back"
        @click="goHome"
        size="md"
      />
      <div class="text-h5 q-ml-sm text-weight-bold text-grey-8">{{ TEXT_DE.nav.history }}</div>
    </div>

    <!-- Empty State -->
    <div
      v-if="history.length === 0"
      class="text-center q-mt-xl"
    >
      <q-icon
        name="inbox"
        size="80px"
        color="grey-5"
      />
      <div class="text-h6 text-grey-6 q-mt-md text-weight-medium">
        {{ TEXT_DE.stats.noGamesPlayed }}
      </div>
    </div>

    <!-- History List -->
    <q-list
      v-else
      separator
      bordered
      class="rounded-borders"
    >
      <q-item
        v-for="(game, index) in sortedHistory"
        :key="index"
        class="q-pa-md"
        clickable
        v-ripple
      >
        <q-item-section avatar>
          <q-avatar
            color="primary"
            text-color="white"
            size="48px"
          >
            <q-icon name="emoji_events" />
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label class="text-weight-bold">
            {{ formatDate(game.date) }}
          </q-item-label>
          <q-item-label caption>
            {{ formatDetails(game) }}
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <div class="column items-end">
            <div class="text-h6 text-primary text-weight-bold">{{ getPoints(game) }}</div>
            <div class="text-caption text-grey-7">
              {{ getCorrectAnswers(game) }}
            </div>
          </div>
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

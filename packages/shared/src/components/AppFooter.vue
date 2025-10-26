<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { helperStatsDataRead } from '../utils/statsHelpers'
import { TEXT_DE } from '@edu/shared'

interface Props {
  basePath: string
}

const props = defineProps<Props>()

const numTotalGamesPlayedByAll = ref<number>(0)

onMounted(async () => {
  // Fetch total games played by all users from database
  numTotalGamesPlayedByAll.value = await helperStatsDataRead(props.basePath)
})
</script>

<template>
  <div class="text-center q-mt-lg q-pa-md text-caption text-grey-7 footer-links">
    <div
      v-if="numTotalGamesPlayedByAll && numTotalGamesPlayedByAll > 0"
      class="q-mt-sm text-grey-6"
    >
      {{ numTotalGamesPlayedByAll.toLocaleString('de-DE') }}
      {{ TEXT_DE.totalGamesPlayedByAll }}
      {{ TEXT_DE.footerNoDataStored }}
    </div>
    <div class="q-gutter-x-md q-mt-sm">
      <a
        :href="`https://entorb.net/contact.php?origin=${basePath}`"
        target="_blank"
        >by Torben</a
      >
      <a
        href="https://entorb.net"
        target="_blank"
        >Home</a
      >
      <a
        href="https://entorb.net/impressum.php"
        target="_blank"
        >Disclaimer</a
      >
      <a
        href="https://github.com/entorb/flashcards"
        target="_blank"
        >GitHub</a
      >
    </div>
  </div>
</template>

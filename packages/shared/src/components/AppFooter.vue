<script setup lang="ts">
interface TextDE {
  totalGamesPlayedByAll: string
  footerNoDataStored: string
}

interface Props {
  totalGamesPlayedByAll?: number
  basePath: string
  textDe: TextDE
}

defineProps<Props>()
</script>

<template>
  <div class="text-center q-mt-lg q-pa-md text-caption text-grey-7 footer-links">
    <div
      v-if="totalGamesPlayedByAll && totalGamesPlayedByAll > 0"
      class="q-mt-sm text-grey-6"
    >
      {{ totalGamesPlayedByAll.toLocaleString('de-DE') }}
      {{ textDe.totalGamesPlayedByAll }}
      {{ textDe.footerNoDataStored }}
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
        href="https://github.com/entorb/edu"
        target="_blank"
        >GitHub</a
      >
    </div>
  </div>
</template>

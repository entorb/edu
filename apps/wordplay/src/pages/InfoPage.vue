<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { TEXT_DE } from '@edu/shared'

const router = useRouter()

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
        <q-toolbar-title class="text-center">{{ TEXT_DE.info.title }}</q-toolbar-title>
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
          class="q-mx-auto q-gutter-lg text-grey-8"
          style="max-width: 700px"
        >
          <p>
            Dein Punktestand (Score) wird basierend auf mehreren Faktoren berechnet, um einen Anreiz
            für das Lernen schwierigerer Wörter und die Verwendung anspruchsvollerer Spielmodi zu
            schaffen.
          </p>

          <div>
            <h3 class="text-subtitle1 text-weight-bold q-mb-sm">1. Basispunkte</h3>
            <p>
              Die Grundlage für die Punktzahl ist das Level der Karte. Wörter, die du weniger gut
              kennst (niedrigeres Level), geben mehr Punkte.
            </p>
            <ul class="q-pl-md q-mt-sm">
              <li><strong class="text-primary">Level 1:</strong> 5 Punkte</li>
              <li><strong class="text-primary">Level 2:</strong> 4 Punkte</li>
              <li><strong class="text-primary">Level 3:</strong> 3 Punkte</li>
              <li><strong class="text-primary">Level 4:</strong> 2 Punkte</li>
              <li><strong class="text-primary">Level 5:</strong> 1 Punkt</li>
            </ul>
          </div>

          <div>
            <h3 class="text-subtitle1 text-weight-bold q-mb-sm">2. Modus-Multiplikator</h3>
            <p>Die Basispunkte werden mit einem Multiplikator versehen:</p>
            <ul class="q-pl-md q-mt-sm">
              <li><strong class="text-primary">Multiple Choice:</strong> x1 (Standard)</li>
              <li><strong class="text-primary">Blind:</strong> x2</li>
              <li><strong class="text-primary">Tippen:</strong> x4</li>
            </ul>
          </div>

          <div>
            <h3 class="text-subtitle1 text-weight-bold q-mb-sm">3. Zusätzliche Regeln</h3>
            <ul class="q-pl-md">
              <li class="q-mb-sm">
                <strong class="text-primary">"Fast richtig":</strong> Im Tippen-Modus erhältst du
                bei kleinen Tippfehlern (ein Buchstabe falsch)
                <strong class="text-primary">75%</strong> der möglichen Punkte.
              </li>
              <li class="q-mb-sm">
                <strong class="text-primary">Sprachrichtung:</strong> Für eine richtige Antwort in
                der Richtung Deutsch → Englisch erhältst du
                <strong class="text-primary">+1</strong> Zusatzpunkt.
              </li>
              <li><strong class="text-primary">Falsche Antworten</strong> geben immer 0 Punkte.</li>
            </ul>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

/**
 * Shared Game Timer Composable
 * Provides timer logic used in GamePage components across both apps
 */

import { ref, watch, onUnmounted, type Ref } from 'vue'

/**
 * Creates a game timer that tracks elapsed time and resets on trigger
 * @param trigger - Ref to watch for changes (typically currentCard)
 * @param maxTime - Optional maximum time in seconds (default: no limit)
 * @returns Object with elapsedTime ref and stopTimer function
 */
export function useGameTimer(trigger: Ref<unknown>, maxTime?: number) {
  const elapsedTime = ref(0)
  let timerInterval: ReturnType<typeof setInterval> | null = null

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  function startTimer() {
    stopTimer()
    elapsedTime.value = 0
    timerInterval = setInterval(() => {
      elapsedTime.value += 0.1
      if (maxTime !== undefined && elapsedTime.value >= maxTime) {
        elapsedTime.value = maxTime
      }
    }, 100)
  }

  // Watch for changes in trigger and restart timer
  watch(
    trigger,
    () => {
      startTimer()
    },
    { immediate: true }
  )

  // Cleanup on unmount
  onUnmounted(() => {
    stopTimer()
  })

  return {
    elapsedTime,
    stopTimer,
    startTimer
  }
}

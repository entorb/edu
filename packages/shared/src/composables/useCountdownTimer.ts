/**
 * Shared Countdown Timer Composable
 * Provides countdown timer logic with periodic updates
 * Used for auto-close countdowns and button disable countdowns
 */

import { ref, onUnmounted } from 'vue'

export interface UseCountdownTimerOptions {
  /** Interval in milliseconds for countdown updates (default: 100ms) */
  tickInterval?: number
}

/**
 * Create a countdown timer with regular tick updates
 *
 * @param options Configuration for the timer
 * @returns Object with reactive countdown value and control methods
 *
 * @example
 * ```typescript
 * const { countdown, isRunning, start, stop, reset } = useCountdownTimer({
 *   tickInterval: 100
 * })
 *
 * // Start a 3-second countdown
 * start(3, () => {
 *   console.log('Countdown finished!')
 * })
 *
 * // countdown.value will update from 3 to 0 every 100ms
 * // When it reaches 0, the callback is called
 * ```
 */
export function useCountdownTimer(options: UseCountdownTimerOptions = {}) {
  const tickInterval = options.tickInterval ?? 100

  // Reactive state
  const countdown = ref(0)
  const isRunning = ref(false)

  // Timer reference
  let countdownInterval: ReturnType<typeof setInterval> | null = null
  let endCallback: (() => void) | null = null

  /**
   * Start a countdown from the specified duration
   *
   * @param durationSeconds Duration in seconds to count down from
   * @param onComplete Optional callback when countdown reaches 0
   */
  function start(durationSeconds: number, onComplete?: () => void) {
    stop()
    countdown.value = durationSeconds
    isRunning.value = true
    endCallback = onComplete || null

    countdownInterval = setInterval(() => {
      countdown.value = Math.max(0, countdown.value - tickInterval / 1000)

      if (countdown.value <= 0) {
        stop()
        endCallback?.()
      }
    }, tickInterval)
  }

  /**
   * Stop the countdown timer
   */
  function stop() {
    if (countdownInterval) {
      clearInterval(countdownInterval)
      countdownInterval = null
    }
    isRunning.value = false
  }

  /**
   * Reset countdown to 0
   */
  function reset() {
    stop()
    countdown.value = 0
  }

  // Cleanup on unmount
  onUnmounted(() => {
    stop()
  })

  return {
    countdown,
    isRunning,
    start,
    stop,
    reset
  }
}

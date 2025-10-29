/**
 * Shared Answer Feedback State Management Composable
 * Handles feedback display, auto-close timers, and button disable logic
 * Used by both 1x1 and voc apps for consistent feedback behavior
 */

import { ref } from 'vue'

export interface UseAnswerFeedbackOptions {
  /** Duration in milliseconds to auto-close after correct answer */
  autoCloseDuration?: number
  /** Duration in milliseconds to disable button after incorrect/close answer */
  buttonDisableDuration?: number
  /** Interval in milliseconds for countdown updates */
  countdownInterval?: number
}

/**
 * Create feedback state management with auto-close and button disable timers
 *
 * @param options Configuration for durations and intervals
 * @returns Object with reactive state and methods to manage feedback display
 *
 * @example
 * ```typescript
 * const {
 *   showFeedback,
 *   answerStatus,
 *   isButtonDisabled,
 *   feedbackCountdown,
 *   buttonDisableCountdown,
 *   startAutoClose,
 *   startButtonDisable,
 *   clearTimers
 * } = useAnswerFeedback({
 *   autoCloseDuration: 3000,
 *   buttonDisableDuration: 3000,
 *   countdownInterval: 100
 * })
 * ```
 */
export function useAnswerFeedback(options: UseAnswerFeedbackOptions = {}) {
  const autoCloseDuration = options.autoCloseDuration ?? 3000
  const buttonDisableDuration = options.buttonDisableDuration ?? 3000
  const countdownInterval = options.countdownInterval ?? 100

  // Reactive state
  const showFeedback = ref(false)
  const answerStatus = ref<'correct' | 'incorrect' | 'close' | null>(null)
  const isButtonDisabled = ref(false)
  const feedbackCountdown = ref(0)
  const buttonDisableCountdown = ref(0)

  // Timer references
  let autoCloseTimer: ReturnType<typeof setTimeout> | null = null
  let autoCloseCountdownInterval: ReturnType<typeof setInterval> | null = null
  let buttonDisableTimer: ReturnType<typeof setTimeout> | null = null
  let buttonDisableCountdownInterval: ReturnType<typeof setInterval> | null = null

  /**
   * Clear all timers and reset countdown values
   */
  function clearTimers() {
    if (autoCloseTimer) clearTimeout(autoCloseTimer)
    if (autoCloseCountdownInterval) clearInterval(autoCloseCountdownInterval)
    if (buttonDisableTimer) clearTimeout(buttonDisableTimer)
    if (buttonDisableCountdownInterval) clearInterval(buttonDisableCountdownInterval)

    autoCloseTimer = null
    autoCloseCountdownInterval = null
    buttonDisableTimer = null
    buttonDisableCountdownInterval = null
    feedbackCountdown.value = 0
    buttonDisableCountdown.value = 0
  }

  /**
   * Start auto-close timer for correct answers
   * Automatically advances to next card after configured duration
   *
   * @param onAutoClose Callback function to call when timer expires
   */
  function startAutoClose(onAutoClose: () => void) {
    clearTimers()
    const countdownDurationSeconds = autoCloseDuration / 1000
    feedbackCountdown.value = countdownDurationSeconds

    // Update countdown every interval
    autoCloseCountdownInterval = setInterval(() => {
      feedbackCountdown.value = Math.max(0, feedbackCountdown.value - countdownInterval / 1000)
    }, countdownInterval)

    // Auto-close after duration
    autoCloseTimer = setTimeout(() => {
      clearTimers()
      onAutoClose()
    }, autoCloseDuration)
  }

  /**
   * Start button disable timer for incorrect/close answers
   * Prevents accidental clicks for configured duration
   *
   * @param onButtonEnable Callback function to call when button becomes enabled
   */
  function startButtonDisable(onButtonEnable: () => void) {
    clearTimers()
    isButtonDisabled.value = true
    const countdownDurationSeconds = buttonDisableDuration / 1000
    buttonDisableCountdown.value = countdownDurationSeconds

    // Update countdown every interval
    buttonDisableCountdownInterval = setInterval(() => {
      buttonDisableCountdown.value = Math.max(
        0,
        buttonDisableCountdown.value - countdownInterval / 1000
      )
    }, countdownInterval)

    // Re-enable button after duration
    buttonDisableTimer = setTimeout(() => {
      isButtonDisabled.value = false
      clearTimers()
      onButtonEnable()
    }, buttonDisableDuration)
  }

  /**
   * Reset feedback state (called when card changes)
   */
  function reset() {
    clearTimers()
    showFeedback.value = false
    answerStatus.value = null
    isButtonDisabled.value = false
    feedbackCountdown.value = 0
    buttonDisableCountdown.value = 0
  }

  return {
    // Reactive state
    showFeedback,
    answerStatus,
    isButtonDisabled,
    feedbackCountdown,
    buttonDisableCountdown,

    // Methods
    startAutoClose,
    startButtonDisable,
    clearTimers,
    reset
  }
}

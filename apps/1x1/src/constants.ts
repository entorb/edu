/**
 * Central configuration file for 1x1 Learning App
 * All magic numbers and reusable constants are defined here
 */

// Re-export shared constants
export {
  MIN_LEVEL as MIN_CARD_LEVEL,
  MAX_LEVEL as MAX_CARD_LEVEL,
  MIN_TIME as MIN_CARD_TIME,
  MAX_TIME as MAX_CARD_TIME,
  AUTO_CLOSE_DURATION,
  BUTTON_DISABLE_DURATION,
  FIRST_GAME_BONUS,
  STREAK_GAME_BONUS,
  STREAK_GAME_INTERVAL,
  SPEED_BONUS_POINTS
} from '@flashcards/shared'

export const BASE_PATH = '1x1'

// ============================================================================
// GAME LOGIC CONSTANTS
// ============================================================================

/**
 * Auto-submit answer after entering this many digits
 */
export const AUTO_SUBMIT_DIGITS = 2

/**
 * Available multiplication table selections
 */
export const SELECT_OPTIONS = [3, 4, 5, 6, 7, 8, 9]

/**
 * Default select values when app starts
 */
export const DEFAULT_SELECT = [3, 4, 5, 6, 7, 8, 9]

/**
 * Maximum number of cards per game
 */
export const MAX_CARDS_PER_GAME = 10

/**
 * Countdown update interval (milliseconds)
 */
export const COUNTDOWN_INTERVAL = 1000

// ============================================================================
// COLOR SCHEMES
// ============================================================================

/**
 * CardsPage: Level colors (from red=weak to green=strong)
 */
export const LEVEL_COLORS = {
  1: '#ffcdd2', // red-100
  2: '#ffe0b2', // orange-100
  3: '#fff9c4', // yellow-100
  4: '#dcedc8', // light-green-100
  5: '#c8e6c9' // green-100
}

/**
 * CardsPage: Time colors (from green=fast to red=slow)
 */
export const TIME_COLORS = {
  veryFast: '#2e7d32', // green-800
  fast: '#558b2f', // light-green-800
  medium: '#f57f17', // yellow-800
  slow: '#e65100', // orange-900
  verySlow: '#c62828' // red-800
}

/**
 * CardsPage: Thresholds for time color transitions (normalized 0-1)
 */
export const TIME_COLOR_THRESHOLDS = {
  veryFast: 0.2,
  fast: 0.4,
  medium: 0.6,
  slow: 0.8
}

/**
 * Background colors
 */
export const BG_COLORS = {
  disabled: '#f5f5f5',
  grey: '#fafafa',
  lightGrey: '#f8f9fa'
}

// ============================================================================
// EXTERNAL API
// ============================================================================

/**
 * Database column name for web stats tracking
 */
export const STATS_DB_COL = BASE_PATH

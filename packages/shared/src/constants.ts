/**
 * Shared constants used across all flashcards apps
 */

// ============================================================================
// GAME DIFFICULTY LEVELS
// ============================================================================

/**
 * Minimum difficulty level for cards
 */
export const MIN_LEVEL = 1

/**
 * Maximum difficulty level for cards
 */
export const MAX_LEVEL = 5

// ============================================================================
// CARD TIMING
// ============================================================================

/**
 * Minimum card response time in seconds
 */
export const MIN_TIME = 0.1

/**
 * Maximum card response time in seconds (60 second cap)
 */
export const MAX_TIME = 60

/**
 * Default response time for new cards in seconds
 */
export const DEFAULT_TIME = 60

// ============================================================================
// FEEDBACK TIMING
// ============================================================================

/**
 * Duration to auto-close correct answer feedback in milliseconds
 */
export const AUTO_CLOSE_DURATION = 3000

/**
 * Duration to disable buttons after wrong answer in milliseconds
 */
export const BUTTON_DISABLE_DURATION = 3000

// ============================================================================
// DAILY BONUSES
// ============================================================================

/**
 * Bonus points for the first game of the day
 */
export const FIRST_GAME_BONUS = 5

/**
 * Bonus points awarded every Nth game of the day
 */
export const STREAK_GAME_BONUS = 5

/**
 * Award streak bonus every N games played in a day
 */
export const STREAK_GAME_INTERVAL = 5

/**
 * Speed bonus points when beating previous time
 */
export const SPEED_BONUS_POINTS = 5

// ============================================================================
// COLOR PALETTE
// ============================================================================

/**
 * Color palette for card difficulty levels
 * Maps level 1-5 to hex colors: red → green
 * Used by LevelDistribution component and level visualizations
 */
export const LEVEL_COLORS: Record<number, string> = {
  1: '#ffcccc', // Red - Level 1 (beginner)
  2: '#ffe0b2', // Orange - Level 2
  3: '#fff9c4', // Amber - Level 3 (intermediate)
  4: '#c8e6c9', // Light green - Level 4
  5: '#81c784' // Green - Level 5 (advanced)
}

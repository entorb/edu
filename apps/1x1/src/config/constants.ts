/**
 * Central configuration file for 1x1 Learning App
 * All magic numbers and reusable constants are defined here
 */

export const BASE_PATH = '1x1'

// ============================================================================
// GAME LOGIC CONSTANTS
// ============================================================================

/**
 * Auto-submit answer after entering this many digits
 */
export const AUTO_SUBMIT_DIGITS = 2

/**
 * Auto-close correct answer feedback after this duration (milliseconds)
 */
export const AUTO_CLOSE_DURATION = 3000

/**
 * Disable buttons after wrong answer for this duration (milliseconds)
 */
export const BUTTON_DISABLE_DURATION = 3000

/**
 * Card level range
 */
export const MIN_CARD_LEVEL = 1
export const MAX_CARD_LEVEL = 5

/**
 * Card time range (seconds)
 */
export const MIN_CARD_TIME = 0.1
export const MAX_CARD_TIME = 60

/**
 * Speed bonus points when beating previous time
 */
export const SPEED_BONUS_POINTS = 5

/**
 * Bonus points for the first game of the day
 */
export const FIRST_GAME_BONUS = 5

/**
 * Bonus points for every Nth game of the day
 */
export const STREAK_GAME_BONUS = 5

/**
 * Award streak bonus every N games
 */
export const STREAK_GAME_INTERVAL = 5

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
// RESPONSIVE BREAKPOINTS
// ============================================================================

/**
 * Mobile breakpoint (iPhone 7 width: 375px, use standard small breakpoint)
 */
export const BREAKPOINT_MOBILE = 599.98

/**
 * Tablet breakpoint
 */
export const BREAKPOINT_TABLET = 600

/**
 * Large screen breakpoint
 */
export const BREAKPOINT_LARGE = 1024

// ============================================================================
// UI DIMENSIONS
// ============================================================================

/**
 * Mascot dimensions
 */
export const MASCOT_SIZE = {
  mobile: 100,
  desktop: 130,
  gameOver: 150
}

/**
 * Icon sizes
 */
export const ICON_SIZE = {
  small: '16px',
  medium: '24px',
  large: '80px',
  xlarge: '100px'
}

/**
 * Spacing values (pixels)
 */
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24
}

/**
 * Border radius values (pixels)
 */
export const BORDER_RADIUS = {
  small: 6,
  medium: 8,
  large: 12
}

/**
 * Card dimensions for stats grid
 */
export const GRID_CONFIG = {
  mobile: {
    gap: 4,
    headerWidth: 30,
    minHeight: 60,
    borderWidth: 1.5,
    minWidth: 450
  },
  tablet: {
    gap: 6,
    headerWidth: 40,
    minHeight: 85,
    borderWidth: 2,
    minWidth: 550
  },
  desktop: {
    gap: 8,
    headerWidth: 40,
    minHeight: 95,
    borderWidth: 2,
    minWidth: 650
  }
}

// ============================================================================
// COLOR SCHEMES
// ============================================================================

/**
 * StatsPage: Level colors (from red=weak to green=strong)
 */
export const LEVEL_COLORS = {
  1: '#ffcdd2', // red-100
  2: '#ffe0b2', // orange-100
  3: '#fff9c4', // yellow-100
  4: '#dcedc8', // light-green-100
  5: '#c8e6c9' // green-100
}

/**
 * StatsPage: Time colors (from green=fast to red=slow)
 */
export const TIME_COLORS = {
  veryFast: '#2e7d32', // green-800
  fast: '#558b2f', // light-green-800
  medium: '#f57f17', // yellow-800
  slow: '#e65100', // orange-900
  verySlow: '#c62828' // red-800
}

/**
 * StatsPage: Thresholds for time color transitions (normalized 0-1)
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
// FONT SIZES
// ============================================================================

export const FONT_SIZE = {
  mobile: {
    caption: '0.6rem',
    body: '0.75rem',
    subtitle: '0.875rem',
    h6: '1rem',
    h5: '1.25rem',
    h4: '1.5rem',
    h3: '1.75rem',
    h2: '2rem'
  },
  desktop: {
    caption: '0.75rem',
    body: '0.875rem',
    subtitle: '1rem',
    h6: '1.125rem',
    h5: '1.5rem',
    h4: '2rem',
    h3: '2.5rem',
    h2: '3rem'
  }
}

// ============================================================================
// FOCUS OPTIONS
// ============================================================================
import { TEXT_DE } from '@edu/shared'

export const FOCUS_OPTIONS = [
  { label: TEXT_DE.focusWeak, value: 'weak', icon: 'school' },
  { label: TEXT_DE.focusStrong, value: 'strong', icon: 'star' },
  { label: TEXT_DE.focusSlow, value: 'slow', icon: 'schedule' }
] as const

// ============================================================================
// EXTERNAL API
// ============================================================================

/**
 * Database column name for web stats tracking
 */
export const STATS_DB_COL = BASE_PATH

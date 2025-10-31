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
// EXTERNAL API
// ============================================================================

/**
 * Database column name for web stats tracking
 */
export const STATS_DB_COL = BASE_PATH

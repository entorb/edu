/**
 * Shared Types for Flashcards Monorepo
 * Contains common interfaces used across both 1x1 and Wordplay apps
 */

/**
 * Base GameHistory interface
 * All game history entries must include these core fields
 */
export interface BaseGameHistory {
  date: string // ISO date string (YYYY-MM-DD or full ISO)
  points: number // Points earned in this game
  correctAnswers: number // Number of correct answers
}

/**
 * Base Card interface
 * Apps may extend with additional fields
 */
export interface BaseCard {
  level: number // 1-5
}

/**
 * Common FocusType for both apps
 * Represents learning focus strategy
 */
export type FocusType = 'weak' | 'strong' | 'slow'

/**
 * Common AnswerResult for both apps
 */
export type AnswerResult = 'correct' | 'incorrect' | 'close'

/**
 * Game statistics interface
 * Can be extended with additional fields by specific apps
 */
export interface GameStats {
  correctAnswers: number
  gamesPlayed: number
  points: number
}

/**
 * Game result for game over page interface
 */
export interface GameResult {
  points: number
  correctAnswers: number
  totalCards: number
}

/**
 * Game state during gameplay (shared across both apps)
 * Runtime state tracking
 */
export interface GameState<T = BaseCard> {
  cards: T[] // Array of cards; apps should specify their Card type, defaulting to BaseCard
  currentCardIndex: number
  points: number
  correctAnswers: number
  startTime: number // timestamp
}

/**
 * Daily bonus tracking
 */
export interface DailyStats {
  date: string // ISO date string (YYYY-MM-DD)
  gamesPlayed: number
}

/**
 * Daily games increment result
 */
export interface DailyGamesResult {
  isFirstGame: boolean
  gamesPlayedToday: number
}

/**
 * 1x1 Multiplication App - Storage Service
 * Handles localStorage operations for cards, history, stats, and game configuration
 */

import type { Card, GameHistory, GameSettings } from '@/types'
import type { GameStats, GameResult } from '@flashcards/shared'
import {
  saveJSON,
  incrementDailyGames as sharedIncrementDailyGames,
  createHistoryOperations,
  createStatsOperations,
  createGamePersistence
} from '@flashcards/shared'
import { MIN_CARD_LEVEL, MAX_CARD_TIME, MIN_CARD_TIME, SELECT_OPTIONS } from '@/constants'

const STORAGE_KEYS = {
  CARDS: '1x1-cards',
  HISTORY: '1x1-history',
  STATS: '1x1-stats',
  GAME_CONFIG: '1x1-game-config',
  GAME_RESULT: '1x1-game-result',
  DAILY_STATS: '1x1-daily-stats',
  GAME_STATE: '1x1-game-state'
}

// Game persistence factory for session storage
interface GameState {
  gameCards: Card[]
  currentCardIndex: number
  points: number
  correctAnswersCount: number
}

const gamePersistence = createGamePersistence<GameSettings, GameState>(
  STORAGE_KEYS.GAME_CONFIG,
  STORAGE_KEYS.GAME_STATE
)

// Expected card count for 3x3 to 9x9 where y <= x
const EXPECTED_CARD_COUNT = 28

/**
 * Initialize all multiplication cards for the app
 * Generates cards from 3x3 to 9x9 where y <= x (avoiding duplicates)
 */
function initializeCards(): Card[] {
  const cards: Card[] = []
  const minTable = Math.min(...SELECT_OPTIONS)
  const maxTable = Math.max(...SELECT_OPTIONS)

  for (let x = minTable; x <= maxTable; x++) {
    for (let y = minTable; y <= x; y++) {
      cards.push({
        question: `${y}x${x}`,
        answer: x * y,
        level: MIN_CARD_LEVEL,
        time: MAX_CARD_TIME
      })
    }
  }

  saveJSON(STORAGE_KEYS.CARDS, cards)
  return cards
}
/**
 * Load all multiplication cards from storage
 */
export function loadCards(): Card[] {
  const stored = localStorage.getItem(STORAGE_KEYS.CARDS)
  if (!stored) {
    return initializeCards()
  }
  try {
    return JSON.parse(stored) as Card[]
  } catch {
    console.error('Error parsing 1x1 cards from localStorage. Reinitializing.')
    return initializeCards()
  }
}

/**
 * Save all cards to storage
 */
export function saveCards(cards: Card[]): void {
  saveJSON(STORAGE_KEYS.CARDS, cards)
}

/**
 * Verify card data integrity - ensures all expected cards exist
 */
export function verifyAndFixCards(): void {
  const cards = loadCards()

  if (cards.length !== EXPECTED_CARD_COUNT) {
    console.warn(
      `Card count mismatch: ${cards.length} !== ${EXPECTED_CARD_COUNT}. Reinitializing...`
    )
    initializeCards()
  }
}

/**
 * Update a specific card by question
 * @param question - Card question (e.g., "3x4")
 * @param updates - Partial card updates
 */
export function updateCard(question: string, updates: Partial<Card>): void {
  const cards = loadCards()
  const index = cards.findIndex(c => c.question === question)

  if (index !== -1) {
    // Clamp time within allowed range
    if (updates.time !== undefined) {
      updates.time = Math.max(MIN_CARD_TIME, Math.min(MAX_CARD_TIME, updates.time))
    }
    cards[index] = { ...cards[index], ...updates }
    saveCards(cards)
  }
}

/**
 * Reset all cards to initial state (level 1, time 60s)
 */
export function resetCards(): void {
  const cards = loadCards()
  for (const card of cards) {
    card.level = MIN_CARD_LEVEL
    card.time = MAX_CARD_TIME
  }
  saveCards(cards)
}

// Game History - Using shared operations

const historyOps = createHistoryOperations<GameHistory>(STORAGE_KEYS.HISTORY)

/**
 * Load all game history entries
 */
export function loadHistory(): GameHistory[] {
  return historyOps.load()
}

/**
 * Save all game history
 */
export function saveHistory(history: GameHistory[]): void {
  historyOps.save(history)
}

/**
 * Add a single game entry to history
 */
export function addHistory(history: GameHistory): void {
  historyOps.add(history)
}

// Statistics - Using shared operations

const statsOps = createStatsOperations<GameStats>(STORAGE_KEYS.STATS, {
  gamesPlayed: 0,
  points: 0,
  correctAnswers: 0
})

/**
 * Load overall game statistics
 */
export function loadGameStats(): GameStats {
  return statsOps.load()
}

/**
 * Save statistics
 */
export function saveGameStats(stats: GameStats): void {
  statsOps.save(stats)
}

/**
 * Update statistics after a game
 * Note: For 1x1, use updateBonusPoints() instead to avoid double-incrementing gamesPlayed
 */
export function updateStatistics(points: number, correctAnswers: number): void {
  statsOps.update(points, correctAnswers)
}

/**
 * Update only bonus points without incrementing gamesPlayed
 * Used for daily bonuses in GameOverPage after saveGameResults() has already incremented gamesPlayed
 */
export function updateBonusPoints(points: number): void {
  const stats = statsOps.load()
  // Don't increment gamesPlayed - it's already incremented by saveGameResults()
  stats.points += points
  statsOps.save(stats)
}

// Game Configuration (Session Storage)

/**
 * Save current game configuration to session storage
 */
export function setGameConfig(config: GameSettings): void {
  gamePersistence.saveSettings(config)
}

/**
 * Load game configuration from session storage
 */
export function getGameConfig(): GameSettings | null {
  return gamePersistence.loadSettings()
}

/**
 * Clear game configuration from session storage
 */
export function clearGameConfig(): void {
  gamePersistence.clearSettings()
}

// Game Result (Session Storage)

/**
 * Save game result to session storage
 */
export function setGameResult(result: GameResult): void {
  sessionStorage.setItem(STORAGE_KEYS.GAME_RESULT, JSON.stringify(result))
}

/**
 * Load game result from session storage
 */
export function getGameResult(): GameResult | null {
  const stored = sessionStorage.getItem(STORAGE_KEYS.GAME_RESULT)
  return stored ? JSON.parse(stored) : null
}

/**
 * Clear game result from session storage
 */
export function clearGameResult(): void {
  sessionStorage.removeItem(STORAGE_KEYS.GAME_RESULT)
}

// Daily Stats

/**
 * Track daily games and detect first game of the day
 * Used for bonus points
 */
export function incrementDailyGames(): { isFirstGame: boolean; gamesPlayedToday: number } {
  return sharedIncrementDailyGames(STORAGE_KEYS.DAILY_STATS)
}

// Game State (for reload recovery)

/**
 * Save current game state to session storage for reload recovery
 */
export function saveGameState(state: GameState): void {
  gamePersistence.saveState(state)
}

/**
 * Load game state from session storage
 */
export function loadGameState(): GameState | null {
  return gamePersistence.loadState()
}

/**
 * Clear game state from session storage
 */
export function clearGameState(): void {
  gamePersistence.clearState()
}

// Reset All

/**
 * Reset all stored data (cards, history, stats, session storage)
 */
export function resetAll(): void {
  localStorage.removeItem(STORAGE_KEYS.CARDS)
  localStorage.removeItem(STORAGE_KEYS.HISTORY)
  localStorage.removeItem(STORAGE_KEYS.STATS)
  localStorage.removeItem(STORAGE_KEYS.DAILY_STATS)
  sessionStorage.removeItem(STORAGE_KEYS.GAME_RESULT)
  gamePersistence.clearAll()
}

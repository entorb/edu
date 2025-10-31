/**
 * Wordplay Vocabulary App - Storage Service
 * Handles localStorage operations for cards, history, settings, and stats
 */

import type { Card, GameSettings, GameHistory } from '../types'
import { INITIAL_CARDS } from '../constants'
import type { GameStats } from '@flashcards/shared'
import {
  loadJSON,
  saveJSON,
  incrementDailyGames as sharedIncrementDailyGames,
  createHistoryOperations,
  createStatsOperations,
  createGamePersistence
} from '@flashcards/shared'

const STORAGE_KEYS = {
  CARDS: 'voc-cards',
  HISTORY: 'voc-history',
  SETTINGS: 'voc-last-settings',
  STATS: 'voc-stats',
  DAILY_STATS: 'voc-daily-stats',
  GAME_STATE: 'voc-game-state',
  GAME_SETTINGS: 'voc-game-settings'
}

// Game persistence factory for session storage
interface GameState {
  gameCards: Card[]
  currentCardIndex: number
  points: number
  correctAnswersCount: number
}

const gamePersistence = createGamePersistence<GameSettings, GameState>(
  STORAGE_KEYS.GAME_SETTINGS,
  STORAGE_KEYS.GAME_STATE
)

// Cards

/**
 * Load flashcards from storage
 */
export function loadCards(): Card[] {
  const stored = localStorage.getItem(STORAGE_KEYS.CARDS)
  if (!stored) {
    // No cards in storage - save and return initial cards
    saveCards(INITIAL_CARDS)
    return INITIAL_CARDS
  }
  try {
    return JSON.parse(stored) as Card[]
  } catch {
    // If parsing fails, save and return initial cards
    saveCards(INITIAL_CARDS)
    return INITIAL_CARDS
  }
}

/**
 * Save flashcards to storage
 */
export function saveCards(cards: Card[]): void {
  saveJSON(STORAGE_KEYS.CARDS, cards)
}

// History - Using shared operations

const historyOps = createHistoryOperations<GameHistory>(STORAGE_KEYS.HISTORY)

/**
 * Load game history
 */
export function loadHistory(): GameHistory[] {
  return historyOps.load()
}

/**
 * Save game history
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

// Settings

/**
 * Load last game settings
 */
export function loadLastSettings(): GameSettings | null {
  return loadJSON<GameSettings | null>(STORAGE_KEYS.SETTINGS, null)
}

/**
 * Save last game settings
 */
export function saveLastSettings(settings: GameSettings): void {
  saveJSON(STORAGE_KEYS.SETTINGS, settings)
}

// Stats - Using shared operations

const statsOps = createStatsOperations<GameStats>(STORAGE_KEYS.STATS, {
  points: 0,
  correctAnswers: 0,
  gamesPlayed: 0
})

/**
 * Load game statistics
 */
export function loadGameStats(): GameStats {
  return statsOps.load()
}

/**
 * Save game statistics
 */
export function saveGameStats(stats: GameStats): void {
  statsOps.save(stats)
}

/**
 * Update statistics after a game
 */
export function updateStatistics(points: number, correctAnswers: number): void {
  statsOps.update(points, correctAnswers)
}

// Daily Stats

/**
 * Track daily games and detect first game of the day
 * Used for bonus points
 */
export function incrementDailyGames(): { isFirstGame: boolean; gamesPlayedToday: number } {
  return sharedIncrementDailyGames(STORAGE_KEYS.DAILY_STATS)
}

// Game Settings (for reload recovery)

/**
 * Save current game settings to session storage for reload recovery
 */
export function saveGameSettings(settings: GameSettings): void {
  gamePersistence.saveSettings(settings)
}

/**
 * Load game settings from session storage
 */
export function loadGameSettings(): GameSettings | null {
  return gamePersistence.loadSettings()
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
  gamePersistence.clearAll()
}

// Reset All

/**
 * Reset all stored data (cards, history, settings, stats, daily stats)
 */
export function resetAll(): void {
  localStorage.removeItem(STORAGE_KEYS.CARDS)
  localStorage.removeItem(STORAGE_KEYS.HISTORY)
  localStorage.removeItem(STORAGE_KEYS.SETTINGS)
  localStorage.removeItem(STORAGE_KEYS.STATS)
  localStorage.removeItem(STORAGE_KEYS.DAILY_STATS)
  gamePersistence.clearAll()
}

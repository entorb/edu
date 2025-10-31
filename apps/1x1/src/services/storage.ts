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
 */
export function updateStatistics(points: number, correctAnswers: number): void {
  statsOps.update(points, correctAnswers)
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

// Extended Features (1x2, 1x12, 1x20)

interface ExtendedFeaturesState {
  feature1x2: boolean
  feature1x12: boolean
  feature1x20: boolean
}

/**
 * Load extended features state by checking for indicator cards
 * - If card 2x3 exists → feature1x2 is active
 * - If card 11x12 exists → feature1x12 is active
 * - If card 18x19 exists → feature1x20 is active
 */
export function loadExtendedFeatures(): ExtendedFeaturesState {
  const cards = loadCards()
  return {
    feature1x2: cards.some(c => c.question === '2x3'),
    feature1x12: cards.some(c => c.question === '11x12'),
    feature1x20: cards.some(c => c.question === '18x19')
  }
}

/**
 * Generate cards for 1x2 feature (2×3 to 2×20)
 */
function generateFeature1x2Cards(existingCards: Card[], features: ExtendedFeaturesState): Card[] {
  const newCards: Card[] = []
  const x = 2
  const yValues = [2, 3, 4, 5, 6, 7, 8, 9]

  if (features.feature1x12) {
    yValues.push(11, 12)
  }

  if (features.feature1x20) {
    for (let i = 13; i <= 20; i++) {
      yValues.push(i)
    }
  }

  for (const y of yValues) {
    const question = `${Math.min(x, y)}x${Math.max(x, y)}`
    if (!existingCards.some(c => c.question === question)) {
      newCards.push({
        question,
        answer: x * y,
        level: MIN_CARD_LEVEL,
        time: MAX_CARD_TIME
      })
    }
  }

  return newCards
}

/**
 * Generate cards for 1x12 feature (11×11 to 12×12 with cross-products)
 */
function generateFeature1x12Cards(existingCards: Card[], features: ExtendedFeaturesState): Card[] {
  const newCards: Card[] = []
  const xValues = [11, 12]
  const yValues: number[] = []

  if (features.feature1x2) {
    yValues.push(2)
  }
  yValues.push(3, 4, 5, 6, 7, 8, 9, 11, 12)

  for (const x of xValues) {
    for (const y of yValues) {
      const question = `${Math.min(x, y)}x${Math.max(x, y)}`
      if (!existingCards.some(c => c.question === question)) {
        newCards.push({
          question,
          answer: x * y,
          level: MIN_CARD_LEVEL,
          time: MAX_CARD_TIME
        })
      }
    }
  }

  return newCards
}

/**
 * Generate cards for 1x20 feature (13×13 to 20×20 with cross-products)
 */
function generateFeature1x20Cards(existingCards: Card[], features: ExtendedFeaturesState): Card[] {
  const newCards: Card[] = []
  const xValues = Array.from({ length: 8 }, (_, i) => 13 + i)
  const yValues: number[] = []

  if (features.feature1x2) {
    yValues.push(2)
  }
  yValues.push(3, 4, 5, 6, 7, 8, 9, 11, 12)
  for (let i = 13; i <= 20; i++) {
    yValues.push(i)
  }

  for (const x of xValues) {
    for (const y of yValues) {
      if (y <= x) {
        const question = `${Math.min(x, y)}x${Math.max(x, y)}`
        if (!existingCards.some(c => c.question === question)) {
          newCards.push({
            question,
            answer: x * y,
            level: MIN_CARD_LEVEL,
            time: MAX_CARD_TIME
          })
        }
      }
    }
  }

  return newCards
}

/**
 * Add cards for a specific extended feature
 * Generates new cards with level 1 and time 60s
 */
export function addExtendedCards(feature: 'feature1x2' | 'feature1x12' | 'feature1x20'): void {
  const cards = loadCards()
  const features = loadExtendedFeatures()
  let newCards: Card[] = []

  if (feature === 'feature1x2') {
    newCards = generateFeature1x2Cards(cards, features)
  } else if (feature === 'feature1x12') {
    newCards = generateFeature1x12Cards(cards, features)
  } else if (feature === 'feature1x20') {
    newCards = generateFeature1x20Cards(cards, features)
  }

  cards.push(...newCards)
  saveCards(cards)
}

/**
 * Delete cards for a specific extended feature
 */
export function deleteExtendedCards(feature: 'feature1x2' | 'feature1x12' | 'feature1x20'): void {
  let cards = loadCards()

  if (feature === 'feature1x2') {
    // Delete all cards with X or Y == 2
    cards = cards.filter(c => {
      const [y, x] = c.question.split('x').map(Number)
      return x !== 2 && y !== 2
    })
  } else if (feature === 'feature1x12') {
    // Delete all cards with X or Y >= 11 or X or Y == 10 (cleanup for bug)
    // This also deactivates feature1x20 by removing those cards
    cards = cards.filter(c => {
      const [y, x] = c.question.split('x').map(Number)
      return x < 11 && y < 11 && x !== 10 && y !== 10
    })
  } else if (feature === 'feature1x20') {
    // Delete all cards with X or Y >= 13 or X or Y == 10 (cleanup for bug)
    cards = cards.filter(c => {
      const [y, x] = c.question.split('x').map(Number)
      return x < 13 && y < 13 && x !== 10 && y !== 10
    })
  }

  saveCards(cards)
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

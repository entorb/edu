import type { Card, GameHistory, Statistics, GameConfig, GameResult } from '@/types'
import { MIN_CARD_LEVEL, MAX_CARD_TIME, MIN_CARD_TIME, SELECT_OPTIONS } from '@/config/constants'

export const CARDS_KEY = '1x1-cards'
export const HISTORY_KEY = '1x1-history'
export const STATS_KEY = '1x1-stats'
export const GAME_CONFIG_KEY = '1x1-game-config'
export const GAME_RESULT_KEY = '1x1-game-result'
export const DAILY_STATS_KEY = '1x1-daily-stats'

// Expected card count for 3x3 to 9x9 where y <= x
const EXPECTED_CARD_COUNT = 28

interface DailyStats {
  date: string // ISO date string (YYYY-MM-DD)
  gamesPlayed: number
}

export class StorageService {
  // Cards
  static getCards(): Card[] {
    const stored = localStorage.getItem(CARDS_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
    return this.initializeCards()
  }

  static saveCards(cards: Card[]): void {
    localStorage.setItem(CARDS_KEY, JSON.stringify(cards))
  }

  static initializeCards(): Card[] {
    const cards: Card[] = []
    // Generate cards for all multiplication table combinations
    // where y <= x (to avoid duplicates like 3x4 and 4x3)
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
    this.saveCards(cards)
    return cards
  }

  // Verify and fix card data - ensures all expected cards exist
  static verifyAndFixCards(): void {
    const cards = this.getCards()

    if (cards.length !== EXPECTED_CARD_COUNT) {
      // Reinitialize if card count is wrong
      console.warn(
        `Card count mismatch: ${cards.length} !== ${EXPECTED_CARD_COUNT}. Reinitializing...`
      )
      this.initializeCards()
    }
  }

  static updateCard(question: string, updates: Partial<Card>): void {
    const cards = this.getCards()
    const index = cards.findIndex(c => c.question === question)
    if (index !== -1) {
      // Clamp time within allowed range
      if (updates.time !== undefined) {
        updates.time = Math.max(MIN_CARD_TIME, Math.min(MAX_CARD_TIME, updates.time))
      }
      cards[index] = { ...cards[index], ...updates }
      this.saveCards(cards)
    }
  }

  // Game History
  static getHistory(): GameHistory[] {
    const stored = localStorage.getItem(HISTORY_KEY)
    return stored ? JSON.parse(stored) : []
  }

  static addHistory(history: GameHistory): void {
    const allHistory = this.getHistory()
    allHistory.push(history)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(allHistory))
  }

  // Statistics
  static getStatistics(): Statistics {
    const stored = localStorage.getItem(STATS_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
    return {
      gamesPlayed: 0,
      totalPoints: 0,
      totalCorrectAnswers: 0
    }
  }

  static updateStatistics(points: number, correctAnswers: number): void {
    const stats = this.getStatistics()
    stats.gamesPlayed++
    stats.totalPoints += points
    stats.totalCorrectAnswers += correctAnswers
    localStorage.setItem(STATS_KEY, JSON.stringify(stats))
  }

  // Game Configuration (Session Storage)
  static setGameConfig(config: GameConfig): void {
    sessionStorage.setItem(GAME_CONFIG_KEY, JSON.stringify(config))
  }

  static getGameConfig(): GameConfig | null {
    const stored = sessionStorage.getItem(GAME_CONFIG_KEY)
    return stored ? JSON.parse(stored) : null
  }

  static clearGameConfig(): void {
    sessionStorage.removeItem(GAME_CONFIG_KEY)
  }

  // Game Result (Session Storage)
  static setGameResult(result: GameResult): void {
    sessionStorage.setItem(GAME_RESULT_KEY, JSON.stringify(result))
  }

  static getGameResult(): GameResult | null {
    const stored = sessionStorage.getItem(GAME_RESULT_KEY)
    return stored ? JSON.parse(stored) : null
  }

  static clearGameResult(): void {
    sessionStorage.removeItem(GAME_RESULT_KEY)
  }

  // Reset all cards to default level and time
  static resetCards(): void {
    const cards = this.getCards()
    cards.forEach(card => {
      card.level = MIN_CARD_LEVEL
      card.time = MAX_CARD_TIME
    })
    this.saveCards(cards)
  }

  // Daily Stats
  static getDailyStats(): DailyStats {
    const stored = localStorage.getItem(DAILY_STATS_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
    const today = new Date().toISOString().split('T')[0]
    return {
      date: today,
      gamesPlayed: 0
    }
  }

  static incrementDailyGames(): { isFirstGame: boolean; gamesPlayedToday: number } {
    const stats = this.getDailyStats()
    const today = new Date().toISOString().split('T')[0]

    if (stats.date !== today) {
      // New day, reset counter
      const newStats: DailyStats = {
        date: today,
        gamesPlayed: 1
      }
      localStorage.setItem(DAILY_STATS_KEY, JSON.stringify(newStats))
      return { isFirstGame: true, gamesPlayedToday: 1 }
    } else {
      // Same day, increment counter
      stats.gamesPlayed++
      localStorage.setItem(DAILY_STATS_KEY, JSON.stringify(stats))
      return { isFirstGame: false, gamesPlayedToday: stats.gamesPlayed }
    }
  }

  // Reset all data
  static resetAll(): void {
    localStorage.removeItem(CARDS_KEY)
    localStorage.removeItem(HISTORY_KEY)
    localStorage.removeItem(STATS_KEY)
    localStorage.removeItem(DAILY_STATS_KEY)
    sessionStorage.removeItem(GAME_CONFIG_KEY)
    sessionStorage.removeItem(GAME_RESULT_KEY)
  }
}

/**
 * Shared Storage Utilities
 * Common patterns used by both 1x1 and wordplay apps
 */

import type { DailyStats } from '../types'

/**
 * Get today's date in ISO format (YYYY-MM-DD)
 */
export function getTodayISODate(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Check if a stored date is different from today
 */
export function isDifferentDay(storedDate: string): boolean {
  return storedDate !== getTodayISODate()
}

/**
 * Generic localStorage loader with JSON parsing and fallback
 * @param key - Storage key
 * @param fallback - Value to return if storage is empty or parsing fails
 * @returns Parsed value or fallback
 */
export function loadJSON<T>(key: string, fallback: T): T {
  const stored = localStorage.getItem(key)
  if (!stored) {
    return fallback
  }
  try {
    return JSON.parse(stored) as T
  } catch {
    return fallback
  }
}

/**
 * Generic localStorage saver with JSON serialization
 * @param key - Storage key
 * @param data - Data to save
 */
export function saveJSON<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data))
}

/**
 * Track daily game count and detect first game of the day
 * @param key - Storage key for daily stats
 * @returns Object with isFirstGame flag and total games played today
 */
export function incrementDailyGames(key: string): {
  isFirstGame: boolean
  gamesPlayedToday: number
} {
  const today = getTodayISODate()
  const fallback: DailyStats = { date: today, gamesPlayed: 0 }

  const dailyStats = loadJSON<DailyStats>(key, fallback)

  // Reset if it's a new day
  if (isDifferentDay(dailyStats.date)) {
    dailyStats.date = today
    dailyStats.gamesPlayed = 0
  }

  const isFirstGame = dailyStats.gamesPlayed === 0
  dailyStats.gamesPlayed++

  saveJSON(key, dailyStats)

  return {
    isFirstGame,
    gamesPlayedToday: dailyStats.gamesPlayed
  }
}

/**
 * Load all items from localStorage for a given key pattern
 * @param key - Storage key
 * @param fallback - Default value if not found
 * @returns Parsed array or fallback
 */
export function loadArray<T>(key: string, fallback: T[] = []): T[] {
  return loadJSON<T[]>(key, fallback)
}

/**
 * Save array to localStorage
 * @param key - Storage key
 * @param data - Array to save
 */
export function saveArray<T>(key: string, data: T[]): void {
  saveJSON(key, data)
}

/**
 * Create generic history operations for a storage key
 * @param storageKey - The key to use in localStorage
 * @returns Object with load, save, and add methods
 */
export function createHistoryOperations<T>(storageKey: string) {
  return {
    load: () => loadArray<T>(storageKey, []),
    save: (history: T[]) => saveArray(storageKey, history),
    add: (entry: T) => {
      const all = loadArray<T>(storageKey, [])
      all.push(entry)
      saveArray(storageKey, all)
    }
  }
}

/**
 * Create generic statistics operations for a storage key
 * @param storageKey - The key to use in localStorage
 * @param defaultStats - Default statistics object
 * @returns Object with load, save, and update methods
 */
export function createStatsOperations<
  T extends { gamesPlayed: number; points: number; correctAnswers: number }
>(storageKey: string, defaultStats: T) {
  return {
    load: () => loadJSON<T>(storageKey, defaultStats),
    save: (stats: T) => saveJSON(storageKey, stats),
    update: (points: number, correctAnswers: number) => {
      const stats = loadJSON<T>(storageKey, defaultStats)
      stats.gamesPlayed++
      stats.points += points
      stats.correctAnswers += correctAnswers
      saveJSON(storageKey, stats)
      return stats
    }
  }
}

/**
 * Load from sessionStorage with JSON parsing and fallback
 * @param key - Storage key
 * @param fallback - Value to return if storage is empty or parsing fails
 * @returns Parsed value or fallback
 */
export function loadSessionJSON<T>(key: string, fallback: T): T {
  const stored = sessionStorage.getItem(key)
  if (!stored) {
    return fallback
  }
  try {
    return JSON.parse(stored) as T
  } catch {
    return fallback
  }
}

/**
 * Save to sessionStorage with JSON serialization
 * @param key - Storage key
 * @param data - Data to save
 */
export function saveSessionJSON<T>(key: string, data: T): void {
  sessionStorage.setItem(key, JSON.stringify(data))
}

/**
 * Remove item from sessionStorage
 * @param key - Storage key
 */
export function removeSessionJSON(key: string): void {
  sessionStorage.removeItem(key)
}

/**
 * Create game settings and state persistence operations for sessionStorage
 * Handles save/load/clear for both game settings and game state
 *
 * @param settingsKey - Storage key for game settings
 * @param stateKey - Storage key for game state
 * @returns Object with methods to manage game settings and state
 */
export function createGamePersistence<TSettings, TState>(settingsKey: string, stateKey: string) {
  return {
    // Game Settings operations
    saveSettings: (settings: TSettings) => saveSessionJSON(settingsKey, settings),
    loadSettings: (): TSettings | null => {
      const stored = sessionStorage.getItem(settingsKey)
      if (!stored) return null
      try {
        return JSON.parse(stored) as TSettings
      } catch {
        return null
      }
    },
    clearSettings: () => removeSessionJSON(settingsKey),

    // Game State operations
    saveState: (state: TState) => saveSessionJSON(stateKey, state),
    loadState: (): TState | null => {
      const stored = sessionStorage.getItem(stateKey)
      if (!stored) return null
      try {
        return JSON.parse(stored) as TState
      } catch {
        return null
      }
    },
    clearState: () => removeSessionJSON(stateKey),

    // Clear both at once
    clearAll: () => {
      removeSessionJSON(settingsKey)
      removeSessionJSON(stateKey)
    }
  }
}

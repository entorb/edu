import type { Card, GameSettings, GameHistoryEntry, GameStats } from '../types'
import { INITIAL_CARDS, DEFAULT_TIME } from '../config/constants'

const STORAGE_KEYS = {
  CARDS: 'wordplay_cards',
  HISTORY: 'wordplay_history',
  SETTINGS: 'wordplay_last_settings',
  STATS: 'wordplay_stats'
}

// Cards
export function loadCards(): Card[] {
  const stored = localStorage.getItem(STORAGE_KEYS.CARDS)
  if (!stored) {
    return INITIAL_CARDS
  }
  try {
    const cards = JSON.parse(stored) as Array<
      Partial<Card> & { id: number; en: string; de: string; level: number }
    >
    // Migrate old cards to new time structure
    return cards.map(card => {
      // If old format with single 'time' property, split it to both
      if ('time' in card && !('time_blind' in card)) {
        const { time, ...rest } = card
        return {
          ...rest,
          time_blind: time ?? DEFAULT_TIME,
          time_typing: time ?? DEFAULT_TIME
        } as Card
      }
      // If no time properties at all, add defaults
      return {
        ...card,
        time_blind: card.time_blind ?? DEFAULT_TIME,
        time_typing: card.time_typing ?? DEFAULT_TIME
      } as Card
    })
  } catch {
    return INITIAL_CARDS
  }
}

export function saveCards(cards: Card[]): void {
  localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards))
}

// History
export function loadHistory(): GameHistoryEntry[] {
  const stored = localStorage.getItem(STORAGE_KEYS.HISTORY)
  if (!stored) {
    return []
  }
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

export function saveHistory(history: GameHistoryEntry[]): void {
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history))
}

// Settings
export function loadLastSettings(): GameSettings | null {
  const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS)
  if (!stored) {
    return null
  }
  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

export function saveLastSettings(settings: GameSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
}

// Stats
export function loadGameStats(): GameStats {
  const stored = localStorage.getItem(STORAGE_KEYS.STATS)
  if (!stored) {
    return {
      totalScore: 0,
      totalCorrectAnswers: 0,
      totalCardsPlayed: 0,
      totalGamesPlayed: 0
    }
  }
  try {
    return JSON.parse(stored)
  } catch {
    return {
      totalScore: 0,
      totalCorrectAnswers: 0,
      totalCardsPlayed: 0,
      totalGamesPlayed: 0
    }
  }
}

export function saveGameStats(stats: GameStats): void {
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats))
}

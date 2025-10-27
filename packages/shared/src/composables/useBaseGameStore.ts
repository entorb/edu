/**
 * Shared Base Game Store Composable
 * Provides common state management patterns used across both apps
 */

import { ref, watch, type Ref } from 'vue'
import type { BaseCard, BaseGameHistory, GameStats } from '../types'

/**
 * Configuration for creating a base game store
 */
export interface BaseGameStoreConfig<TCard extends BaseCard, THistory extends BaseGameHistory> {
  /** Load all cards from storage */
  loadCards: () => TCard[]
  /** Load game history from storage */
  loadHistory: () => THistory[]
  /** Save game history to storage */
  saveHistory: (history: THistory[]) => void
  /** Load game statistics from storage */
  loadGameStats: () => GameStats
  /** Save game statistics to storage */
  saveGameStats: (stats: GameStats) => void
  /** Optional: Save cards to storage (for apps that modify cards) */
  saveCards?: (cards: TCard[]) => void
}

/**
 * Create a base game store with shared state and patterns
 * Apps can extend this with their specific logic
 */
export function createBaseGameStore<
  TCard extends BaseCard,
  THistory extends BaseGameHistory,
  TSettings
>(config: BaseGameStoreConfig<TCard, THistory>) {
  // Shared state
  const allCards = ref<TCard[]>([]) as Ref<TCard[]>
  const gameCards = ref<TCard[]>([]) as Ref<TCard[]>
  const gameSettings = ref<TSettings | null>(null) as Ref<TSettings | null>
  const currentCardIndex = ref(0)
  const points = ref(0)
  const correctAnswersCount = ref(0)
  const history = ref<THistory[]>([]) as Ref<THistory[]>
  const gameStats = ref<GameStats>({
    gamesPlayed: 0,
    points: 0,
    correctAnswers: 0
  })

  // Initialize state from storage
  let initialized = false

  function initializeStore() {
    if (!initialized) {
      allCards.value = config.loadCards()
      history.value = config.loadHistory()
      gameStats.value = config.loadGameStats()
      initialized = true

      // Watch for changes in allCards and save to storage (if saveCards is provided)
      if (config.saveCards) {
        const saveCardsCallback = config.saveCards
        watch(
          allCards,
          newCards => {
            if (newCards.length > 0) {
              saveCardsCallback(newCards)
            }
          },
          { deep: true }
        )
      }

      // Watch for changes in history and save to storage
      watch(
        history,
        newHistory => {
          if (newHistory.length > 0) {
            config.saveHistory(newHistory)
          }
        },
        { deep: true }
      )

      // Watch for changes in gameStats and save to storage
      watch(
        gameStats,
        newStats => {
          config.saveGameStats(newStats)
        },
        { deep: true }
      )
    }
  }

  /**
   * Reset game state for a new game
   */
  function resetGameState() {
    currentCardIndex.value = 0
    points.value = 0
    correctAnswersCount.value = 0
  }

  /**
   * Move to next card
   * @returns true if game is over, false otherwise
   */
  function nextCard(): boolean {
    currentCardIndex.value++
    return currentCardIndex.value >= gameCards.value.length
  }

  /**
   * Add game to history and update statistics
   * This is the shared pattern across both apps
   */
  function saveGameResults(historyEntry: THistory) {
    // Create a new array to ensure watchers detect the change
    history.value = [...history.value, historyEntry]
    gameStats.value.gamesPlayed++
    gameStats.value.points += points.value
    gameStats.value.correctAnswers += correctAnswersCount.value
  }

  /**
   * Discard current game and reset all game state
   * Called when user abandons game without finishing
   */
  function discardGame() {
    gameCards.value = []
    currentCardIndex.value = 0
    points.value = 0
    correctAnswersCount.value = 0
    gameSettings.value = null as unknown as TSettings
  }

  return {
    // State
    allCards,
    gameCards,
    gameSettings,
    currentCardIndex,
    points,
    correctAnswersCount,
    history,
    gameStats,

    // Actions
    initializeStore,
    resetGameState,
    nextCard,
    saveGameResults,
    discardGame
  }
}

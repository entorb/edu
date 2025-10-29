import { computed, watch } from 'vue'
import type { Card, GameSettings, GameHistory } from '../types'
import { createBaseGameStore, type AnswerResult } from '@flashcards/shared'
import {
  loadCards,
  saveCards,
  loadHistory,
  saveHistory,
  saveLastSettings,
  loadGameStats,
  saveGameStats,
  saveGameState as storageSaveGameState,
  loadGameState as storageLoadGameState,
  clearGameState as storageClearGameState,
  saveGameSettings as storageSaveGameSettings,
  loadGameSettings as storageLoadGameSettings
} from '../services/storage'
import { selectCardsForRound } from '../services/cardSelector'
import { MAX_LEVEL, MIN_LEVEL, MIN_TIME, MAX_TIME, INITIAL_CARDS } from '../config/constants'

// Create base store with shared state and logic
const baseStore = createBaseGameStore<Card, GameHistory, GameSettings>({
  loadCards,
  loadHistory,
  saveHistory,
  loadGameStats,
  saveGameStats,
  saveCards
})

export function useGameStore() {
  // Initialize store on first use
  baseStore.initializeStore()

  // Restore game state and settings if page was reloaded during a game
  const savedGameState = storageLoadGameState()
  const savedGameSettings = storageLoadGameSettings()

  if (savedGameState && savedGameSettings) {
    // Restore game settings
    baseStore.gameSettings.value = savedGameSettings
    // Restore game state
    baseStore.gameCards.value = savedGameState.gameCards
    baseStore.currentCardIndex.value = savedGameState.currentCardIndex
    baseStore.points.value = savedGameState.points
    baseStore.correctAnswersCount.value = savedGameState.correctAnswersCount
  }

  // Save game state whenever it changes for reload recovery
  const saveGameStateDebounced = () => {
    storageSaveGameState({
      gameCards: baseStore.gameCards.value,
      currentCardIndex: baseStore.currentCardIndex.value,
      points: baseStore.points.value,
      correctAnswersCount: baseStore.correctAnswersCount.value
    })
  }

  watch(
    () => [
      baseStore.gameCards.value.length,
      baseStore.currentCardIndex.value,
      baseStore.points.value,
      baseStore.correctAnswersCount.value
    ],
    saveGameStateDebounced
  )

  // App-specific actions
  function startGame(settings: GameSettings) {
    // Only start a new game if there are no cards in session storage (new game)
    // If cards exist, user reloaded page during game - just resume (return early)
    if (baseStore.gameCards.value.length > 0) {
      return
    }

    saveLastSettings(settings)
    storageSaveGameSettings(settings)
    baseStore.gameSettings.value = settings
    baseStore.gameCards.value = selectCardsForRound(
      baseStore.allCards.value,
      settings.focus,
      settings.mode
    )
    baseStore.resetGameState()
  }

  function handleAnswer(result: AnswerResult, answerTime?: number) {
    const currentCard = baseStore.gameCards.value[baseStore.currentCardIndex.value]
    if (!currentCard || !baseStore.gameSettings.value) return

    let pointsEarned = 0

    if (result === 'correct' || result === 'close') {
      if (result === 'correct') {
        baseStore.correctAnswersCount.value++
      }
      const basePoints = 6 - currentCard.level
      let multiplier = 1

      switch (baseStore.gameSettings.value.mode) {
        case 'blind':
          multiplier = 2
          break
        case 'typing':
          multiplier = 4
          break
        case 'multiple-choice':
        default:
          multiplier = 1
          break
      }

      pointsEarned = basePoints * multiplier

      if (result === 'close') {
        pointsEarned = Math.round(pointsEarned * 0.75)
      }

      if (baseStore.gameSettings.value.language === 'de-en') {
        pointsEarned += 1
      }

      // Time bonus: +5 points if beat previous time (only for correct answers in blind/typing modes)
      if (result === 'correct' && answerTime !== undefined && answerTime < 60) {
        if (baseStore.gameSettings.value.mode === 'blind' && answerTime < currentCard.time_blind) {
          pointsEarned += 5
        } else if (
          baseStore.gameSettings.value.mode === 'typing' &&
          answerTime < currentCard.time_typing
        ) {
          pointsEarned += 5
        }
        // No time bonus for multiple-choice mode
      }
    }

    baseStore.points.value += pointsEarned

    // Update card level and time
    baseStore.allCards.value = baseStore.allCards.value.map(card => {
      if (card.en === currentCard.en) {
        const updates: Partial<Card> = {}

        // Update level
        if (result === 'correct') {
          updates.level = Math.min(MAX_LEVEL, card.level + 1)
        } else if (result === 'incorrect') {
          updates.level = Math.max(MIN_LEVEL, card.level - 1)
        }

        // Update time (only on correct answers for blind/typing modes)
        if (result === 'correct' && answerTime !== undefined) {
          const clampedTime = Math.max(MIN_TIME, Math.min(MAX_TIME, answerTime))

          if (baseStore.gameSettings.value?.mode === 'blind') {
            updates.time_blind = clampedTime
          } else if (baseStore.gameSettings.value?.mode === 'typing') {
            updates.time_typing = clampedTime
          }
          // No time update for multiple-choice mode
        }

        return { ...card, ...updates }
      }
      return card
    })
  }

  function finishGame() {
    if (!baseStore.gameSettings.value) return

    const historyEntry: GameHistory = {
      date: new Date().toISOString(),
      points: baseStore.points.value,
      settings: baseStore.gameSettings.value,
      correctAnswers: baseStore.correctAnswersCount.value
    }

    // Store the history entry in memory for GameOverPage to persist
    baseStore.history.value = [...baseStore.history.value, historyEntry]
    // Update game stats in memory for GameOverPage to persist
    baseStore.gameStats.value.gamesPlayed++
    baseStore.gameStats.value.points += baseStore.points.value
    baseStore.gameStats.value.correctAnswers += baseStore.correctAnswersCount.value

    // Clear game state after finishing
    storageClearGameState()
  }

  function resetCards() {
    baseStore.allCards.value = INITIAL_CARDS
    // Explicitly save to ensure cards are persisted immediately
    saveCards(INITIAL_CARDS)
  }

  function importCards(newCards: Card[]) {
    baseStore.allCards.value = newCards
    // Explicitly save to ensure cards are persisted immediately
    saveCards(newCards)
  }

  function moveAllCards(level: number) {
    if (level < MIN_LEVEL || level > MAX_LEVEL) return
    baseStore.allCards.value = baseStore.allCards.value.map(card => ({ ...card, level }))
  }

  function discardGame() {
    // Clear game state from sessionStorage when user abandons the game
    storageClearGameState()
    // Reset game state in memory (delegated to base store)
    baseStore.discardGame()
  }

  // Computed
  const currentCard = computed(() => {
    return baseStore.gameCards.value[baseStore.currentCardIndex.value] || null
  })

  const isFoxHappy = computed(() => {
    return baseStore.points.value > baseStore.gameCards.value.length * 5
  })

  return {
    // State (from base store)
    allCards: baseStore.allCards,
    gameCards: baseStore.gameCards,
    gameSettings: baseStore.gameSettings,
    currentCardIndex: baseStore.currentCardIndex,
    points: baseStore.points,
    correctAnswersCount: baseStore.correctAnswersCount,
    history: baseStore.history,
    gameStats: baseStore.gameStats,
    currentCard,
    isFoxHappy,

    // Actions
    startGame,
    handleAnswer,
    nextCard: baseStore.nextCard,
    finishGame,
    discardGame,
    resetCards,
    importCards,
    moveAllCards
  }
}

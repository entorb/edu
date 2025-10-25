import { ref, computed, watch } from 'vue'
import type {
  Card,
  GameSettings,
  GameHistoryEntry,
  GameStats,
  CardUpdate,
  AnswerResult
} from '../types'
import {
  loadCards,
  saveCards,
  loadHistory,
  saveHistory,
  saveLastSettings,
  loadGameStats,
  saveGameStats
} from '../services/storage'
import { selectCardsForRound } from '../services/cardSelector'
import { MAX_LEVEL, MIN_LEVEL, MIN_TIME, MAX_TIME, INITIAL_CARDS } from '../config/constants'

// Global state (singleton pattern)
const allCards = ref<Card[]>([])
const roundCards = ref<Card[]>([])
const gameSettings = ref<GameSettings | null>(null)
const currentCardIndex = ref(0)
const score = ref(0)
const correctAnswersCount = ref(0)
const history = ref<GameHistoryEntry[]>([])
const gameStats = ref<GameStats>({
  totalScore: 0,
  totalCorrectAnswers: 0,
  totalCardsPlayed: 0,
  totalGamesPlayed: 0
})
const lastRoundUpdates = ref<CardUpdate[]>([])

// Initialize state from localStorage
let initialized = false

export function useGameStore() {
  if (!initialized) {
    allCards.value = loadCards()
    history.value = loadHistory()
    gameStats.value = loadGameStats()
    initialized = true

    // Watch for changes and save to localStorage
    watch(
      allCards,
      newCards => {
        if (newCards.length > 0) {
          saveCards(newCards)
        }
      },
      { deep: true }
    )

    watch(
      history,
      newHistory => {
        if (newHistory.length > 0) {
          saveHistory(newHistory)
        }
      },
      { deep: true }
    )
  }

  // Actions
  function startGame(settings: GameSettings) {
    saveLastSettings(settings)
    gameSettings.value = settings
    roundCards.value = selectCardsForRound(allCards.value, settings.priority, settings.mode)
    currentCardIndex.value = 0
    score.value = 0
    correctAnswersCount.value = 0
    lastRoundUpdates.value = []
  }

  function handleAnswer(result: AnswerResult, answerTime?: number) {
    const currentCard = roundCards.value[currentCardIndex.value]
    if (!currentCard || !gameSettings.value) return

    const cardUpdate: CardUpdate = { card: currentCard, change: 'same' }

    let pointsEarned = 0

    if (result === 'correct' || result === 'close') {
      correctAnswersCount.value++
      const basePoints = 6 - currentCard.level
      let multiplier = 1

      switch (gameSettings.value.mode) {
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

      if (gameSettings.value.language === 'de-en') {
        pointsEarned += 1
      }

      // Time bonus: +5 points if beat previous time (only for correct answers in blind/typing modes)
      if (result === 'correct' && answerTime !== undefined && answerTime < 60) {
        if (gameSettings.value.mode === 'blind' && answerTime < currentCard.time_blind) {
          pointsEarned += 5
        } else if (gameSettings.value.mode === 'typing' && answerTime < currentCard.time_typing) {
          pointsEarned += 5
        }
        // No time bonus for multiple-choice mode
      }
    }

    score.value += pointsEarned

    if (result === 'correct') {
      if (currentCard.level < MAX_LEVEL) {
        cardUpdate.change = 'up'
      }
    } else if (result === 'incorrect') {
      if (currentCard.level > MIN_LEVEL) {
        cardUpdate.change = 'down'
      }
    }

    lastRoundUpdates.value.push(cardUpdate)

    // Update card level and time
    allCards.value = allCards.value.map(card => {
      if (card.id === currentCard.id) {
        const updates: Partial<Card> = {}

        // Update level
        if (cardUpdate.change !== 'same') {
          updates.level =
            cardUpdate.change === 'up'
              ? Math.min(MAX_LEVEL, card.level + 1)
              : Math.max(MIN_LEVEL, card.level - 1)
        }

        // Update time (only on correct answers for blind/typing modes)
        if (result === 'correct' && answerTime !== undefined) {
          const clampedTime = Math.max(MIN_TIME, Math.min(MAX_TIME, answerTime))

          if (gameSettings.value?.mode === 'blind') {
            updates.time_blind = clampedTime
          } else if (gameSettings.value?.mode === 'typing') {
            updates.time_typing = clampedTime
          }
          // No time update for multiple-choice mode
        }

        return { ...card, ...updates }
      }
      return card
    })
  }

  function nextCard() {
    if (currentCardIndex.value + 1 < roundCards.value.length) {
      currentCardIndex.value++
      return false // Not game over
    } else {
      // Game over
      return true
    }
  }

  function finishGame() {
    if (!gameSettings.value) return

    const newHistoryEntry: GameHistoryEntry = {
      date: new Date().toISOString(),
      score: score.value,
      settings: gameSettings.value,
      correctAnswers: correctAnswersCount.value,
      totalCards: roundCards.value.length
    }
    history.value.push(newHistoryEntry)

    const newGameStats: GameStats = {
      totalScore: gameStats.value.totalScore + score.value,
      totalCorrectAnswers: gameStats.value.totalCorrectAnswers + correctAnswersCount.value,
      totalCardsPlayed: gameStats.value.totalCardsPlayed + roundCards.value.length,
      totalGamesPlayed: (gameStats.value.totalGamesPlayed || 0) + 1
    }
    gameStats.value = newGameStats
    saveGameStats(newGameStats)
  }

  function resetCards() {
    allCards.value = INITIAL_CARDS
  }

  function importCards(newCards: Card[]) {
    allCards.value = newCards
  }

  function moveAllCards(level: number) {
    if (level < MIN_LEVEL || level > MAX_LEVEL) return
    allCards.value = allCards.value.map(card => ({ ...card, level }))
  }

  // Computed
  const currentCard = computed(() => {
    return roundCards.value[currentCardIndex.value] || null
  })

  const isFoxHappy = computed(() => {
    return score.value > roundCards.value.length * 5
  })

  return {
    // State
    allCards,
    roundCards,
    gameSettings,
    currentCardIndex,
    score,
    correctAnswersCount,
    history,
    gameStats,
    lastRoundUpdates,
    currentCard,
    isFoxHappy,

    // Actions
    startGame,
    handleAnswer,
    nextCard,
    finishGame,
    resetCards,
    importCards,
    moveAllCards
  }
}

import type { Card, Priority, GameMode } from '../types'
import { shuffleArray } from '../utils/helpers'
import { ROUND_SIZE } from '../config/constants'

/**
 * Select cards for a game round based on priority strategy
 */
export function selectCardsForRound(allCards: Card[], priority: Priority, mode: GameMode): Card[] {
  if (allCards.length === 0) {
    return []
  }

  // For 'slow' priority, sort by time descending based on mode
  if (priority === 'slow') {
    const sortedByTime = [...allCards].sort((a, b) => {
      let timeA: number
      let timeB: number

      if (mode === 'blind') {
        timeA = a.time_blind
        timeB = b.time_blind
      } else if (mode === 'typing') {
        timeA = a.time_typing
        timeB = b.time_typing
      } else {
        // For multiple-choice, use min of both times (since it doesn't track its own time)
        timeA = Math.min(a.time_blind, a.time_typing)
        timeB = Math.min(b.time_blind, b.time_typing)
      }

      return timeB - timeA
    })
    const cardsToSelect = Math.min(ROUND_SIZE, allCards.length)
    return shuffleArray(sortedByTime.slice(0, cardsToSelect))
  }

  // Calculate weights for each card
  const weightedCards = allCards.map(card => {
    let weight = 1

    if (priority === 'low') {
      // Prioritize lower level cards (weaker)
      // Level 1 = 5x weight, Level 5 = 1x weight
      weight = 6 - card.level
    } else if (priority === 'high') {
      // Prioritize higher level cards (stronger)
      // Level 1 = 1x weight, Level 5 = 5x weight
      weight = card.level
    }

    return { card, weight }
  })

  // Select cards using weighted random selection
  const selectedCards: Card[] = []
  const availableCards = [...weightedCards]

  const cardsToSelect = Math.min(ROUND_SIZE, allCards.length)

  for (let i = 0; i < cardsToSelect; i++) {
    if (availableCards.length === 0) break

    // Random weighted selection
    let random = Math.random() * availableCards.reduce((sum, item) => sum + item.weight, 0)

    let selectedIndex = 0
    for (let j = 0; j < availableCards.length; j++) {
      random -= availableCards[j].weight
      if (random <= 0) {
        selectedIndex = j
        break
      }
    }

    selectedCards.push(availableCards[selectedIndex].card)
    availableCards.splice(selectedIndex, 1)
  }

  // Shuffle the selected cards
  return shuffleArray(selectedCards)
}

import type { Card, GameMode } from '../types'
import { shuffleArray, weightedRandomSelection } from '@flashcards/shared/utils'
import { ROUND_SIZE } from '../constants'
import type { FocusType } from '@flashcards/shared'

/**
 * Select cards for a game round based on focus/priority strategy
 */
export function selectCardsForRound(allCards: Card[], focus: FocusType, mode: GameMode): Card[] {
  if (allCards.length === 0) {
    return []
  }

  // For 'slow' focus, sort by time descending based on mode
  if (focus === 'slow') {
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

    if (focus === 'weak') {
      // Prioritize lower level cards (weaker)
      // Level 1 = 5x weight, Level 5 = 1x weight
      weight = 6 - card.level
    } else if (focus === 'strong') {
      // Prioritize higher level cards (stronger)
      // Level 1 = 1x weight, Level 5 = 5x weight
      weight = card.level
    }

    return { item: card, weight }
  })

  const cardsToSelect = Math.min(ROUND_SIZE, allCards.length)

  // Use shared weighted random selection utility
  const selectedCards = weightedRandomSelection(weightedCards, cardsToSelect)

  // Shuffle the selected cards
  return shuffleArray(selectedCards)
}

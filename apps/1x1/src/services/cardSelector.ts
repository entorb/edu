import type { Card } from '@/types'
import { MAX_CARD_LEVEL } from '@/constants'
import { weightedRandomSelection } from '@flashcards/shared/utils'

import type { FocusType } from '@flashcards/shared'

/**
 * Select cards for a game round based on focus strategy
 */
export function selectCards(cards: Card[], focus: FocusType, count: number): Card[] {
  // Calculate weights for each card based on focus type
  const weightedCards = cards.map(card => {
    let weight: number

    if (focus === 'weak') {
      // Level 1=highest weight, Level 5=lowest weight
      weight = MAX_CARD_LEVEL + 1 - card.level
    } else if (focus === 'strong') {
      // Level 5=highest weight, Level 1=lowest weight
      weight = card.level
    } else {
      // slow: prioritize cards with higher time (slower)
      weight = card.time
    }

    return { item: card, weight }
  })

  // Use shared weighted random selection utility
  return weightedRandomSelection(weightedCards, count)
}

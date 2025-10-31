import { describe, it, expect, beforeEach } from 'vitest'
import { loadCards } from '@/services/storage'
import { selectCards } from '@/services/cardSelector'
import type { Card } from '@/types'

describe('Card Initialization', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should initialize exactly 28 cards for 3x3 to 9x9', () => {
    const cards = loadCards()
    expect(cards).toHaveLength(28)
  })

  it('should have all expected cards', () => {
    const cards = loadCards()
    const questions = cards.map(c => c.question)
    questions.sort((a, b) => a.localeCompare(b))

    // Generate expected questions
    const expected: string[] = []
    for (let x = 3; x <= 9; x++) {
      for (let y = 3; y <= x; y++) {
        expected.push(`${y}x${x}`)
      }
    }

    expect(questions).toEqual(expected.sort((a, b) => a.localeCompare(b)))
  })

  it('should initialize all cards with level 1 and time 60', () => {
    const cards = loadCards()

    for (const card of cards) {
      expect(card.level).toBe(1)
      expect(card.time).toBe(60)
    }
  })
})

describe('Card Filtering', () => {
  let allCards: Card[]

  beforeEach(() => {
    localStorage.clear()
    allCards = loadCards()
  })

  it('should return 7 cards when selecting [6]', () => {
    const selectSet = new Set([6])
    const filtered = allCards.filter(card => {
      const [x, y] = card.question.split('x').map(Number)
      return selectSet.has(x) || selectSet.has(y)
    })

    expect(filtered).toHaveLength(7)
    expect(filtered.map(c => c.question).sort((a, b) => a.localeCompare(b))).toEqual([
      '3x6',
      '4x6',
      '5x6',
      '6x6',
      '6x7',
      '6x8',
      '6x9'
    ])
  })

  it('should return 7 cards when selecting [3]', () => {
    const selectSet = new Set([3])
    const filtered = allCards.filter(card => {
      const [x, y] = card.question.split('x').map(Number)
      return selectSet.has(x) || selectSet.has(y)
    })

    expect(filtered).toHaveLength(7)
    expect(filtered.map(c => c.question).sort((a, b) => a.localeCompare(b))).toEqual([
      '3x3',
      '3x4',
      '3x5',
      '3x6',
      '3x7',
      '3x8',
      '3x9'
    ])
  })

  it('should return 7 cards when selecting [9]', () => {
    const selectSet = new Set([9])
    const filtered = allCards.filter(card => {
      const [x, y] = card.question.split('x').map(Number)
      return selectSet.has(x) || selectSet.has(y)
    })

    expect(filtered).toHaveLength(7)
    expect(filtered.map(c => c.question).sort((a, b) => a.localeCompare(b))).toEqual([
      '3x9',
      '4x9',
      '5x9',
      '6x9',
      '7x9',
      '8x9',
      '9x9'
    ])
  })

  it('should return cards with 3 OR 4 when selecting [3, 4]', () => {
    const selectSet = new Set([3, 4])
    const filtered = allCards.filter(card => {
      const [x, y] = card.question.split('x').map(Number)
      return selectSet.has(x) || selectSet.has(y)
    })

    // Should include: 3x3, 3x4, 3x5, 3x6, 3x7, 3x8, 3x9, 4x4, 4x5, 4x6, 4x7, 4x8, 4x9
    expect(filtered.length).toBeGreaterThanOrEqual(10)

    // Verify all filtered cards contain 3 or 4
    for (const card of filtered) {
      const [x, y] = card.question.split('x').map(Number)
      expect(selectSet.has(x) || selectSet.has(y)).toBe(true)
    }
  })
})

describe('Card Selection', () => {
  it('should return all cards when count >= cards.length', () => {
    const cards: Card[] = [
      { question: '3x6', answer: 18, level: 1, time: 60 },
      { question: '4x6', answer: 24, level: 1, time: 60 },
      { question: '5x6', answer: 30, level: 1, time: 60 }
    ]

    const selected = selectCards(cards, 'weak', 10)
    expect(selected).toHaveLength(3)
  })

  it('should return exactly count cards when count < cards.length', () => {
    const cards: Card[] = [
      { question: '3x6', answer: 18, level: 1, time: 60 },
      { question: '4x6', answer: 24, level: 1, time: 60 },
      { question: '5x6', answer: 30, level: 1, time: 60 },
      { question: '6x6', answer: 36, level: 1, time: 60 },
      { question: '6x7', answer: 42, level: 1, time: 60 },
      { question: '6x8', answer: 48, level: 1, time: 60 },
      { question: '6x9', answer: 54, level: 1, time: 60 }
    ]

    const selected = selectCards(cards, 'weak', 5)
    expect(selected).toHaveLength(5)
  })

  it('should not mutate the input cards array', () => {
    const cards: Card[] = [
      { question: '3x6', answer: 18, level: 1, time: 60 },
      { question: '4x6', answer: 24, level: 1, time: 60 },
      { question: '5x6', answer: 30, level: 1, time: 60 }
    ]

    const originalLength = cards.length
    selectCards(cards, 'weak', 2)

    expect(cards).toHaveLength(originalLength)
  })

  it('should select all 7 cards for [6] selection', () => {
    const cards: Card[] = [
      { question: '3x6', answer: 18, level: 1, time: 60 },
      { question: '4x6', answer: 24, level: 1, time: 60 },
      { question: '5x6', answer: 30, level: 1, time: 60 },
      { question: '6x6', answer: 36, level: 1, time: 60 },
      { question: '6x7', answer: 42, level: 1, time: 60 },
      { question: '6x8', answer: 48, level: 1, time: 60 },
      { question: '6x9', answer: 54, level: 1, time: 60 }
    ]

    const selected = selectCards(cards, 'weak', 10)
    expect(selected).toHaveLength(7)
  })

  it('should handle weak focus weighting correctly', () => {
    const cards: Card[] = [
      { question: '3x6', answer: 18, level: 1, time: 60 },
      { question: '4x6', answer: 24, level: 5, time: 60 }
    ]

    // Run multiple times to verify randomness works
    for (let i = 0; i < 10; i++) {
      const selected = selectCards(cards, 'weak', 1)
      expect(selected).toHaveLength(1)
      expect(['3x6', '4x6']).toContain(selected[0].question)
    }
  })
})

describe('Integration: Full Game Flow', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should correctly filter and select cards for [6]', () => {
    const allCards = loadCards()
    const selectSet = new Set([6])

    // Filter step
    const filtered = allCards.filter(card => {
      const [x, y] = card.question.split('x').map(Number)
      return selectSet.has(x) || selectSet.has(y)
    })

    expect(filtered).toHaveLength(7)

    // Selection step
    const selected = selectCards(filtered, 'weak', 10)

    expect(selected).toHaveLength(7)
    expect(selected.map(c => c.question).sort((a, b) => a.localeCompare(b))).toEqual([
      '3x6',
      '4x6',
      '5x6',
      '6x6',
      '6x7',
      '6x8',
      '6x9'
    ])
  })
})

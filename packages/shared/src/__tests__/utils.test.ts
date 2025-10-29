import { describe, it, expect } from 'vitest'
import { calculateDailyBonuses } from '../utils/helper'

describe('calculateDailyBonuses', () => {
  const bonusConfig = {
    firstGameBonus: 5,
    streakGameBonus: 5,
    streakGameInterval: 5
  }

  it('should return first game bonus for first game of the day', () => {
    const dailyInfo = { isFirstGame: true, gamesPlayedToday: 1 }
    const bonuses = calculateDailyBonuses(dailyInfo, bonusConfig)

    expect(bonuses).toHaveLength(1)
    expect(bonuses[0]).toEqual({
      label: 'First game of the day',
      points: 5
    })
  })

  it('should return streak bonus every Nth game', () => {
    const dailyInfo = { isFirstGame: false, gamesPlayedToday: 5 }
    const bonuses = calculateDailyBonuses(dailyInfo, bonusConfig)

    expect(bonuses).toHaveLength(1)
    expect(bonuses[0]).toEqual({
      label: '5. game bonus',
      points: 5
    })
  })

  it('should return both bonuses when first game AND streak game', () => {
    const dailyInfo = { isFirstGame: true, gamesPlayedToday: 5 }
    const bonuses = calculateDailyBonuses(dailyInfo, bonusConfig)

    expect(bonuses).toHaveLength(2)
    expect(bonuses[0]).toEqual({
      label: 'First game of the day',
      points: 5
    })
    expect(bonuses[1]).toEqual({
      label: '5. game bonus',
      points: 5
    })
  })

  it('should return empty array when no bonuses apply', () => {
    const dailyInfo = { isFirstGame: false, gamesPlayedToday: 3 }
    const bonuses = calculateDailyBonuses(dailyInfo, bonusConfig)

    expect(bonuses).toHaveLength(0)
  })
})

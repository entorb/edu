import { describe, it, expect } from 'vitest'
import { shuffleArray } from './cardSelection'

describe('HomePage Utilities', () => {
  describe('shuffleArray', () => {
    it('should return an array of the same length', () => {
      const input = [1, 2, 3, 4, 5]
      const result = shuffleArray(input)
      expect(result).toHaveLength(input.length)
    })

    it('should contain all original elements', () => {
      const input = [1, 2, 3, 4, 5]
      const result = shuffleArray(input)
      const sortedResult = [...result].sort((a, b) => a - b)
      const sortedInput = [...input].sort((a, b) => a - b)
      expect(sortedResult).toEqual(sortedInput)
    })
  })
})

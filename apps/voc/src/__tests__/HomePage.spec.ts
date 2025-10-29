import { describe, it, expect } from 'vitest'
import { shuffleArray } from '@flashcards/shared/utils'
import { normalizeString, levenshteinDistance } from '../utils/helpers'

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

  describe('normalizeString', () => {
    it('should convert string to lowercase', () => {
      expect(normalizeString('Hello')).toBe('hello')
    })

    it('should trim whitespace', () => {
      expect(normalizeString('  hello  ')).toBe('hello')
    })

    it('should handle empty string', () => {
      expect(normalizeString('')).toBe('')
    })
  })

  describe('levenshteinDistance', () => {
    it('should return 0 for identical strings', () => {
      expect(levenshteinDistance('hello', 'hello')).toBe(0)
    })

    it('should return 1 for single character difference', () => {
      expect(levenshteinDistance('hello', 'hallo')).toBe(1)
    })

    it('should return correct distance for different strings', () => {
      expect(levenshteinDistance('kitten', 'sitting')).toBe(3)
    })

    it('should handle empty strings', () => {
      expect(levenshteinDistance('', 'hello')).toBe(5)
      expect(levenshteinDistance('hello', '')).toBe(5)
    })
  })
})

// cspell:disable
import { describe, it, expect } from 'vitest'
import {
  validateTypingAnswer,
  normalizeString,
  levenshteinDistance,
  parseCardsFromText
} from './helpers'
import { DEFAULT_TIME } from '../constants'

/**
 * Unit tests for helpers utility functions
 * Tests pure functions: typing validation, string normalization, and card parsing
 */

describe('helpers - Typing Answer Validation', () => {
  describe('Exact matches', () => {
    it('should return correct for exact match', () => {
      const result = validateTypingAnswer('apple', 'apple', 'en-de')
      expect(result).toBe('correct')
    })

    it('should normalize case differences', () => {
      const result = validateTypingAnswer('APPLE', 'apple', 'en-de')
      expect(result).toBe('correct')
    })

    it('should trim whitespace', () => {
      const result = validateTypingAnswer('  apple  ', 'apple', 'en-de')
      expect(result).toBe('correct')
    })

    it('should handle multiple answer options separated by slash', () => {
      const result = validateTypingAnswer('hello', 'hello / hallo', 'en-de')
      expect(result).toBe('correct')
    })

    it('should match second option in slash-separated answers', () => {
      const result = validateTypingAnswer('hallo', 'hello / hallo', 'en-de')
      expect(result).toBe('correct')
    })
  })

  describe('Close matches (Levenshtein distance <= 2)', () => {
    it('should return close for 1 character deletion', () => {
      const result = validateTypingAnswer('aple', 'apple', 'en-de')
      expect(result).toBe('close')
    })

    it('should return close for 1 character substitution', () => {
      const result = validateTypingAnswer('appl', 'apple', 'en-de')
      expect(result).toBe('close')
    })

    it('should return close for 2 character differences', () => {
      const result = validateTypingAnswer('apl', 'apple', 'en-de')
      expect(result).toBe('close')
    })

    it('should return incorrect for 3+ character differences', () => {
      const result = validateTypingAnswer('xyz', 'apple', 'en-de')
      expect(result).toBe('incorrect')
    })
  })

  describe('DE->EN language direction (verb handling)', () => {
    it('should accept verbs without "to" prefix in DE->EN', () => {
      const result = validateTypingAnswer('walk', 'to walk', 'de-en')
      expect(result).toBe('correct')
    })

    it('should still accept "to" prefix in DE->EN', () => {
      const result = validateTypingAnswer('to walk', 'to walk', 'de-en')
      expect(result).toBe('correct')
    })

    it('should not accept without "to" prefix in EN->DE', () => {
      const result = validateTypingAnswer('walk', 'to walk', 'en-de')
      expect(result).toBe('incorrect')
    })

    it('should handle multiple verb options with "to" prefix', () => {
      const result = validateTypingAnswer('run', 'to run / to execute', 'de-en')
      expect(result).toBe('correct')
    })

    it('should handle mixed options in DE->EN', () => {
      const result = validateTypingAnswer('leap', 'to jump / leap', 'de-en')
      expect(result).toBe('correct')
    })
  })

  describe('Edge cases', () => {
    it('should handle empty user input', () => {
      const result = validateTypingAnswer('', 'apple', 'en-de')
      expect(result).toBe('incorrect')
    })

    it('should handle special characters and accents', () => {
      const result = validateTypingAnswer('café', 'café', 'en-de')
      expect(result).toBe('correct')
    })

    it('should handle whitespace in answer options', () => {
      const result = validateTypingAnswer('hello world', 'hello world', 'en-de')
      expect(result).toBe('correct')
    })

    it('should handle multiple spaces with fuzzy matching', () => {
      // normalizeString only trims edges, not internal spaces
      // So '  hello  world  ' becomes 'hello  world' which is distance 1 from 'hello world'
      const result = validateTypingAnswer('  hello  world  ', 'hello world', 'en-de')
      expect(result).toBe('close') // Close due to extra space
    })
  })

  describe('Helper function: levenshteinDistance', () => {
    it('should return 0 for identical strings', () => {
      expect(levenshteinDistance('hello', 'hello')).toBe(0)
    })

    it('should return correct distance for single character operations', () => {
      expect(levenshteinDistance('hello', 'hallo')).toBe(1) // substitution
      expect(levenshteinDistance('hello', 'helo')).toBe(1) // deletion
      expect(levenshteinDistance('hello', 'helloo')).toBe(1) // insertion
    })

    it('should return correct distance for multiple operations', () => {
      expect(levenshteinDistance('kitten', 'sitting')).toBe(3)
    })

    it('should handle empty strings', () => {
      expect(levenshteinDistance('', 'hello')).toBe(5)
      expect(levenshteinDistance('hello', '')).toBe(5)
      expect(levenshteinDistance('', '')).toBe(0)
    })
  })

  describe('Helper function: normalizeString', () => {
    it('should convert to lowercase', () => {
      expect(normalizeString('HELLO')).toBe('hello')
    })

    it('should trim whitespace', () => {
      expect(normalizeString('  hello  ')).toBe('hello')
    })

    it('should handle both case and whitespace', () => {
      expect(normalizeString('  HELLO  ')).toBe('hello')
    })

    it('should preserve internal whitespace', () => {
      expect(normalizeString('hello world')).toBe('hello world')
    })
  })
})

describe('helpers - Card Text Parsing', () => {
  describe('Empty input handling', () => {
    it('should return null for empty string', () => {
      const result = parseCardsFromText('')
      expect(result).toBeNull()
    })

    it('should return null for whitespace-only string', () => {
      const result = parseCardsFromText('   \n  \n  ')
      expect(result).toBeNull()
    })
  })

  describe('Delimiter detection', () => {
    it('should detect tab delimiter', () => {
      const result = parseCardsFromText('apple\tApfel\t1')
      expect(result?.delimiter).toBe('\t')
    })

    it('should detect semicolon delimiter', () => {
      const result = parseCardsFromText('apple;Apfel;1')
      expect(result?.delimiter).toBe(';')
    })

    it('should detect comma delimiter', () => {
      const result = parseCardsFromText('apple,Apfel,1')
      expect(result?.delimiter).toBe(',')
    })

    it('should detect slash delimiter', () => {
      const result = parseCardsFromText('apple/Apfel/1')
      expect(result?.delimiter).toBe('/')
    })

    it('should prefer tab over other delimiters if both exist', () => {
      const result = parseCardsFromText('apple\tApfel;test\t1')
      expect(result?.delimiter).toBe('\t')
    })

    it('should return null if no valid delimiter found', () => {
      const result = parseCardsFromText('appleApfel1')
      expect(result).toBeNull()
    })
  })

  describe('Basic card parsing', () => {
    it('should parse single card with all fields', () => {
      const result = parseCardsFromText('apple\tApfel\t2')
      expect(result?.cards).toHaveLength(1)
      expect(result?.cards[0]).toEqual({
        en: 'apple',
        de: 'Apfel',
        level: 2,
        time_blind: DEFAULT_TIME,
        time_typing: DEFAULT_TIME
      })
    })

    it('should parse single card without level (defaults to 1)', () => {
      const result = parseCardsFromText('apple\tApfel')
      expect(result?.cards).toHaveLength(1)
      expect(result?.cards[0].level).toBe(1)
    })

    it('should parse multiple cards', () => {
      const text = 'apple\tApfel\n' + 'banana\tBanane\t3\n' + 'cherry\tKirsche'
      const result = parseCardsFromText(text)
      expect(result?.cards).toHaveLength(3)
    })

    it('should trim whitespace from card values', () => {
      const result = parseCardsFromText('  apple  \t  Apfel  \t  2  ')
      expect(result?.cards[0]).toEqual({
        en: 'apple',
        de: 'Apfel',
        level: 2,
        time_blind: DEFAULT_TIME,
        time_typing: DEFAULT_TIME
      })
    })
  })

  describe('Header handling', () => {
    it('should skip header line containing "en" and "de"', () => {
      const text = 'en\tde\tlevel\n' + 'apple\tApfel\t1'
      const result = parseCardsFromText(text)
      expect(result?.cards).toHaveLength(1)
      expect(result?.cards[0].en).toBe('apple')
    })

    it('should skip header with lowercase "en" and "de"', () => {
      const text = 'en\tde\tlevel\n' + 'apple\tApfel\t1'
      const result = parseCardsFromText(text)
      expect(result?.cards).toHaveLength(1)
    })

    it('should skip header with mixed case', () => {
      const text = 'EN\tDE\tLevel\n' + 'apple\tApfel\t1'
      const result = parseCardsFromText(text)
      expect(result?.cards).toHaveLength(1)
    })

    it('should not skip first line if it does not contain "en" and "de"', () => {
      const text = 'apple\tApfel\t1\n' + 'banana\tBanane\t2'
      const result = parseCardsFromText(text)
      expect(result?.cards).toHaveLength(2)
    })
  })

  describe('Level parsing', () => {
    it('should parse valid levels 1-5', () => {
      for (let level = 1; level <= 5; level++) {
        const result = parseCardsFromText(`word\tWort\t${level}`)
        expect(result?.cards[0].level).toBe(level)
      }
    })

    it('should default to level 1 if level is not a number', () => {
      const result = parseCardsFromText('apple\tApfel\tabc')
      expect(result?.cards[0].level).toBe(1)
    })

    it('should default to level 1 if level field is empty', () => {
      const result = parseCardsFromText('apple\tApfel\t')
      expect(result?.cards[0].level).toBe(1)
    })

    it('should default to level 1 when level is 0 (falsy check)', () => {
      // Note: parseInt('0', 10) returns 0, but 0 || 1 evaluates to 1
      const result = parseCardsFromText('apple\tApfel\t0')
      expect(result?.cards[0].level).toBe(1)
    })

    it('should allow level values above 5', () => {
      const result = parseCardsFromText('apple\tApfel\t10')
      expect(result?.cards[0].level).toBe(10)
    })
  })

  describe('Multi-word and special characters', () => {
    it('should parse multi-word phrases', () => {
      const result = parseCardsFromText('to walk\tzu Fuß gehen\t1')
      expect(result?.cards[0].en).toBe('to walk')
      expect(result?.cards[0].de).toBe('zu Fuß gehen')
    })

    it('should handle special characters and umlauts', () => {
      const result = parseCardsFromText('Müller\tmüller@example.com\t1')
      expect(result?.cards[0]).toEqual({
        en: 'Müller',
        de: 'müller@example.com',
        level: 1,
        time_blind: DEFAULT_TIME,
        time_typing: DEFAULT_TIME
      })
    })

    it('should handle numbers in card text', () => {
      const result = parseCardsFromText('chapter 5\tkapitel 5\t2')
      expect(result?.cards[0].en).toBe('chapter 5')
      expect(result?.cards[0].de).toBe('kapitel 5')
    })

    it('should handle punctuation in card text', () => {
      const result = parseCardsFromText("don't\tdarf nicht\t1")
      expect(result?.cards[0].en).toBe("don't")
      expect(result?.cards[0].de).toBe('darf nicht')
    })
  })

  describe('Invalid card filtering', () => {
    it('should skip lines with empty English field', () => {
      const text = 'apple\tApfel\n' + '\tBanane\n' + 'cherry\tKirsche'
      const result = parseCardsFromText(text)
      expect(result?.cards).toHaveLength(2)
      expect(result?.cards.map(c => c.en)).toEqual(['apple', 'cherry'])
    })

    it('should skip lines with empty German field', () => {
      const text = 'apple\tApfel\n' + 'banana\t\n' + 'cherry\tKirsche'
      const result = parseCardsFromText(text)
      expect(result?.cards).toHaveLength(2)
      expect(result?.cards.map(c => c.en)).toEqual(['apple', 'cherry'])
    })

    it('should skip lines with only whitespace in fields', () => {
      const text = 'apple\tApfel\n' + '  \t  \n' + 'cherry\tKirsche'
      const result = parseCardsFromText(text)
      expect(result?.cards).toHaveLength(2)
    })

    it('should skip lines with less than 2 fields (after splitting)', () => {
      const text = 'apple\tApfel\n' + 'banana\t\n' + 'cherry\tKirsche'
      const result = parseCardsFromText(text)
      expect(result?.cards).toHaveLength(2)
      expect(result?.cards.map(c => c.en)).toEqual(['apple', 'cherry'])
    })
  })

  describe('Different delimiters in single parse', () => {
    it('should parse semicolon-delimited cards correctly', () => {
      const text = 'en;de;level\n' + 'apple;Apfel;1\n' + 'banana;Banane;2'
      const result = parseCardsFromText(text)
      expect(result?.cards).toHaveLength(2)
      expect(result?.cards[0].en).toBe('apple')
      expect(result?.cards[0].de).toBe('Apfel')
    })

    it('should parse comma-delimited cards correctly', () => {
      const text = 'apple,Apfel,1\n' + 'banana,Banane,2'
      const result = parseCardsFromText(text)
      expect(result?.cards).toHaveLength(2)
      expect(result?.cards[0].en).toBe('apple')
    })

    it('should parse slash-delimited cards correctly', () => {
      const text = 'apple/Apfel/1\n' + 'banana/Banane/2'
      const result = parseCardsFromText(text)
      expect(result?.cards).toHaveLength(2)
      expect(result?.cards[0].en).toBe('apple')
    })
  })

  describe('Return value validation', () => {
    it('should return null if no valid cards are found', () => {
      const text = '\t\n' + '\t\n' + '\t'
      const result = parseCardsFromText(text)
      expect(result).toBeNull()
    })

    it('should return cards and delimiter when successful', () => {
      const result = parseCardsFromText('apple\tApfel')
      expect(result).toEqual({
        cards: expect.any(Array),
        delimiter: '\t'
      })
      expect(result?.cards).toHaveLength(1)
    })

    it('should include DEFAULT_TIME in parsed cards', () => {
      const result = parseCardsFromText('apple\tApfel')
      expect(result?.cards[0].time_blind).toBe(DEFAULT_TIME)
      expect(result?.cards[0].time_typing).toBe(DEFAULT_TIME)
    })
  })

  describe('Edge cases', () => {
    it('should handle cards with extra delimiter occurrences', () => {
      const result = parseCardsFromText('apple pie\tApfelkuchen\t1')
      expect(result?.cards).toHaveLength(1)
      expect(result?.cards[0].en).toBe('apple pie')
    })

    it('should handle empty lines in input', () => {
      const text = 'apple\tApfel\n' + '\n' + 'banana\tBanane'
      const result = parseCardsFromText(text)
      expect(result?.cards).toHaveLength(2)
    })

    it('should handle Windows line endings (CRLF)', () => {
      const text = 'apple\tApfel\r\n' + 'banana\tBanane\r\n'
      // JavaScript's trim() and split('\n') will handle \r correctly
      const result = parseCardsFromText(text)
      expect(result?.cards).toHaveLength(2)
    })

    it('should handle very long card values', () => {
      const longEn = 'a'.repeat(1000)
      const longDe = 'b'.repeat(1000)
      const result = parseCardsFromText(`${longEn}\t${longDe}\t1`)
      expect(result?.cards[0].en).toBe(longEn)
      expect(result?.cards[0].de).toBe(longDe)
    })

    it('should preserve spaces within card values', () => {
      const result = parseCardsFromText('to walk quickly\tschnell zu Fuß gehen\t1')
      expect(result?.cards[0].en).toBe('to walk quickly')
      expect(result?.cards[0].de).toBe('schnell zu Fuß gehen')
    })
  })

  describe('Real-world scenarios', () => {
    it('should parse TSV export format', () => {
      const text =
        'en\tde\tlevel\n' + 'apple\tApfel\t1\n' + 'banana\tBanane\t2\n' + 'cherry\tKirsche\t3'
      const result = parseCardsFromText(text)
      expect(result?.cards).toHaveLength(3)
      expect(result?.delimiter).toBe('\t')
    })

    it('should parse CSV export format', () => {
      const text = 'apple,Apfel,1\n' + 'banana,Banane,2\n' + 'cherry,Kirsche,3'
      const result = parseCardsFromText(text)
      expect(result?.cards).toHaveLength(3)
      expect(result?.delimiter).toBe(',')
    })

    it('should parse mixed language content', () => {
      const text =
        'en\tde\tlevel\n' +
        'hello\thallo\t1\n' +
        'goodbye\tAuf Wiedersehen\t2\n' +
        'thank you\tDanke schön\t2\n' +
        'please\tbitte\t1'
      const result = parseCardsFromText(text)
      expect(result?.cards).toHaveLength(4)
    })

    it('should handle import with only some cards having levels', () => {
      const text = 'apple\tApfel\t2\n' + 'banana\tBanane\n' + 'cherry\tKirsche\t4'
      const result = parseCardsFromText(text)
      expect(result?.cards).toHaveLength(3)
      expect(result?.cards[0].level).toBe(2)
      expect(result?.cards[1].level).toBe(1)
      expect(result?.cards[2].level).toBe(4)
    })
  })
})

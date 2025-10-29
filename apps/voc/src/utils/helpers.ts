import { LEVENSHTEIN_THRESHOLD, DEFAULT_TIME } from '@/constants'
import type { Card } from '../types'

/**
 * Normalize a string for comparison (lowercase, trim)
 */
export function normalizeString(str: string): string {
  return str.toLowerCase().trim()
}

/**
 * Calculate Levenshtein distance between two strings
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length
  const len2 = str2.length
  const matrix: number[][] = []

  if (len1 === 0) return len2
  if (len2 === 0) return len1

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      )
    }
  }

  return matrix[len1][len2]
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Validates a typed answer against the correct answer(s)
 * Supports multiple possible answers separated by '/'
 * Handles language-specific rules (e.g., removing "to " prefix for DE->EN)
 * Returns 'correct', 'close' (typo tolerance), or 'incorrect'
 */
export function validateTypingAnswer(
  userInput: string,
  correctAnswer: string,
  language: 'en-de' | 'de-en'
): 'correct' | 'close' | 'incorrect' {
  const normalizedUserAnswer = normalizeString(userInput)
  const possibleAnswers = correctAnswer.split('/').map(normalizeString)

  // If DE->EN, also accept answers without the leading "to "
  if (language === 'de-en') {
    const answersWithoutTo = possibleAnswers
      .filter(ans => ans.startsWith('to '))
      .map(ans => ans.substring(3))
    possibleAnswers.push(...answersWithoutTo)
  }

  // Check for exact match
  if (possibleAnswers.includes(normalizedUserAnswer)) {
    return 'correct'
  }

  // Check for "close" answers using Levenshtein distance
  if (
    possibleAnswers.some(
      ans => levenshteinDistance(normalizedUserAnswer, ans) <= LEVENSHTEIN_THRESHOLD
    )
  ) {
    return 'close'
  }

  return 'incorrect'
}

/**
 * Parses text input with various delimiters (tab, semicolon, comma, slash)
 * Extracts pure parsing logic for card imports
 *
 * Returns an object with cards array and detected delimiter, or null if invalid
 */
export function parseCardsFromText(text: string): { cards: Card[]; delimiter: string } | null {
  if (!text) {
    return null
  }

  const lines = text.trim().split('\n')
  const firstLine = lines[0]
  let delimiter = '\t'
  if (firstLine.includes('\t')) delimiter = '\t'
  else if (firstLine.includes(';')) delimiter = ';'
  else if (firstLine.includes(',')) delimiter = ','
  else if (firstLine.includes('/')) delimiter = '/'
  else {
    return null // No valid delimiter found
  }

  const newCards: Card[] = []
  for (const [index, line] of lines.entries()) {
    if (index === 0 && line.toLowerCase().includes('en') && line.toLowerCase().includes('de')) {
      continue // Skip header
    }

    const parts = line.split(delimiter)
    if (parts.length >= 2 && parts[0].trim() && parts[1].trim()) {
      newCards.push({
        en: parts[0].trim(),
        de: parts[1].trim(),
        level: Number.parseInt(parts[2], 10) || 1,
        time_blind: DEFAULT_TIME,
        time_typing: DEFAULT_TIME
      })
    }
  }

  return newCards.length > 0 ? { cards: newCards, delimiter } : null
}

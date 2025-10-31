import { describe, it, expect } from 'vitest'
import type { SelectionType } from '@/types'

/**
 * Logic for formatting the display question based on selection.
 * This mirrors the displayQuestion computed property in FlashCard.vue
 */
function formatDisplayQuestion(cardQuestion: string, selection: SelectionType | undefined): string {
  // Check if a single number is selected (array with one element, not x² and not multiple numbers)
  const isSingleNumberSelected = selection && Array.isArray(selection) && selection.length === 1

  if (isSingleNumberSelected) {
    const selectedNum = selection[0]
    const [x, y] = cardQuestion.split('x').map(Number)

    // If the selected number matches one of the operands, rearrange so it's last
    if (selectedNum === x || selectedNum === y) {
      const other = selectedNum === x ? y : x
      return `${other}\u00d7${selectedNum}`
    }
  }

  // Default: replace 'x' with multiplication sign
  return cardQuestion.replace('x', '\u00d7')
}

describe('FlashCard - displayQuestion logic', () => {
  it('should reorder question when single number [3] is selected and matches first operand', () => {
    const question = '3x16'
    const selection: SelectionType = [3]

    const result = formatDisplayQuestion(question, selection)
    expect(result).toBe('16×3')
  })

  it('should reorder question when single number [3] is selected and matches second operand', () => {
    const question = '5x3'
    const selection: SelectionType = [3]

    const result = formatDisplayQuestion(question, selection)
    expect(result).toBe('5×3')
  })

  it('should not reorder when single number [3] is selected but does not match', () => {
    const question = '5x8'
    const selection: SelectionType = [3]

    const result = formatDisplayQuestion(question, selection)
    expect(result).toBe('5×8')
  })

  it('should use default format when multiple numbers are selected', () => {
    const question = '3x16'
    const selection: SelectionType = [3, 4, 5]

    const result = formatDisplayQuestion(question, selection)
    expect(result).toBe('3×16')
  })

  it('should use default format when x² is selected', () => {
    const question = '3x16'
    const selection: SelectionType = 'x²'

    const result = formatDisplayQuestion(question, selection)
    expect(result).toBe('3×16')
  })

  it('should use default format when selection is undefined', () => {
    const question = '3x16'
    const selection: SelectionType | undefined = undefined

    const result = formatDisplayQuestion(question, selection)
    expect(result).toBe('3×16')
  })
})

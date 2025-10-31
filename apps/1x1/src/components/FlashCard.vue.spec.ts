import { describe, it, expect } from 'vitest'
import type { SelectionType } from '@/types'
import { formatDisplayQuestion } from '@/utils/questionFormatter'

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

import type { SelectionType } from '@/types'

/**
 * Formats the display question based on selection.
 * When a single number is selected, it ensures that number appears as the second operand.
 *
 * @param cardQuestion - The card question (e.g., "3x16")
 * @param selection - The user's selection (number array, 'x²', or undefined)
 * @returns Formatted question with multiplication sign (e.g., "16×3")
 */
export function formatDisplayQuestion(
  cardQuestion: string,
  selection: SelectionType | undefined
): string {
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

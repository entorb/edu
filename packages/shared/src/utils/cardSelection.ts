/**
 * Perform weighted random selection from items
 * Generic utility that can be used by any app needing weighted selection
 *
 * @param items - Array of items with their weights
 * @param count - Number of items to select
 * @returns Selected items (without weights)
 *
 * @example
 * const items = [
 *   { item: { name: 'A' }, weight: 5 },
 *   { item: { name: 'B' }, weight: 2 },
 *   { item: { name: 'C' }, weight: 1 }
 * ]
 * const selected = weightedRandomSelection(items, 2)
 * // Returns 2 items, with 'A' more likely to be selected
 */
export function weightedRandomSelection<T>(
  items: Array<{ item: T; weight: number }>,
  count: number
): T[] {
  const availableItems = [...items]
  const selected: T[] = []
  const loopCount = Math.min(count, availableItems.length)

  for (let i = 0; i < loopCount; i++) {
    if (availableItems.length === 0) break

    const totalWeight = availableItems.reduce((sum, item) => sum + item.weight, 0)
    let random = Math.random() * totalWeight
    let selectedIndex = 0

    for (let j = 0; j < availableItems.length; j++) {
      random -= availableItems[j].weight
      if (random <= 0) {
        selectedIndex = j
        break
      }
    }

    selected.push(availableItems[selectedIndex].item)
    availableItems.splice(selectedIndex, 1)
  }

  return selected
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 * Returns a new array without mutating the original
 *
 * @param array - Array to shuffle
 * @returns New shuffled array
 *
 * @example
 * const numbers = [1, 2, 3, 4, 5]
 * const shuffled = shuffleArray(numbers)
 * // Returns shuffled array, e.g., [3, 1, 5, 2, 4]
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

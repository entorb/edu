// Main entry point for @flashcards/shared package
export * from './utils/helper.js'
export { TEXT_DE } from './text-de.js'
export * from './types.js'
export * from './constants.js'
export * from './services/storage.js'
export * from './composables/useBaseGameStore.js'
export * from './composables/useGameTimer.js'
export * from './composables/useAnswerFeedback.js'
export * from './composables/useCountdownTimer.js'
export * from './composables/useResetCards.js'

// Note: AppFooter is exported via package.json exports field at "./components"
// Use: import { AppFooter } from '@flashcards/shared/components'
// Note: HistoryPage is exported via package.json exports field at "./pages"
// Use: import { HistoryPage } from '@flashcards/shared/pages'

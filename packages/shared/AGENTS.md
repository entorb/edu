# CLAUDE.md - Shared Package

## Project Overview

The shared package (`@flashcards/shared`) provides common types, utilities, components, and services used across all apps in the monorepo (1x1 and voc). It eliminates code duplication and ensures consistency across applications.

**Responsibilities:**

- Centralized type definitions for game data
- Shared text strings (German i18n)
- Common storage operations and patterns
- Reusable UI components
- Base game store logic for state management
- Shared utility functions

**Design Philosophy:** Single source of truth for common logic; apps extend with specific implementations.

### Key Technologies

- **Framework:** Vue.js 3 (for components)
- **Language:** TypeScript
- **Package Manager:** pnpm (workspace)
- **Build Tool:** Vite 6.x
- **Testing:** Vitest

## Architecture

### Directory Structure

```text
src/
├── components/
│   ├── AppFooter.vue           # Shared footer component
│   └── AnswerFeedback.vue      # Game feedback display component
├── composables/
│   ├── useBaseGameStore.ts     # Base game state factory
│   └── useGameTimer.ts         # Shared timer logic
├── pages/
│   ├── HistoryPage.vue         # Shared game history display
│   └── CardsPage.vue           # Shared statistics display
├── services/
│   └── storage.ts              # Shared localStorage operations
├── utils/
│   ├── helper.ts               # Helper functions
│   └── index.ts                # Export helpers
├── types.ts                    # Shared type definitions
├── text-de.ts                  # German text strings (i18n)
└── index.ts                    # Main export entry point
```

Vitest unit tests are placed next to the files they test and use the `.spec.ts` suffix: e.g. `CardsPage.vue` and `CardsPage.spec.ts`. DO NOT copy functions from the source file to the test file, import them!

### Most Important Files

#### `src/types.ts` (Shared Type Definitions)

**Defines contracts all apps must follow:**

```typescript
interface BaseGameHistory {
  date: string // ISO date string
  points: number // Points earned
  correctAnswers: number // Count of correct answers
}

interface BaseCard {
  level: number // 1-5 adaptive difficulty
}

interface GameStats {
  gamesPlayed: number // Lifetime games
  points: number // Lifetime points
  correctAnswers: number // Lifetime correct answers
}

interface GameState<T = BaseCard> {
  cards: T[] // Game cards (typed)
  currentCardIndex: number // Current card position
  points: number // Current game points
  correctAnswers: number // Current game correct count
  startTime: number // Game start timestamp
}

interface GameResult {
  points: number // Final game points
  correctAnswers: number // Final correct count
  totalCards: number // Cards in round
}

interface DailyStats {
  date: string // ISO date (YYYY-MM-DD)
  gamesPlayed: number // Games played today
}

type FocusType = 'weak' | 'strong' | 'slow'
type AnswerResult = 'correct' | 'incorrect' | 'close'
```

**Design note:** Apps extend `BaseCard` and `BaseGameHistory` with app-specific fields:

- 1x1: Card has `question`, `answer`, `time`
- Wordplay: Card has `en`, `de`, `time_blind`, `time_typing`

#### `src/services/storage.ts` (Storage Operations)

**Low-level localStorage utilities:**

```typescript
loadJSON<T>(key: string, fallback: T): T
  // Parse localStorage value with error handling

saveJSON<T>(key: string, data: T): void
  // Serialize to localStorage

loadArray<T>(key: string, fallback?: T[]): T[]
  // Type-safe array loading

saveArray<T>(key: string, data: T[]): void
  // Type-safe array saving
```

**High-level factory functions:**

```typescript
createHistoryOperations<T>(storageKey: string)
  // Returns: { load(), save(), add() }
  // Eliminates duplicate history logic across apps

createStatsOperations<T extends GameStats>(
  storageKey: string,
  defaultStats: T
)
  // Returns: { load(), save(), update() }
  // Eliminates duplicate stats logic across apps
```

**Daily stats tracking:**

```typescript
incrementDailyGames(key: string)
  // Returns: { isFirstGame: boolean, gamesPlayedToday: number }
  // Used for daily bonus tracking
```

**Key features:**

- Automatic fallback on parsing errors
- Type-safe with TypeScript generics
- Configurable storage keys per app
- Reusable patterns for common operations

#### `src/composables/useBaseGameStore.ts` (Game State Management)

**Factory pattern for creating game stores with shared logic:**

```typescript
createBaseGameStore<TCard, THistory, TSettings>(config: {
  loadCards: () => TCard[]
  loadHistory: () => THistory[]
  saveHistory: (history: THistory[]) => void
  loadGameStats: () => GameStats
  saveGameStats: (stats: GameStats) => void
  saveCards?: (cards: TCard[]) => void  // Optional for 1x1
})
```

**Provides:**

- Singleton initialization pattern
- Reactive state with Vue refs:
  - `allCards`, `gameCards`, `gameSettings`
  - `currentCardIndex`, `points`, `correctAnswersCount`
  - `history`, `gameStats`
- Auto-save to localStorage via watchers
- Shared actions:
  - `initializeStore()`: Load from storage once
  - `resetGameState()`: Reset for new game
  - `nextCard()`: Advance to next card
  - `saveGameResults()`: Add game to history and update stats

**Design:** Apps inject storage methods and extend with app-specific logic (card selection, scoring, etc.)

#### `src/composables/useGameTimer.ts` (Timer Logic)

**Shared timer for both game pages:**

```typescript
useGameTimer(trigger: Ref<any>, maxTime?: number)
  // Returns: { elapsedTime, stopTimer, startTimer }
```

**Features:**

- Tracks elapsed time in 0.1s increments
- Auto-resets when trigger ref changes (card change)
- Optional max time cap (prevents overflow)
- Cleanup on unmount
- Used by both 1x1 and voc GamePage

#### `src/components/AnswerFeedback.vue` (Feedback Component)

**Displays answer feedback with status-based styling:**

**Props:**

- `status: 'correct' | 'close' | 'incorrect'`
- `showContinueButton?: boolean`
- `isButtonDisabled?: boolean`
- `buttonDisableCountdown?: number`

**Features:**

- Color-coded backgrounds (green/yellow/red)
- Status icons (checkmark/warning/X)
- Countdown for button disable state
- Named slots for custom content:
  - `#header`: Status text or points display
  - `#details`: Specific answer feedback

**Used by:** Both apps for game feedback

#### `src/components/AppFooter.vue` (Footer Component)

**Shared footer with branding and links:**

- App title display
- Version information
- Optional custom links

**Used by:** Both apps on all pages

#### `src/pages/HistoryPage.vue` (Game History)

**Generic history display table:**

- Sortable by date
- Displays game results (points, correct answers)
- Links to game settings if available
- Responsive design

**Customization:** Apps pass history data via store

#### `src/text-de.ts` (Internationalization)

**Centralized German text strings organized by scope:**

```typescript
TEXT_DE = {
  common: {
    start, continue, check, correct, incorrect, yes, no, wait, ...
  },
  nav: {
    stats, history, cards, ...
  },
  stats: {
    totalPoints, correctAnswers, gamesPlayed, ...
  },
  oneXone: {
    // 1x1 app specific strings
  },
  voc: {
    game: { ... },
    cardManagement: { ... },
    // Wordplay app specific strings
  }
}
```

**Benefits:**

- Single source of truth for user-facing text
- Easy future i18n migration (add language variants)
- Eliminates string duplication across apps
- Consistent terminology

**Usage:**

```typescript
import { TEXT_DE } from '@flashcards/shared'
// Access: TEXT_DE.common.start, TEXT_DE.voc.game.revealAnswer
```

#### `src/utils/helper.ts` (Utilities)

**Common helper functions:**

```typescript
shuffleArray<T>(array: T[]): T[]
  // Fisher-Yates shuffle algorithm

// Other shared utilities may be added
```

**Design:** Keep minimal; app-specific helpers go in app repos

## Storage Key Naming Convention

Apps use prefixed keys to avoid collisions:

```typescript
// 1x1 app
'1x1-cards'
'1x1-history'
'1x1-stats'
'1x1-game-config'
'1x1-game-result'
'1x1-daily-stats'

// Wordplay app
'voc-cards'
'voc-history'
'voc-last-settings'
'voc-stats'
'voc-daily-stats'
```

## Export Patterns

**Main entry point** (`src/index.ts`):

```typescript
export * from './services/storage.js'
export * from './composables/useBaseGameStore.js'
export * from './composables/useGameTimer.js'
export * from './types.js'
export { TEXT_DE } from './text-de.js'
```

**Named exports via package.json:**

```json
{
  "exports": {
    "./components": { "import": "./dist/components.js" },
    "./pages": { "import": "./dist/pages.js" }
  }
}
```

**Usage:**

```typescript
// Main imports
import { createBaseGameStore, useGameTimer, TEXT_DE } from '@flashcards/shared'

// Component imports
import { AppFooter, AnswerFeedback } from '@flashcards/shared/components'

// Page imports
import { HistoryPage } from '@flashcards/shared/pages'
```

## Commands & Workflow

**Test**: `pnpm --filter shared test` or `pnpm run types` (entire monorepo)

**Adding Shared Code**: Add types to `types.ts`, components to `components/`, services to `services/storage.ts`, utilities to `utils/helper.ts`, text to `text-de.ts`, export in `index.ts`

**Updating Shared Code**: Consider impact on both apps, run `pnpm run test` and `pnpm run types`, update CLAUDE.md if interfaces change

**New App Setup**: Extend `BaseCard` and `BaseGameHistory` types, create app-specific `useGameStore.ts` using `createBaseGameStore`, add CLAUDE.md

**Text/State Changes**: Update in `text-de.ts` or `types.ts`, ensure both apps use new definitions, run types

## Design Principles

- **Minimal**: Essentials only; apps implement specifics
- **Type-Safe**: Full TypeScript with strict mode
- **Reusable**: Factory patterns and generics
- **Single Responsibility**: Clear module purposes
- **DRY**: Eliminates app duplication
- **Extensible**: Apps extend with own logic
- **Consistent**: Unified experience across apps

## Important Notes

- The shared package is a workspace package, not published to npm
- Build order: `packages/shared` → `apps/*` (one-way dependency)
- Avoid circular dependencies between shared and apps
- Type definitions are the contract; implementations may vary
- localStorage is scoped per app via key prefixes
- Daily stats are tracked separately per app

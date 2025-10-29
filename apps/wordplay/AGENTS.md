# CLAUDE.md - Wordplay Vocabulary App

## Project Overview

Wordplay is a Vue.js-based Progressive Web App (PWA) for learning vocabulary through spaced repetition and adaptive difficulty. Users can create custom flashcard decks and practice using three game modes with increasing complexity and point rewards.

**Key Features:**

- Custom flashcard creation and management (vocabulary pairs)
- Three game modes: Multiple-choice (1x points), Blind (2x points), Typing (4x points)
- Bidirectional learning: English→German and German→English
- 5-level adaptive difficulty system with spaced repetition
- Language-specific bonuses (DE→EN adds +1 point for complexity)
- Smart card selection with weighted probability based on level and time
- 3-second feedback display with visual icon feedback (correct/close/incorrect)
- Timer tracking with configurable per-mode time limits
- PWA support for offline use and smartphone installation

**Data Storage:**

- **localStorage** (persistent): Custom flashcards, game history, statistics, user preferences
- **sessionStorage** (temporary): Game configuration (mode, language, focus)

### Key Technologies

- **Framework:** Vue.js 3 (Composition API with `<script setup>`)
- **UI:** Quasar Framework
- **Build Tool:** Vite 6.x
- **Language:** TypeScript
- **Routing:** Vue Router
- **Testing:** Vitest (unit tests)
- **Linting/Formatting:** ESLint and Prettier
- **Package Manager:** pnpm

## Architecture

### Directory Structure

```text
src/
├── __tests__/                    # Unit tests
│   ├── setup.ts                 # Vitest setup (mocks localStorage)
│   └── pages/
│       └── HomePage.spec.ts     # Home page component tests
├── components/
│   ├── Flashcard.vue            # Core game card component
│   │                             # Handles MC, Blind, Typing modes
│   ├── CardManagementCard.vue    # Individual card CRUD interface
│   └── LanguagePicker.vue        # EN↔DE language selection
├── pages/
│   ├── HomePage.vue             # Main navigation and statistics
│   ├── GamePage.vue             # Active game interface
│   ├── CardsPage.vue    # Create/edit/delete flashcards
│   ├── GameOverPage.vue         # Game results display
│   ├── HistoryPage.vue          # Game history table
│   └── StatsPage.vue            # Progress visualization
├── services/
│   ├── storage.ts               # localStorage service
│   ├── cardSelector.ts          # Card selection algorithm
│   └── helpers.ts               # String normalization, Levenshtein distance
├── composables/
│   └── useGameStore.ts          # Game state management
├── types/
│   └── index.ts                 # TypeScript type definitions
├── config/
│   └── constants.ts             # Game rules, initial cards, timeouts
├── App.vue                      # Root component
├── main.ts                      # Application entry point
├── router.ts                    # Route definitions
└── quasar-variables.sass        # Quasar theme customization
```

### Most Important Files

#### `src/components/Flashcard.vue` (Core Game Logic)

**Responsibilities:**

- Renders the current flashcard based on game mode (Multiple-choice, Blind, Typing)
- Handles answer submission and validation:
  - **Multiple-choice:** Direct option comparison
  - **Blind:** User confirms if answer was correct
  - **Typing:** Levenshtein distance for typo tolerance
- Shows visual feedback with 3-second display window
- Manages timer and answer time tracking
- Implements language-direction logic (EN→DE vs DE→EN)

**Key computed properties:**

- `question`: Returns question based on language direction
- `correctAnswer`: Returns answer based on language direction
- `displayTime`: Shows mode-specific time limits

**Key methods:**

- `handleTypingSubmit()`: Validates typed answers with fuzzy matching
- `handleMultipleChoiceSubmit()`: Validates multiple-choice selection
- `handleBlindSubmit()`: Validates blind mode self-assessment
- `processAnswer()`: Emits answer event and shows feedback

#### `src/services/cardSelector.ts` (Card Selection Algorithm)

**Weighted random selection based on:**

- Card level (1-5)
- Card response time
- Game mode focus type (weak/strong/slow)
- Language direction (EN→DE vs DE→EN)

**Algorithm:**

1. Filter cards by focus type and language
2. Calculate weight for each card:
   - Weak mode: Prioritize lower-level cards
   - Strong mode: Prioritize higher-level cards
   - Slow mode: Prioritize cards with slower times
3. Select cards using weighted random probability
4. Return fixed count for round (10 cards for multiple-choice, variable for blind/typing)

#### `src/services/storage.ts` (Data Persistence)

**localStorage operations:**

- `loadCards()` / `saveCards()`: Flashcard CRUD
- `loadHistory()` / `addHistory()`: Game history tracking
- `loadGameStats()` / `updateStatistics()`: Overall statistics
- `loadLastSettings()` / `saveLastSettings()`: User preferences

**Key features:**

- Uses shared storage operations from `@flashcards/shared`
- Type-safe with TypeScript generics
- Auto-recovery from corrupted data with fallback to initial cards

#### `src/composables/useGameStore.ts` (State Management)

**Shared game state:**

- `allCards`: All available flashcards
- `roundCards`: Cards selected for current round
- `gameSettings`: Current game mode/language/focus
- `points`: Current game score
- `correctAnswersCount`: Correct answers in current game
- `history`: Game history entries
- `gameStats`: Overall statistics

**Key actions:**

- `startGame()`: Initialize round with card selection
- `handleAnswer()`: Process answer and update card level/time
- `finishGame()`: Save results to history and update statistics
- Card management: `resetCards()`, `importCards()`, `moveAllCards()`

**Extends base game store from @flashcards/shared with app-specific logic:**

- Point calculation with multipliers per mode
- Time-based bonuses for beating previous times
- Language bonus (+1 point for DE→EN direction)
- Level-based weighted selection

#### `src/types/index.ts` (Type Definitions)

```typescript
interface Card extends BaseCard {
  en: string // English word/phrase (unique key)
  de: string // German word/phrase
  time_blind: number // Seconds for blind mode
  time_typing: number // Seconds for typing mode
  level: number // 1-5 (adaptive difficulty)
}

interface GameSettings {
  mode: 'multiple-choice' | 'blind' | 'typing'
  focus: 'weak' | 'strong' | 'slow'
  language: 'en-de' | 'de-en'
}

interface GameHistory extends BaseGameHistory {
  settings: GameSettings
}
```

#### `src/config/constants.ts` (Game Rules and Configuration)

**Key constants:**

- `INITIAL_CARDS`: Default vocabulary deck (80+ pairs)
- `MAX_LEVEL`: 5 (maximum difficulty level)
- `MIN_LEVEL`: 1 (minimum difficulty level)
- `MAX_TIME`: 60 seconds (timer cap)
- `MIN_TIME`: 0.1 seconds (minimum trackable)
- `LEVENSHTEIN_THRESHOLD`: 2 (typo tolerance in typing mode)
- `MODE_MULTIPLIERS`: Points multiplier per game mode

### Modes and Scoring

#### Multiple-Choice Mode (1x points)

- 4 buttons: 1 correct answer + 3 random incorrect
- User selects correct option
- Base points: `6 - card.level`
- No time bonus

#### Blind Mode (2x points)

- Reveals answer face-down
- User confirms if they knew the answer
- Base points: `(6 - card.level) × 2`
- Time bonus: +5 points if beat previous time
- Self-assessment increases learning retention

#### Typing Mode (4x points)

- User types the answer
- Fuzzy matching with Levenshtein distance ≤ 2
- Handles "to" prefix removal for DE→EN verbs
- Base points: `(6 - card.level) × 4`
- Time bonus: +5 points if beat previous time
- Close answers get 75% points with warning feedback

#### Language Bonus

- DE→EN direction: +1 point (accounts for increased difficulty)
- EN→DE direction: No bonus

### Answer Feedback

**Correct answers (3s auto-advance):**

- Green background with checkmark icon
- Continue button enabled immediately
- Auto-advances after 3 seconds
- User can press Enter or click to skip

**Close answers (3s button disable):**

- Yellow/orange background with warning icon
- Shows strikethrough comparison (user input → correct answer)
- Continue button disabled for 3 seconds (prevent accidental clicks)
- Typing mode specific

**Incorrect answers (3s button disable):**

- Red background with X icon
- Multiple-choice/Blind: No answer comparison shown
- Typing mode: Shows strikethrough comparison (user input → correct answer)
- Continue button disabled for 3 seconds

### Card Management

Users can:

1. **Create** new cards: English ↔ German pairs
2. **Edit** existing cards: Modify translations
3. **Delete** cards: Remove from deck
4. **Reset** deck: Revert to initial cards
5. **Import** cards: Upload custom deck (JSON format)
6. **Adjust levels**: Move all cards to specific level

Card data is persisted to localStorage and syncs to game store reactively.

## Game Flow

1. **Home Page**: Display statistics and select game settings
2. **Game Page**: Play round with selected cards and settings
3. **Game Over**: Show results (points, correct answers, accuracy)
4. **Continue**: Auto-return to Home or navigate manually

## State Management Pattern

Uses shared base store from `@flashcards/shared/composables/useBaseGameStore.ts`:

- Initialization on first use
- Auto-save history and stats to localStorage
- Reactive updates with Vue watchers
- Type-safe with TypeScript generics

App-specific logic in `useGameStore.ts`:

- Card selection algorithm
- Answer validation and scoring
- Language direction handling
- Mode-specific point calculation

## Testing

### Unit Tests (`src/pages/HomePage.spec.ts`)

9 tests covering:

- Component rendering and data binding
- Button interactions and navigation
- Statistics display and calculations
- Game settings state management

**Run tests:**

```bash
pnpm run test
```

## Commands

```bash
# Development
pnpm install && pnpm dev:wordplay   # Install and run dev server
pnpm run type-check                 # Type check
pnpm lint && pnpm run format        # Lint and format

# Testing
pnpm test                           # Run tests
pnpm run cy:run:wordplay            # Cypress E2E tests

# Production
pnpm build:wordplay && pnpm preview:wordplay  # Build and preview
```

See root CLAUDE.md for full command documentation.

## Design Highlights

- Custom user-created card decks with CRUD operations
- 3 game modes with different point multipliers: Multiple-choice (1x), Blind (2x), Typing (4x)
- Spaced repetition via adaptive 5-level difficulty system
- Bidirectional language learning: EN↔DE with language-specific bonuses
- Intelligent card selection with weighted probability
- PWA with offline support

## Important Notes

- Card `en` field is the unique identifier for lookups
- Time tracking is mode-specific: `time_blind` vs `time_typing`
- Multiple-choice mode doesn't track time (not 1x1 style)
- Levenshtein distance allows up to 2-character differences in typing mode
- "to " prefix handling is language-specific (EN verbs, DE verbs)
- Points calculation: `basePoints × modeMultiplier ± bonuses`
- Statistics include: games played, total points, correct answers count

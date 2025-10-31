# CLAUDE.md - 1x1 Learning App

## Project Overview

Vue.js PWA for primary school students to practice multiplication tables (3x3 to 9x9, with optional extended ranges 1x2, 1x12, 1x20).

**Key Features:**

- 28 base cards (3x3-9x9) + optional extended ranges (1x2, 1x12, 1x20)
- 5-level adaptive difficulty system
- Three focus modes: weak/strong/slow cards
- Weighted random card selection
- Auto-submit (disabled for 3+ digits when 1x12/1x20 active)
- PWA with offline support

**Stack:** Vue 3 (Composition API), Quasar, TypeScript, Vite 6.x, Vitest, Cypress

**Storage:**

- localStorage: Cards (level, time), history, stats, extended features state
- sessionStorage: Game config, game results

## Architecture

### Directory Structure

```text
src/
├── __tests__/           # Unit tests (gameLogic.test.ts)
├── components/          # GroundhogMascot, FlashCard
├── pages/              # Home, Game, GameOver, History, Cards
├── services/           # storage.ts (persistence), cardSelector.ts
├── types/              # TypeScript definitions
└── constants.ts        # Game configuration
```

### Key Files

**`services/storage.ts`** - Data persistence with extended features support

- Base cards: `loadCards()`, `saveCards()`, `initializeCards()` (28 cards 3x3-9x9, y≤x)
- Extended features: `loadExtendedFeatures()`, `addExtendedCards(feature)`, `deleteExtendedCards(feature)`
- History/Stats: `loadHistory()`, `loadGameStats()`, `updateStatistics()`
- Session: `setGameConfig()`, `getGameConfig()`, `setGameResult()`
- Storage keys: `'1x1-cards'`, `'1x1-history'`, `'1x1-stats'`, `'1x1-extended-features'`

**`services/cardSelector.ts`** - Weighted random selection

- Filters cards by selected tables (OR logic: select=[6] → all cards where x=6 OR y=6)
- Applies focus-based weights (weak: low-level, strong: high-level, slow: high-time)
- Returns up to 10 cards using weighted probability

**`components/FlashCard.vue`** - Game card component

- Auto-submit after 2 digits (disabled when `shouldDisableAutoSubmit` is true for 1x12/1x20)
- Timer with progress bar, answer validation
- Feedback dialog (3s auto-close for correct, 3s disable for wrong)

**`pages/HomePage.vue`** - Game configuration

- Dynamic `selectOptions` computed property based on `extendedFeatures`
- Selection buttons: 2, 3-9, 11-12, 13-20 (based on active features)
- Focus selector: weak/strong/slow

**`pages/CardsPage.vue`** - Progress visualization + feature toggles

- Dynamic grid (expands based on active features)
- "Weitere Karten" section with 3 toggles (1x2, 1x12, 1x20)
- Confirmation dialogs for deactivation
- Cell styling: background=level, text color=time

## Extended Cards Features

### Overview

Three optional features extend multiplication ranges beyond 3x3-9x9:

1. **1x2**: Adds 2×2 through 2×9 (8+ cards)
2. **1x12**: Adds 11×11, 12×12, and cross-products (auto-includes 2×11-12 if 1x2 active)
3. **1x20**: Adds 13×13 through 20×20 and cross-products (auto-enables 1x12)

**Important:** 10× multiplication table is intentionally skipped (no cards with X or Y == 10)

### Card Generation Logic

**feature1x2:**

- Y values: [2, 3-9] + [11-12 if 1x12 active] + [13-20 if 1x20 active]
- Generates: 2×Y for all Y values

**feature1x12:**

- X values: [11, 12]
- Y values: [2 if 1x2 active] + [3-9] + [11-12] (skip 10)
- Generates: Y×X for all combinations where Y ≤ X

**feature1x20:**

- X values: [13-20]
- Y values: [2 if 1x2 active] + [3-9] + [11-12] + [13-20] (skip 10)
- Generates: Y×X for all combinations where Y ≤ X
- Auto-enables 1x12 if not active

### Feature Interactions

**Activation:**

- 1x20 → auto-enables 1x12
- 1x2 after others → adds missing 2× cross-products
- New cards: level=1, time=60s

**Deactivation:**

- 1x12 → auto-deactivates 1x20 (with warning)
- Confirmation dialog required
- All cards deleted (including progress)

### Implementation

**CardsPage.vue:**

- `toggleExtendedFeature()`: Handles activation/deactivation with dialogs
- Dynamic `xValues` and `yValues` computed properties
- Grid style: `:style="{ gridTemplateColumns: \`40px repeat(${xValues.length}, 1fr)\` }"`

**HomePage.vue:**

- `selectOptions` computed property adds 2, 11-12, 13-20 based on active features
- Numeric sort: `.sort((a, b) => a - b)`

**FlashCard.vue:**

- `shouldDisableAutoSubmit` computed property checks `loadExtendedFeatures()`

## Game Logic

### Card Selection Algorithm

1. Filter cards where x OR y matches selected tables
2. Apply focus-based weights (weak: level 1=5x, level 5=1x; strong: inverse; slow: time-based)
3. Weighted random selection (up to 10 cards)

### Scoring System

```typescript
points = min(x, y) + (6 - level) + time_bonus
```

- Base: smaller number (5×8 → 5 points)
- Level bonus: 6 - level (level 3 → +3)
- Time bonus: +5 if beat previous time

**Card updates:**

- Correct: level +1 (max 5), time = actual
- Wrong: level -1 (min 1)

**Daily bonuses:**

- First game: +5 points
- Every 5th game: +5 points

## Testing

**Unit Tests** (`src/services/gameLogic.test.ts`): 13 tests covering card initialization, filtering (OR logic), weighted selection

**E2E Tests** (Cypress): 4 tests (3 navigation + 1 full game flow)

```bash
pnpm test                    # Run unit tests
pnpm run cy:run:1x1         # Run E2E tests
```

## Commands

```bash
pnpm dev:1x1                # Dev server
pnpm build:1x1              # Build
pnpm test                   # Unit tests
pnpm run cy:run:1x1         # E2E tests
pnpm run types              # Type check
```

## Recent Changes

### Extended Cards Features (1x2, 1x12, 1x20)

**Implementation:**

- Added `loadExtendedFeatures()`, `saveExtendedFeatures()`, `addExtendedCards()`, `deleteExtendedCards()` to storage.ts
- UI toggles in CardsPage.vue with confirmation dialogs
- Dynamic selection buttons in HomePage.vue
- Auto-submit disabled in FlashCard.vue for 3-digit answers
- Dynamic grid expansion in CardsPage.vue

**Key Decisions:**

- Skip 10× table (rarely practiced)
- Auto-enable 1x12 when activating 1x20
- Auto-deactivate 1x20 when deactivating 1x12
- Generate missing 2× cards when activating 1x2 after other features
- Increased cell size: 100px (desktop), 70px (mobile)

**Bug Fixes:**

- Fixed card generation to explicitly skip X or Y == 10
- Added cleanup for stray 10× cards

## Quick Reference

**Types:** `Card { question, answer, level: 1-5, time: 0.1-60 }`, `GameConfig { select[], focus }`, `GameResult { points, correctAnswers, totalCards }`

**Core Functions:** `selectCards()` (weighted selection), `updateCard()` (level/time updates), `submitAnswer()` (validation)

**Storage Keys:** `1x1-cards`, `1x1-history`, `1x1-stats`, `1x1-extended-features`, `1x1-game-config`, `1x1-game-result`

**Routes:** `/` (Home), `/game` (Game), `/game-over` (Results), `/history` (History), `/cards` (Progress)

**Base Path:** `/1x1/`

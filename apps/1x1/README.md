# 1x1 Learning App "Vyvit's 1x1"

A progressive web app (PWA) designed to help primary school students master multiplication tables (3x3 to 9x9, with optional extended ranges) through gamification and adaptive learning.

## Features

- **Adaptive Learning**: Cards adjust difficulty based on performance (5 levels)
- **Smart Card Selection**: Focus on weak, strong, or slow cards
- **Extended Card Ranges**: Optionally add 1x2, 1x12, or 1x20 multiplication ranges
- **Progress Tracking**: Detailed statistics and performance history
- **Time-based Scoring**: Faster correct answers earn bonus points
- **PWA Support**: Install as a native app on smartphones
- **Offline Ready**: Works without internet connection
- **Visual Progress**: Color-coded card grid showing level and speed
- **Game Mechanics**:
  - Auto-submit after 2 digits entered (disabled for 3+ digit answers)
  - Auto-close correct answers after 3s (skip with Enter)
  - 3-second safety delay on wrong answers to prevent accidents
  - Visual feedback with color-coded backgrounds

## UI

- German language
- Prefer icons over text, to make it easier

## Card System

The app uses a flashcard-like approach with **28 unique cards** covering multiplication tables from 3x3 to 9x9, with optional extended ranges available.

### Extended Card Ranges

Three optional features can be activated on the CardsPage:

- **1x2**: Adds 2x2 through 2x9 (8 cards)
- **1x12**: Adds 11×11, 12×12, and Y×11, Y×12 for Y ∈ {2-9} (requires 1x2 for 2× cards)
- **1x20**: Adds 13×13 through 20×20, and Y×X for Y ∈ {2-9, 11-12} and X ∈ {13-20} (auto-enables 1x12)

**Important**: The multiplication table 10 (10×X, X×10) is intentionally skipped to maintain focus on the most commonly practiced ranges.

### Card Properties

Each card tracks:

- **Question**: Format `XxY` (e.g., `3x4`)
- **Answer**: Correct result (e.g., `12`)
- **Level**: Difficulty level 1-5 (starts at 1)
  - Increases by 1 on correct answer (max 5)
  - Decreases by 1 on wrong answer (min 1)
- **Time**: Seconds for last correct answer (0.1-60s, default 60)

### Card Generation

Cards are generated for 3x3 to 9x9 where **y ≤ x** to avoid duplicates (3x4 = 4x3):

```python
for x in range(3, 10):
    for y in range(3, x + 1):
        print(f"{y}x{x} = {x*y}")
```

**Total: 28 cards** (3x3-3x9: 7, 4x4-4x9: 6, 5x5-5x9: 5, 6x6-6x9: 4, 7x7-7x9: 3, 8x8-8x9: 2, 9x9: 1)

## Game Mechanics

### Card Selection

1. **Select**: Choose multiplication tables (3-9, x², or combinations)
   - Uses OR logic: selecting `[6]` returns all cards where x=6 OR y=6 (7 cards)
2. **Focus**: Prioritize cards by strategy
   - **LowLevel**: Practice low-level cards (level 1=5x weight, level 5=1x weight)
   - **HighLevel**: Practice high-level cards (level 1=1x weight, level 5=5x weight)
   - **Slow**: Practice cards with highest time
3. **Random Selection**: Pick up to 10 cards using weighted probability

### Scoring System

Points awarded for correct answers:

- **Base points**: Smaller number (e.g., 5x8 → 5 points)
- **Level bonus**: Higher levels give fewer points (level 2 → +4)
- **Time bonus**: Beat previous time (<60s) → +5 points

```text
points = min(x, y) + (6 - level) + time_bonus
```

### Bonus Points

- **First game of the day**: +5 points
- **Every 5th game of the day**: +5 points

## Application Pages

### [HomePage](src/pages/HomePage.vue) (`/`)

- Display overall statistics (games played, total points, correct answers)
- Configure game settings:
  - **Select**: Choose multiplication tables (3-9, x², or multiple)
  - **Focus**: Choose strategy (weak/strong/slow)
- Start game button

### [GamePage](src/pages/GamePage.vue) (`/game`)

- Display current card question
- Auto-submit after 2 digits
- Timer with progress bar (capped at 60s)
- Feedback dialog with color-coded backgrounds
- Track correct/wrong answers and update card levels

### [GameOverPage](src/pages/GameOverPage.vue) (`/game-over`)

- Show total points earned
- Display correct answer count
- List selected multiplication tables
- Apply daily bonus points

### [HistoryPage](src/pages/HistoryPage.vue) (`/history`)

- Table of all completed games
- Shows date, points, correct answers, and selected tables
- Navigate back with Escape key

### [CardsPage](src/pages/CardsPage.vue) (`/cards`)

- Card distribution by level
- Visual grid (dynamically expands based on enabled features)
  - Background color = level
  - Font color = speed (time)
- Extended Cards section with three feature toggles:
  - **1x2**: Enable/disable 2× multiplication table
  - **1x12**: Enable/disable 11× and 12× tables
  - **1x20**: Enable/disable 13× through 20× tables
- Navigate back with Escape key

## Architecture

### Key Services

- **StorageService** (`services/storage.ts`): Handles all data persistence
  - localStorage: Card progress, game history, statistics
  - sessionStorage: Current game config, game results
- **Router** (`router.ts`): Route definitions with base path `/1x1/`

### State Management

Simple service-based approach without Vuex/Pinia (sufficient for this app size).

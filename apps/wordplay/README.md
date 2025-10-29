# Wordplay: Vocabulary Learning App

A progressive web app (PWA) designed to help school students master english vocabulary through gamification and adaptive learning.

## Features

- **Adaptive Learning**: Cards adjust difficulty based on performance (5 levels)
- **Smart Card Selection**: Focus on weak or strong cards
- **Progress Tracking**: Detailed statistics and performance history
- **Mode-based Scoring**: Harder modes earn higher multipliers
- **PWA Support**: Install as a native app on smartphones
- **Offline Ready**: Works without internet connection
- **Visual Progress**: Color-coded card levels
- **Game Mechanics**:
  - Three game modes: Multiple Choice, Blind, Typing
  - Auto-advance after 2s on correct answers
  - 3-second safety delay on wrong/close answers before continuing
  - Visual feedback with color-coded messages
  - Levenshtein distance for "close" answer detection (1 character difference)

## UI

- German language
- Prefer icons over text, to make it easier

## Card System

The app uses a flashcard-like approach.

### Card Properties

Each card tracks:

- **Vocabulary**: Vocabulary in English
- **Translation**: German translation
- **Level**: Difficulty level 1-5 (starts at varies per card)
  - Increases by 1 on correct answer (max 5)
  - Stays same on "close" answer
  - Decreases by 1 on incorrect answer (min 1)
- **Time (mode-specific)**:
  - **time_blind**: Seconds for last correct answer in blind mode (0.1-60s, default 60)
  - **time_typing**: Seconds for last correct answer in typing mode (0.1-60s, default 60)
  - No time tracking for multiple-choice mode
  - Updated only on correct answers in respective modes
  - Used for "slow" card prioritization (mode-specific, multiple-choice uses min of both)
  - Triggers time bonus when beaten in same mode

## Game Mechanics

### Card Selection

1. **Mode**: Choose game mode
   - **Multiple Choice** (x1 multiplier): Select from 4 options
   - **Blind** (x2 multiplier): Reveal answer and self-assess
   - **Typing** (x4 multiplier): Type the exact answer
2. **Focus**: Prioritize cards by strategy
   - **Weak** (low): Practice low-level cards (level 1=5x weight, level 5=1x weight)
   - **Strong** (high): Practice high-level cards (level 1=1x weight, level 5=5x weight)
   - **Slow** (slow): Practice cards with highest time
     - Blind mode: Uses time_blind
     - Typing mode: Uses time_typing
     - Multiple-choice mode: Uses min of time_blind and time_typing
3. **Direction**: EN→DE or DE→EN
4. **Random Selection**: Pick up to 10 cards using weighted probability

### Scoring System

Points are calculated based on multiple factors:

#### Base Points

- **Level 1**: 5 points (hardest - least known)
- **Level 2**: 4 points
- **Level 3**: 3 points
- **Level 4**: 2 points
- **Level 5**: 1 point (easiest - best known)

Formula: `basePoints = 6 - card.level`

#### Mode Multiplier

- **Multiple Choice**: x1 (standard)
- **Blind**: x2 (harder - you must know the answer before revealing)
- **Typing**: x4 (hardest - you must type the exact answer)

#### Answer Types

- **Correct**: Full points (`basePoints * multiplier`)
- **Close** (typing mode only): 75% of points (one character different using Levenshtein distance)
- **Incorrect**: 0 points

#### Language Direction Bonus

- **DE→EN**: +1 bonus point (harder direction)
- **EN→DE**: no bonus

#### Time Bonus

- **Beat previous time**: +5 points
  - Blind mode: If `answerTime < card.time_blind` and `< 60s`
  - Typing mode: If `answerTime < card.time_typing` and `< 60s`
  - No time bonus for multiple-choice mode
- Only awarded for correct answers (not "close" or incorrect)

#### Final Score Formula

```text
if correct:
  points = (6 - level) * modeMultiplier + languageBonus + timeBonus
else if close:
  points = Math.round((6 - level) * modeMultiplier * 0.75) + languageBonus
else:
  points = 0

where:
  timeBonus =
    mode === 'blind' && answerTime < card.time_blind && answerTime < 60 ? 5 :
    mode === 'typing' && answerTime < card.time_typing && answerTime < 60 ? 5 :
    0
```

### Card Level Updates

- **Correct answer**: Level increases by 1 (max level 5)
- **Close answer**: Level stays the same
- **Incorrect answer**: Level decreases by 1 (min level 1)

## Application Pages

### [HomePage](src/pages/HomePage.vue) (`/`)

- Display overall statistics (games played, total points, correct answers)
- Configure game settings:
  - Mode: Multiple Choice / Blind / Typing
  - Focus: Weak / Strong / Slow
  - Direction: EN→DE / DE→EN
- Show level distribution of all cards
- Navigate to card management and history

### [GamePage](src/pages/GamePage.vue) (`/game`)

- Display current card question
- Show level distribution bar
- Display score and card progress (X / 10)
- Timer with progress bar (capped at 60s, color-coded)
- Three game modes:
  - **Multiple Choice**: Select from 4 options
  - **Blind**: Reveal answer and self-assess
  - **Typing**: Type the exact answer
- Feedback with color-coded messages
- Auto-advance after 2s on correct answer
- 3-second safety delay on wrong answers before "Continue" button activates
- Track correct/close/wrong answers and update card levels and times

### [GameOverPage](src/pages/GameOverPage.vue) (`/game-over`)

- Show fox icon (happy if score > roundCards.length \* 5)
- Display final score
- Show cards that leveled up/down
- Button to play again

### [CardsPage](src/pages/CardsPage.vue) (`/cards`)

- Export cards to TSV format (clipboard)
- Import cards from TSV/CSV format
- Move all cards to a specific level
- Reset all cards to initial state (danger zone)
- List all cards with their current levels

### [StatsPage](src/pages/StatsPage.vue) (`/stats`)

- List all cards in the deck
- Show card translations (EN ↔ DE)
- Display current level with color coding

### [HistoryPage](src/pages/HistoryPage.vue) (`/history`)

- Table of all completed games (latest first)
- Shows date, points, correct answers / total
- Displays game settings (mode, focus, direction)

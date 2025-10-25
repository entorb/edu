export type FocusType = 'weak' | 'strong' | 'slow'

// Special selection types
export type SelectionType = number[] | 'alle' | 'x²'

export interface Card {
  question: string // Format: "XxY" e.g. "3x4"
  answer: number // e.g. 12
  level: number // 1-5, default 1
  time: number // seconds for last correct answer, default 60
}

export interface GameConfig {
  select: SelectionType // Array of numbers 3-9, e.g. [3, 5, 7], or 'alle', or 'x²'
  focus: FocusType // 'weak', 'strong', or 'slow'
}

export interface GameHistory {
  date: string // ISO date string
  select: SelectionType // Can be number[], 'alle', or 'x²'
  points: number
  correctAnswers: number
}

export interface GameState {
  cards: Card[]
  currentCardIndex: number
  points: number
  correctAnswers: number
  startTime: number // timestamp
}

export interface Statistics {
  gamesPlayed: number
  totalPoints: number
  totalCorrectAnswers: number
}

export interface GameResult {
  points: number
  correctAnswers: number
  totalCards: number
  select: SelectionType // Can be number[], 'alle', or 'x²'
}

export interface Card {
  id: number
  en: string
  de: string
  level: number
  time_blind: number // Seconds for last correct answer in blind mode (0.1-60s, default 60)
  time_typing: number // Seconds for last correct answer in typing mode (0.1-60s, default 60)
}

export type GameMode = 'multiple-choice' | 'blind' | 'typing'
export type Priority = 'low' | 'high' | 'slow'
export type Language = 'en-de' | 'de-en'
export type AnswerResult = 'correct' | 'incorrect' | 'close'

export interface GameSettings {
  mode: GameMode
  priority: Priority
  language: Language
}

export interface GameHistoryEntry {
  date: string
  score: number
  settings: GameSettings
  correctAnswers: number
  totalCards: number
}

export interface GameStats {
  totalScore: number
  totalCorrectAnswers: number
  totalCardsPlayed: number
  totalGamesPlayed: number
}

export interface CardUpdate {
  card: Card
  change: 'up' | 'down' | 'same'
}

import type { Card } from '../types'

/**
 * Base path for the wordplay app - used in routing, PWA config, and database
 */
export const BASE_PATH = 'wordplay'

export const ROUND_SIZE = 10
export const MAX_LEVEL = 5
export const MIN_LEVEL = 1

export const INITIAL_CARDS: Card[] = [
  { id: 1, en: 'Where?', de: 'Wo?', level: 1, time_blind: 60, time_typing: 60 },
  { id: 2, en: 'Who?', de: 'Wer?', level: 1, time_blind: 60, time_typing: 60 },
  { id: 3, en: 'What?', de: 'Was?', level: 2, time_blind: 60, time_typing: 60 },
  { id: 4, en: 'Why?', de: 'Warum?', level: 2, time_blind: 60, time_typing: 60 },
  { id: 5, en: 'When?', de: 'Wann?', level: 3, time_blind: 60, time_typing: 60 },
  { id: 6, en: 'How?', de: 'Wie?', level: 3, time_blind: 60, time_typing: 60 },
  { id: 7, en: 'Which?', de: 'Welche/r/s?', level: 4, time_blind: 60, time_typing: 60 },
  { id: 8, en: 'From where?', de: 'Woher?', level: 4, time_blind: 60, time_typing: 60 },
  { id: 9, en: 'To where?', de: 'Wohin?', level: 5, time_blind: 60, time_typing: 60 },
  { id: 10, en: 'How much?', de: 'Wie viel?', level: 5, time_blind: 60, time_typing: 60 }
]

export const MIN_TIME = 0.1
export const MAX_TIME = 60
export const DEFAULT_TIME = 60

/**
 * Database column name for web stats tracking - derived from BASE_PATH
 */
export const STATS_DB_COL = BASE_PATH

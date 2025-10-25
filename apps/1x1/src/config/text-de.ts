/**
 * German language text strings for 1x1 Learning App
 * All user-facing text is centralized here for easy maintenance and i18n
 */

export const TEXT_DE = {
  // App title
  appTitle: "Vyvit's 1x1 Spiel",

  // Common actions
  start: 'Starten',
  continue: 'Weiter (Enter)',
  cancel: 'Abbrechen',
  reset: 'Zurücksetzen',
  check: 'Prüfen',
  wait: 'Warte',

  // Navigation
  backToHome: 'Zurück zur Startseite',
  goToStats: 'Statistiken',
  goToHistory: 'Spielverlauf',

  // Game feedback
  correct: 'Richtig!',
  wrong: 'Falsch!',
  autoCloseIn: 'Automatisch weiter in',

  // Game states
  gameStarted: 'Spiel starten',
  gameOver: 'Spiel beendet!',

  // Statistics labels
  games: 'Spiele',
  points: 'Punkte',
  pointsLabel: 'Punkte',
  correct_plural: 'Richtige',
  correctSuffix: ' richtig',
  from: 'Von',

  // Home page
  settings: 'Einstellungen',
  selection: 'Auswahl',
  selectionPrefix: 'Auswahl: ',
  selectionSquares: 'x²',
  selectionAll: 'alle',
  focus: 'Fokus',

  // Focus options
  focusWeak: 'Niedrige Level',
  focusStrong: 'Hohe Level',
  focusSlow: 'Langsame',

  // Stats page
  statistics: 'Statistiken',
  cardsPerLevel: 'Karten pro Level',
  cardsOverview: 'Karten-Übersicht',
  level: 'Level ',
  legend: 'Legende',
  legendBackground: 'Hintergrund: Level (Rot=1 → Grün=5)',
  legendTextColor: 'Schriftfarbe: Zeit (Grün=schnell → Rot=langsam)',
  footerNoDataStored: 'Keine Deiner Daten werden auf dem Server gespeichert.',

  // Reset dialog
  resetCardsTitle: 'Karten zurücksetzen',
  resetCardsMessage: 'Möchten Sie alle Karten auf Level 1 und Zeit 60s zurücksetzen?',
  resetCardsSuccess: 'Alle Karten wurden zurückgesetzt',

  // PWA installation
  pwaInstallTitle: 'Als App installieren',
  pwaAndroid: 'Android:',
  pwaAndroidInstructions: 'Menü (3 Punkte) → "Zum Startbildschirm hinzufügen"',
  pwaIPhone: 'iPhone:',
  pwaIPhoneInstructions: 'Teilen-Symbol → "Zum Home-Bildschirm"',

  // Game results
  results: 'Ergebnis',

  // Bonus system
  bonusPoints: 'Bonus',
  firstGameBonus: 'Erstes Spiel heute',
  streakGameBonus: 'Spiel des Tages',

  // Empty states
  noGamesPlayed: 'Noch keine Spiele gespielt',
  noDataAvailable: 'Keine Kartendaten verfügbar',

  // Database stats
  totalGamesPlayedByAll: 'Spiele gespielt von allen Nutzern.'
} as const

export type TextKey = keyof typeof TEXT_DE

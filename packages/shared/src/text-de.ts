/**
 * German language text strings for educational apps
 * All user-facing text is centralized here for easy maintenance and i18n
 * Future: Support additional languages with i18n plugin
 */

// cspell:disable

export const TEXT_DE = {
  // App titles (used in vite.config.ts manifests)
  appTitle_1x1: "Vyvit's 1x1 Spiel",
  appTitle_voc: "Rabat's Wortspiel",

  // Footer
  totalGamesPlayedByAll: 'Spiele gespielt.',
  footerNoDataStored: 'Es werden keine persönlichen Daten gespeichert.',

  // Common actions (shared across both apps)
  common: {
    start: 'Starten',
    continue: 'Weiter',
    continueWithEnter: 'Weiter (Enter)',
    cancel: 'Abbrechen',
    reset: 'Zurücksetzen',
    check: 'Prüfen',
    wait: 'Merken...',
    yes: 'Ja',
    no: 'Nein',
    backToHome: 'Zurück zur Startseite',
    backToMenu: 'Zurück zum Menü',
    pwaInstall: {
      title: 'Als App installieren',
      android: 'Android:',
      androidInstructions: 'Menü (3 Punkte) → "Zum Startbildschirm hinzufügen"',
      iPhone: 'iPhone:',
      iPhoneInstructions: 'Teilen-Symbol → "Zum Home-Bildschirm"'
    }
  },

  // Navigation
  nav: {
    history: 'Verlauf',
    cards: 'Karten'
  },

  // Statistics (shared)
  stats: {
    title: 'Statistiken',
    games: 'Spiele',
    points: 'Punkte',
    correctAnswers: 'Richtige',
    correctSuffix: ' richtig',
    from: 'Von',
    noGamesPlayed: 'Noch keine Spiele gespielt',
    noDataAvailable: 'Keine Kartendaten verfügbar',
    cardsPerLevel: 'Karten pro Level',
    cardsOverview: 'Karten-Übersicht',
    level: 'Level',
    legend: 'Legende',
    legendBackground: 'Hintergrund: Level (Rot=1 → Grün=5)',
    legendTextColor: 'Schriftfarbe: Zeit (Grün=schnell → Rot=langsam)'
  },

  // Common words
  words: {
    focus: 'Fokus',
    mode: 'Modus',
    direction: 'Richtung'
  },

  // Common focus options (shared across both apps)
  focusOptions: {
    weak: 'Schwache Wörter',
    strong: 'Starke Wörter',
    slow: 'Langsame Wörter'
  },

  // 1x1 App specific
  multiply: {
    selection: 'Reihe',
    selectionPrefix: 'Reihe: ',
    selectionSquares: 'x²',
    selectionAll: 'alle',
    autoCloseIn: 'Automatisch weiter in',
    gameStarted: 'Spiel starten',
    bonusPoints: 'Bonus',
    firstGameBonus: 'Erstes Spiel heute',
    streakGameBonus: 'Spiel des Tages',
    resetCards: {
      title: 'Karten zurücksetzen',
      message: 'Möchten Sie alle Karten auf Level 1 und Zeit 60s zurücksetzen?',
      success: 'Alle Karten wurden zurückgesetzt'
    }
  },

  // Wordplay App specific
  voc: {
    home: {
      welcome: 'Willkommen zurück!',
      startRound: 'Runde starten',
      infoTooltip: 'Info zu Scoring-Regeln'
    },
    modes: {
      'multiple-choice': 'Multiple Choice',
      blind: 'Blind',
      typing: 'Tippen'
    },
    language: {
      'en-de': 'EN → DE',
      'de-en': 'DE → EN'
    },
    game: {
      title: 'Spielen',
      time: 'Zeit',
      revealAnswer: 'Antwort aufdecken',
      wasYourAnswerCorrect: 'War deine Antwort richtig?',
      typePlaceholder: 'Antwort tippen...'
    },
    gameOver: {
      title: 'Runde beendet!',
      greatJob: 'Super gemacht!',
      goodWork: 'Gute Arbeit, weiter so!',
      finalScore: 'Endstand',
      leveledUp: 'Aufgestiegen',
      leveledDown: 'Abgestiegen',
      playAgain: 'Neue Runde spielen'
    },
    cardManagement: {
      title: 'Kartenverwaltung',
      export: 'Exportieren',
      import: 'Importieren...',
      copied: 'Kopiert!',
      reset: 'Kartenstapel zurücksetzen',
      moveAll: 'Verschieben',
      currentDeck: 'Aktueller Kartenstapel',
      exportTitle: 'Karten Exportieren',
      exportDescription:
        'Speichere deinen aktuellen Kartenstapel in der Zwischenablage im TSV-Format.',
      importTitle: 'Karten Importieren',
      importDescription:
        'Ersetze deinen aktuellen Stapel durch Kartendaten aus der Zwischenablage.',
      moveAllTitle: 'Alle Karten verschieben',
      moveAllDescription: 'Setze alle Karten im Stapel auf ein bestimmtes Level.',
      dangerZoneTitle: 'Gefahrenzone',
      dangerZoneDescription:
        'Setze alle Karten und deinen gesamten Lernfortschritt auf den ursprünglichen Zustand zurück.',
      importDialogTitle: 'Karten importieren',
      importDialogMessage: 'Füge deinen Kartentext ein (EN[Tab/,]DE[Tab/,]LEVEL):',
      confirmImportTitle: 'Import bestätigen',
      confirmImportMessage: '{count} Karten gefunden. Importieren?',
      confirmMoveTitle: 'Verschieben bestätigen',
      confirmMoveMessage: 'Alle {count} Karten auf Level {level} setzen?',
      confirmResetTitle: 'Zurücksetzen bestätigen',
      confirmResetMessage:
        'Diese Aktion setzt alle Karten und deinen Lernfortschritt zurück. Fortfahren?',
      emptyTextError: 'Das Textfeld ist leer.',
      noDelimiterError: 'Konnte kein Trennzeichen (Tab, Komma, Semikolon) finden.',
      noCardsFoundError:
        'Keine gültigen Karten gefunden. Format: EN{delimiter}DE{delimiter}LEVEL (optional)',
      clipboardError: 'Konnte nicht in die Zwischenablage kopieren.',
      invalidLevelError: 'Bitte gib ein Level zwischen {min} und {max} ein.',
      importSuccess: '{count} Karten erfolgreich importiert!',
      moveSuccess: 'Alle Karten verschoben!',
      resetSuccess: 'Kartenstapel wurde zurückgesetzt!'
    },
    stats: {
      allCardsTitle: 'Alle Karten im Stapel'
    },
    history: {
      noGamesPlayed: 'Keine Runden bisher gespielt.',
      points: 'Pkt.',
      correct: 'richtig',
      focusWeak: 'Fokus: Schwach',
      focusStrong: 'Fokus: Stark'
    },
    info: {
      title: 'Scoring-Regeln',
      description:
        'Dein Punktestand (Score) wird basierend auf mehreren Faktoren berechnet, um einen Anreiz für das Lernen schwierigerer Wörter und die Verwendung anspruchsvollerer Spielmodi zu schaffen.',
      basePointsTitle: '1. Basispunkte',
      basePointsDescription:
        'Die Grundlage für die Punktzahl ist das Level der Karte. Wörter, die du weniger gut kennst (niedrigeres Level), geben mehr Punkte.',
      basePointsLevel1: 'Level 1: 5 Punkte',
      basePointsLevel2: 'Level 2: 4 Punkte',
      basePointsLevel3: 'Level 3: 3 Punkte',
      basePointsLevel4: 'Level 4: 2 Punkte',
      basePointsLevel5: 'Level 5: 1 Punkt',
      modeMultiplierTitle: '2. Modus-Multiplikator',
      modeMultiplierDescription: 'Die Basispunkte werden mit einem Multiplikator versehen:',
      modeMultiplierChoice: 'Multiple Choice: x1 (Standard)',
      modeMultiplierBlind: 'Blind: x2',
      modeMultiplierTyping: 'Tippen: x4',
      additionalRulesTitle: '3. Zusätzliche Regeln',
      additionalRuleFastCorrect:
        '"Fast richtig": Im Tippen-Modus erhältst du bei kleinen Tippfehlern (ein Buchstabe falsch) 75% der möglichen Punkte.',
      additionalRuleLanguageBonus:
        'Sprachrichtung: Für eine richtige Antwort in der Richtung Deutsch → Englisch erhältst du +1 Zusatzpunkt.',
      additionalRuleWrong: 'Falsche Antworten geben immer 0 Punkte.'
    }
  }
} as const

export type TextKey = keyof typeof TEXT_DE

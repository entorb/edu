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

  footer: {
    gamesPlayedByAll: 'Spiele gespielt.',
    noDataStored: 'Es werden keine persönlichen Daten gespeichert.'
  },

  pwaInstall: {
    title: 'Als App installieren',
    android: 'Android:',
    androidInstructions: 'Menü (3 Punkte) → "Zum Startbildschirm hinzufügen"',
    iPhone: 'iPhone:',
    iPhoneInstructions: 'Teilen-Symbol → "Zum Home-Bildschirm"'
  },

  // Common actions
  common: {
    start: 'Starten',
    continue: 'Weiter',
    reset: 'Zurücksetzen', // in LevelDistribution
    check: 'Prüfen',
    wait: 'Merken...',
    yes: 'Ja',
    no: 'Nein'
  },

  // Navigation
  nav: {
    history: 'Verlauf',
    cards: 'Karten',
    backToHome: 'Zurück zur Startseite',
    infoTooltip: 'Info zu Scoring-Regeln'
  },

  history: {},

  cards: {
    cardsPerLevel: 'Karten pro Level',
    legend: 'Legende',
    legendBackground: 'Hintergrund: Level (Rot=1 → Grün=5)',
    legendTextColor: 'Schriftfarbe: Zeit (Grün=schnell → Rot=langsam)'
  },

  // Common words
  words: {
    cards: 'Karten',
    level: 'Level',
    focus: 'Fokus',
    mode: 'Modus',
    direction: 'Richtung',
    bonusPoints: 'Bonus',
    firstGameBonus: 'Erstes Spiel heute',
    streakGameBonus: 'Spiel des Tages'
  },

  // Common focus options
  focusOptions: {
    weak: 'Niedrige Level',
    strong: 'Hohe Level',
    slow: 'Langsame'
  },

  // 1x1 App specific
  multiply: {
    selection: 'Reihe',
    selectionSquares: 'x²',
    selectionAll: 'alle'
  },

  // Wordplay App specific
  voc: {
    mode: {
      multipleChoice: 'Multiple Choice',
      blind: 'Blind',
      typing: 'Tippen'
    },
    language: {
      'en-de': 'EN → DE',
      'de-en': 'DE → EN'
    },
    game: {
      revealAnswer: 'Antwort aufdecken',
      wasYourAnswerCorrect: 'War deine Antwort richtig?',
      typePlaceholder: 'Antwort tippen...'
    },
    cards: {
      // title: 'Kartenverwaltung',
      export: 'Exportieren',
      import: 'Importieren...',
      copied: 'Kopiert!',
      reset: 'Kartenstapel zurücksetzen',
      moveAll: 'Verschieben',
      exportTitle: 'Karten Exportieren',
      exportDescription: 'Kopiere deine Karten um sie in Excel einzufügen.',
      importTitle: 'Karten Importieren',
      importDescription: 'Ersetze deine Karten per Copy&Paste (aus Excel kopieren).',
      moveAllTitle: 'Alle Karten verschieben',
      moveAllDescription: 'Setze alle Karten auf ein Level.',
      dangerZoneTitle: 'Gefahrenzone',
      dangerZoneDescription: 'Ersetze Deine Karten durch den Standardsatz.',
      importDialogTitle: 'Karten importieren',
      importDialogMessage: 'Füge deine Karten aus Excel (oder so) ein (En | De | Level)',
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
    history: {
      points: 'Pkt.',
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

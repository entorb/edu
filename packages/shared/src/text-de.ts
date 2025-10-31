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

  pwaUpdate: {
    confirmMessage: 'Neue Version verfügbar. Neu laden?'
  },

  // Common actions
  common: {
    start: 'Starten',
    continue: 'Weiter',
    reset: 'Zurücksetzen', // in LevelDistribution
    check: 'Prüfen',
    wait: 'Merken...',
    yes: 'Ja',
    no: 'Nein',
    cancel: 'Abbrechen'
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
    streakGameBonus: 'Spiel des Tages',
    english: 'Englisch',
    german: 'Deutsch',
    actions: 'Aktionen',
    delete: 'Löschen'
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
    selectionAll: 'alle',
    extendedCards: {
      title: 'Weitere Karten',
      feature1x2: '1x2',
      feature1x12: '1x12',
      feature1x20: '1x20',
      confirmDeleteTitle: 'Karten löschen?',
      confirmDeleteMessage: 'Sicher, dass Du die Karten und ihr Level löschen willst?',
      addSuccess: 'Karten hinzugefügt!',
      feature1x12Warning: '1x20 wird deaktiviert, da 1x12 deaktiviert wurde.'
    }
  },

  // Wordplay App specific
  voc: {
    mode: {
      multipleChoice: 'Multiple Choice',
      blind: 'Blind',
      typing: 'Tippen'
    },
    game: {
      revealAnswer: 'Antwort aufdecken',
      wasYourAnswerCorrect: 'War deine Antwort richtig?',
      typePlaceholder: 'Antwort tippen...'
    },
    language: {
      en_de: 'EN → DE',
      de_en: 'DE → EN'
    },
    cards: {
      // title: 'Kartenverwaltung',
      export: 'Raus kopieren',
      import: 'Rein kopieren',
      copied: 'Kopiert!',
      reset: 'Alle Karten löschen',
      moveAll: 'Verschieben',
      moveAllTitle: 'Alle Karten verschieben',
      dangerZoneTitle: 'Gefahrenzone',
      importDialogTitle: 'Karten importieren',
      importDialogMessage: 'Füge deine Karten aus Excel (oder so) ein (En | De | Level)',
      importHintExcel:
        'Tipp: verwende Excel order Google Tabellen um mehrere Vokabellisten zu verwalten.',
      confirmMoveTitle: 'Verschieben bestätigen',
      confirmMoveMessage: 'Alle {count} Karten auf Level {level} setzen?',
      confirmResetTitle: 'Zurücksetzen bestätigen',
      confirmResetMessage:
        'Diese Aktion setzt alle Karten und deinen Lernfortschritt zurück. Fortfahren?',
      emptyTextError: 'Das Textfeld ist leer.',
      noDelimiterError: 'Konnte kein Trennzeichen (Tab, Komma, Semikolon) finden.',
      noCardsFoundError:
        'Keine gültigen Karten gefunden. Format: EN{delimiter}DE{delimiter}LEVEL (optional)',
      clipboardError: 'Zugriff auf Zwischenablage fehlgeschlagen.',
      invalidLevelError: 'Bitte gib ein Level zwischen {min} und {max} ein.',
      importSuccess: '{count} Karten erfolgreich importiert!',
      moveSuccess: 'Alle Karten verschoben!',
      resetSuccess: 'Kartenstapel wurde zurückgesetzt!',
      editCardsTitle: 'Karten Bearbeiten',
      editCardsButton: 'Bearbeiten',
      addNewCard: 'Neue Karte',
      enPlaceholder: 'Englisches Wort',
      dePlaceholder: 'Deutsches Wort',
      save: 'Speichern',
      validationEnEmpty: 'Das englische Wort darf nicht leer sein.',
      validationDeEmpty: 'Das deutsche Wort darf nicht leer sein.',
      saveSuccess: 'Karten erfolgreich gespeichert!',
      unsavedChangesTitle: 'Ungespeicherte Änderungen',
      unsavedChangesMessage: 'Du hast ungespeicherte Änderungen. Möchtest du die Seite verlassen?'
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

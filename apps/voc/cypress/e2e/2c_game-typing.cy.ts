/* eslint-disable @typescript-eslint/no-explicit-any */

describe('Typing Mode Game - DE to EN', () => {
  beforeEach(() => {
    // Clear storage to ensure clean state
    cy.clearLocalStorage()
    cy.clearAllSessionStorage()
    cy.visit('/')
  })

  it('should complete a game with 1 wrong, 1 close, and 8 correct answers', () => {
    // Select Typing mode
    // cspell:disable-next-line
    cy.contains('Tippen').click()

    // Select DE → EN language direction
    cy.contains('DE → EN').click()

    // Start the game
    cy.get('[data-cy="start-button"]').click()

    // Verify we're on the game page
    cy.url().should('include', '/game')

    // Wait for flashcard container and game question to be visible
    cy.get('.flashcard-container', { timeout: 10000 }).should('be.visible')
    cy.get('[data-cy="game-page-question"]', { timeout: 10000 }).should('be.visible')

    // Wait for typing input to appear (first card initialization)
    cy.get('[data-cy="typing-input"]', { timeout: 10000 }).should('be.visible')

    // Helper function to answer a card
    const answerCard = (cardIndex: number) => {
      // Get the question text and cards from localStorage
      cy.window().then(win => {
        const stored = win.localStorage.getItem('voc-cards')
        const cards = stored ? JSON.parse(stored) : []

        cy.get('[data-cy="game-page-question"]')
          .invoke('text')
          .then(questionText => {
            let answerToType = ''

            if (cardIndex === 0) {
              // First card: answer incorrectly
              answerToType = 'xxx wrong answer'
            } else if (cardIndex === 1) {
              // Second card: answer almost correctly (with typo)
              // Find the correct answer and introduce a small typo
              const card = cards.find((c: any) => c.de === questionText.trim())
              if (card) {
                const correctAnswer = card.en.split('/')[0].trim()
                // Add a typo by changing one character (e.g., replace first char with 'x')
                answerToType = `x${correctAnswer.substring(1)}`
              } else {
                // Fallback: generic close answer
                answerToType = 'xxx close'
              }
            } else {
              // Remaining cards: answer correctly
              const card = cards.find((c: any) => c.de === questionText.trim())
              if (card) {
                const correctAnswer = card.en.split('/')[0].trim()
                answerToType = correctAnswer
              } else {
                // Fallback: generic answer
                answerToType = 'test'
              }
            }

            // Wait for input to be ready, clear and type
            cy.get('[data-cy="typing-input"]', { timeout: 10000 }).should('be.visible')
            cy.get('[data-cy="typing-input"]').clear()
            cy.get('[data-cy="typing-input"]').type(answerToType)

            // Click Check button
            cy.get('[data-cy="check-answer-button"]').click()

            // Wait for feedback and continue button
            cy.get('[data-cy="continue-button"]', { timeout: 5000 }).should('be.visible')

            // Check if wrong or close answer (wait for button to enable)
            cy.get('body').then($body => {
              if ($body.text().includes('Falsch') || $body.text().includes('Fast richtig')) {
                cy.wait(3100)
              }
            })

            // Click continue button
            cy.get('[data-cy="continue-button"]').click()
          })
      })
    }

    // Play through 10 cards
    answerCard(0) // Card 0 - wrong answer
    answerCard(1) // Card 1 - close answer (typo)
    for (let i = 2; i < 10; i++) {
      answerCard(i) // Cards 2-9 - correct answers
    }

    // After all cards, we should be on game over page
    cy.url({ timeout: 15000 }).should('include', '/game-over')
    cy.get('[data-cy="back-to-home-button"]').should('be.visible')

    // Should have 8 correct (cards 2-9), but allow for 7-9 due to "close" answer
    cy.get('[data-cy="correct-answers-count"]')
      .invoke('text')
      .then(text => {
        const count = parseInt(text)
        expect(count).to.be.at.least(7).and.at.most(9)
      })
    cy.get('[data-cy="total-questions-count"]').should('contain', '10')

    // Capture exact values from GameOverPage
    let gameOverPoints: number
    let gameOverCorrectAnswers: number

    cy.get('[data-cy="final-points"]')
      .invoke('text')
      .then(text => {
        gameOverPoints = parseInt(text.trim())
        cy.log('GameOver Points:', gameOverPoints)
      })

    cy.get('[data-cy="correct-answers-count"]')
      .invoke('text')
      .then(text => {
        gameOverCorrectAnswers = parseInt(text.trim())
        cy.log('GameOver Correct Answers:', gameOverCorrectAnswers)
        expect(gameOverCorrectAnswers).to.be.at.least(7).and.at.most(9)
      })

    // Navigate back to home page
    cy.get('[data-cy="back-to-home-button"]').click()

    // Verify we're back on home page
    cy.url().should('not.include', '/game-over')
    cy.get('[data-cy="app-title"]').should('be.visible')

    // Verify exact points and correct answers match on HomePage
    cy.get('[data-cy="stats-total-points"]')
      .invoke('text')
      .then(text => {
        const homePagePoints = parseInt(text.trim())
        cy.log('HomePage Points:', homePagePoints)
        expect(homePagePoints).to.equal(gameOverPoints)
      })

    cy.get('[data-cy="stats-correct-answers"]')
      .invoke('text')
      .then(text => {
        const homePageCorrectAnswers = parseInt(text.trim())
        cy.log('HomePage Correct Answers:', homePageCorrectAnswers)
        expect(homePageCorrectAnswers).to.equal(gameOverCorrectAnswers)
      })

    // Navigate to history page
    cy.get('[data-cy="history-button"]').click()

    // Verify we're on history page
    cy.url().should('include', '/history')
    cy.get('[data-cy="history-page-title"]').should('be.visible')

    // Verify the most recent game appears in history (index 0 since sorted by date DESC)
    cy.get('[data-cy="history-game-0"]').should('be.visible')

    // Verify exact correct answers and points in history match GameOverPage
    cy.get('[data-cy="history-game-0-correct"]')
      .invoke('text')
      .then(text => {
        const historyCorrectAnswers = parseInt(text.trim())
        cy.log('History Correct Answers:', historyCorrectAnswers)
        expect(historyCorrectAnswers).to.equal(gameOverCorrectAnswers)
      })

    cy.get('[data-cy="history-game-0-points"]')
      .invoke('text')
      .then(text => {
        const historyPoints = parseInt(text.trim())
        cy.log('History Points:', historyPoints)
        expect(historyPoints).to.equal(gameOverPoints)
      })

    // Navigate back to home
    cy.get('[data-cy="back-button"]').click()

    // Verify we're back on home page
    cy.url().should('not.include', '/history')
    cy.get('[data-cy="app-title"]').should('be.visible')
  })
})

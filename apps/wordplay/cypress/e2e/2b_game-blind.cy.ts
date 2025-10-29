describe('Blind Mode Game - DE to EN', () => {
  beforeEach(() => {
    // Clear storage to ensure clean state
    cy.clearLocalStorage()
    cy.clearAllSessionStorage()
    cy.visit('/')
  })

  // Helper function to answer a card
  const answerCard = (isCorrect: boolean) => {
    // Wait for reveal answer button to be visible
    cy.get('[data-cy="reveal-answer-button"]', { timeout: 10000 }).should('be.visible')

    // Click Reveal Answer button
    cy.get('[data-cy="reveal-answer-button"]').should('be.visible').click()

    // Click Yes if correct, No if incorrect
    if (isCorrect) {
      cy.get('[data-cy="blind-yes-button"]').should('be.visible').click()
    } else {
      cy.get('[data-cy="blind-no-button"]').should('be.visible').click()
    }

    // Wait for feedback and continue button to appear
    cy.get('[data-cy="continue-button"]', { timeout: 5000 }).should('be.visible')

    // Check if it's a wrong answer (button will be disabled for 3s)
    if (!isCorrect) {
      cy.wait(3100) // Wait for button to be enabled
    }

    // Click continue button
    cy.get('[data-cy="continue-button"]').click()
  }

  it('should complete a game with 1 wrong and 9 correct answers', () => {
    // Select Blind mode
    cy.contains('Blind').click()

    // Select DE → EN language direction
    cy.contains('DE → EN').click()

    // Start the game
    cy.get('[data-cy="start-button"]').click()

    // Verify we're on the game page
    cy.url().should('include', '/game')

    // Wait for flashcard container and game question to be visible
    cy.get('.flashcard-container', { timeout: 10000 }).should('be.visible')
    cy.get('[data-cy="game-page-question"]', { timeout: 10000 }).should('be.visible')

    // Play through 10 cards
    // Cards 0: Answer wrongly
    answerCard(false)
    // Cards 1-9: Answer correctly
    for (let i = 1; i < 10; i++) {
      answerCard(true)
    }

    // After all cards, we should be on game over page
    cy.url({ timeout: 10000 }).should('include', '/game-over')
    cy.get('[data-cy="back-to-home-button"]').should('be.visible')

    // Should have exactly 9 correct answers (cards 1-9)
    cy.get('[data-cy="correct-answers-count"]').should('contain', '9')
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
        expect(gameOverCorrectAnswers).to.equal(9)
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

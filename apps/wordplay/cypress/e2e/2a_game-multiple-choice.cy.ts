/* eslint-disable @typescript-eslint/no-explicit-any */

describe('Multiple Choice Game - EN to DE', () => {
  beforeEach(() => {
    // Clear storage to ensure clean state
    cy.clearLocalStorage()
    cy.clearAllSessionStorage()
    cy.visit('/')
  })

  it('should complete a game with 1 wrong and 9 correct answers', () => {
    // Select Multiple Choice mode
    cy.contains('Multiple Choice').click()

    // Select EN → DE language direction
    cy.contains('EN → DE').click()

    // Start the game
    cy.get('[data-cy="start-button"]').click()

    // Verify we're on the game page
    cy.url().should('include', '/game')

    // Wait for flashcard container and game question to be visible
    cy.get('.flashcard-container', { timeout: 10000 }).should('be.visible')
    cy.get('[data-cy="game-page-question"]', { timeout: 10000 }).should('be.visible')

    // Wait for multiple choice options to appear (first card initialization)
    cy.get('[data-cy="multiple-choice-option"]', { timeout: 10000 }).should('have.length', 4)

    // Helper function to answer a card
    const answerCard = (cardIndex: number) => {
      // Get the question text and cards from localStorage
      cy.window().then(win => {
        const stored = win.localStorage.getItem('wordplay-cards')
        const cards = stored ? JSON.parse(stored) : []

        cy.get('[data-cy="game-page-question"]')
          .invoke('text')
          .then(questionText => {
            if (cardIndex === 0) {
              // First card: answer incorrectly
              // Find the correct answer first, then click a different button
              const card = cards.find((c: any) => c.en === questionText.trim())
              if (card) {
                const correctAnswer = card.de

                // Find all buttons and identify which is correct
                cy.get('[data-cy="multiple-choice-option"]').then($buttons => {
                  let correctIndex = -1
                  $buttons.each((index, btn) => {
                    if (btn.textContent?.trim() === correctAnswer) {
                      correctIndex = index
                      return false // Break
                    }
                  })

                  // Click a wrong button (not the correct one)
                  // If correct is at index 0, click index 1, otherwise click index 0
                  const wrongIndex = correctIndex === 0 ? 1 : 0
                  cy.get('[data-cy="multiple-choice-option"]').eq(wrongIndex).click()
                })
              } else {
                // Fallback: click first option
                cy.get('[data-cy="multiple-choice-option"]').eq(0).click()
              }
            } else {
              // Remaining cards: answer correctly
              const card = cards.find((c: any) => c.en === questionText.trim())

              if (card) {
                // Match against full card.de value (includes alternatives like "Welche/r/s")
                const correctAnswer = card.de

                // Find the index of the correct answer button
                cy.get('[data-cy="multiple-choice-option"]').then($buttons => {
                  let correctIndex = -1
                  $buttons.each((index, btn) => {
                    if (btn.textContent?.trim() === correctAnswer) {
                      correctIndex = index
                      return false // Break
                    }
                  })

                  // Click the correct answer
                  if (correctIndex >= 0) {
                    cy.get('[data-cy="multiple-choice-option"]').eq(correctIndex).click()
                  } else {
                    // Fallback: click first option
                    cy.get('[data-cy="multiple-choice-option"]').eq(0).click()
                  }
                })
              } else {
                // Fallback: click first option
                cy.get('[data-cy="multiple-choice-option"]').eq(0).click()
              }
            }

            // Wait for feedback and continue button
            cy.get('[data-cy="continue-button"]', { timeout: 5000 }).should('be.visible')

            // Check if wrong answer (wait for button to enable)
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

    // Play through 10 cards: first card wrong, rest correct
    answerCard(0) // Card 0 - wrong answer
    for (let i = 1; i < 10; i++) {
      answerCard(i) // Cards 1-9 - correct answers
    }

    // After all cards, we should be on game over page
    cy.url({ timeout: 15000 }).should('include', '/game-over')
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

    // Navigate back to home
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
    cy.url().should('include', '/history')
    cy.get('[data-cy="history-page-title"]').should('be.visible')

    // Verify the most recent game appears in history
    cy.get('[data-cy="history-game-0"]').should('be.visible')

    // Verify exact correct answers and points in history
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

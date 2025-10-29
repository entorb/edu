describe('Navigation Smoke Tests', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('navigate Home to History and back', () => {
    // Verify we're on the home page
    cy.get('[data-cy="app-title"]').should('be.visible')

    // Navigate to History
    cy.get('[data-cy="history-button"]').click()
    cy.url().should('include', '/history')
    cy.get('[data-cy="history-page-title"]').should('be.visible')

    // Test page reload persistence
    cy.reload()
    cy.get('[data-cy="history-page-title"]').should('be.visible')

    // Test back via button
    cy.get('[data-cy="back-button"]').click()
    cy.url().should('not.include', '/history')
    cy.get('[data-cy="app-title"]').should('be.visible')

    // Navigate again for browser back test
    cy.get('[data-cy="history-button"]').click()
    cy.url().should('include', '/history')
    cy.go('back')
    cy.url().should('not.include', '/history')
    cy.get('[data-cy="app-title"]').should('be.visible')

    // Navigate again for escape key test
    cy.get('[data-cy="history-button"]').click()
    cy.url().should('include', '/history')
    cy.get('body').type('{esc}')
    cy.url().should('not.include', '/history')
    cy.get('[data-cy="app-title"]').should('be.visible')
  })

  it('navigate Home to Game and back', () => {
    // Verify we're on the home page
    cy.get('[data-cy="app-title"]').should('be.visible')

    // Navigate to Game
    cy.get('[data-cy="start-button"]').click()
    cy.url().should('include', '/game')
    cy.get('[data-cy="submit-answer-button"]').should('be.visible')

    // Test page reload persistence
    cy.reload()
    cy.get('[data-cy="submit-answer-button"]').should('be.visible')

    // Test back via button
    cy.get('[data-cy="back-button"]').click()
    cy.url().should('not.include', '/game')
    cy.get('[data-cy="app-title"]').should('be.visible')

    // Navigate again for browser back test
    cy.get('[data-cy="start-button"]').click()
    cy.url().should('include', '/game')
    cy.go('back')
    cy.url().should('not.include', '/game')
    cy.get('[data-cy="app-title"]').should('be.visible')

    // Navigate again for escape key test
    cy.get('[data-cy="start-button"]').click()
    cy.url().should('include', '/game')
    cy.get('body').type('{esc}')
    cy.url().should('not.include', '/game')
    cy.get('[data-cy="app-title"]').should('be.visible')
  })

  it('navigate Home to Statistics and back', () => {
    // Verify we're on the home page
    cy.get('[data-cy="app-title"]').should('be.visible')

    // Navigate to Statistics
    cy.get('[data-cy="stats-button"]').click()
    cy.url().should('include', '/stats')
    cy.get('[data-cy="stats-page-title"]').should('be.visible')

    // Test page reload persistence
    cy.reload()
    cy.get('[data-cy="stats-page-title"]').should('be.visible')

    // Test back via button
    cy.get('[data-cy="back-button"]').click()
    cy.url().should('not.include', '/stats')
    cy.get('[data-cy="app-title"]').should('be.visible')

    // Navigate again for browser back test
    cy.get('[data-cy="stats-button"]').click()
    cy.url().should('include', '/stats')
    cy.go('back')
    cy.url().should('not.include', '/stats')
    cy.get('[data-cy="app-title"]').should('be.visible')

    // Navigate again for escape key test
    cy.get('[data-cy="stats-button"]').click()
    cy.url().should('include', '/stats')
    cy.get('body').type('{esc}')
    cy.url().should('not.include', '/stats')
    cy.get('[data-cy="app-title"]').should('be.visible')
  })
})

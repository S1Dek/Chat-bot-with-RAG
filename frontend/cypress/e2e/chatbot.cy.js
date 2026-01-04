/// <reference types="cypress" />

describe('Chatbot – testy E2E', () => {
  it('test startowy', () => {
    cy.visit('http://localhost:3000');
    cy.get('input[type="email"]').type('test@test.pl');
    cy.get('input[type="password"]').type('password123');
    cy.contains('Zaloguj');
    cy.contains('Nowa rozmowa')
    .should('be.visible')
    .click();

    cy.get('textarea', { timeout: 10000 })
    .should('be.visible')
    .type('Komputer nie włącza się po naciśnięciu przycisku zasilania');

    cy.contains('Wyślij').click();

    cy.contains('Komputer nie włącza się').should('exist');

  });
});

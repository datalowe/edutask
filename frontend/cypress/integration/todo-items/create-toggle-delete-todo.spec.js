/// <reference types="cypress" />

describe('todo-list item', () => {
  // when user doesn't exist (signup)
  // before(() => {
  //   cy.visit('http://localhost:3000');

  //   cy.contains('a', 'Click here to sign up.')
  //     .click();

  //   cy.contains('div', 'Email Address')
  //     .find('input[type=text]')
  //     .type('janedoe@mail.com');
  //   cy.contains('div', 'First Name')
  //     .find('input[type=text]')
  //     .type('Jane');
  //   cy.contains('div', 'Last Name')
  //     .find('input[type=text]')
  //     .type('Doe');
  //   // password functionality not implemented yet
  //   // cy.contains('div', 'Password')
  //   //   .find('input[type=text]')
  //   //   .type('verysecretpass');
    
  //   cy.contains('input', 'Sign Up')
  //     .click();
  // });

  // when user already exists (login)
  before(() => {
    cy.visit('http://localhost:3000');

    cy.contains('div', 'Email Address')
      .find('input[type=text]')
      .type('janedoe@mail.com');
    // password functionality not implemented yet
    // cy.contains('div', 'Password')
    //   .find('input[type=text]')
    //   .type('verysecretpass');
    
    cy.contains('input', 'Login')
      .click();
  });

  it('displays no todo tasks to begin with', () => {
    cy.contains('p', 'Here you').should('include.text', 'Here you find the space');
  });
});
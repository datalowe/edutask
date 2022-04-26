describe('Test adding task to video list', () => {
  before(() => {
    cy.visit('http://localhost:3000')
    cy.contains('div', 'Email Address')
      .find('input')
      .type('jane.doe@gmail.com')
    cy.get('form')
      .submit()
    cy.get('img').first()
      .click()
  })

  it('adds new task to list', () => {
    // cy.get('.inline-form > input').first()
    cy.get('li').its('length').then(($len) => {
      cy.get('input[placeholder="Add a new todo item"]')
      .type('Test item', { force: true })
      // cy.get('form.inline-form')
      cy.contains('input', 'Add').parent()
        .submit()
      cy.get('li')
        .should('contain.text', 'Test item')
      cy.get('li').its('length').should('be.gt', $len)
    })      
  })

  // Hur kollar man om ramen är röd, det finns ju hundra röda färger? Förutsätta att man löser det genom att toggla en class och därför jämföra classList före och efter?
  it('should not be possible to submit an empty string', () => {
    cy.get('input[placeholder="Add a new todo item"]').clear({force: true})
    cy.get('ul').find('li').its('length').then(($len) => {
      cy.contains('input', 'Add').parent()
        .submit()
      cy.get('li').its('length').should('be.eq', $len)
    })
  })

  // Denna funkar inte, i verkligheten tas den bort ser det ut som men inte här?
  it('removes existing todo item', () => {
    cy.get('ul').find('li').its('length').then(($len) => {
      cy.get('.remover').last()
        // .contains('span.remover')
        .click({ force: true })
      cy.get('ul').find('li').its('length').should('be.lt', $len)
    })
  })
})
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

  // // Fungerande test som lägger till en item och kontrollerar dess text, borde vara rimlig nivå för R8UC1 #1
  // it('adds new task to list', () => {
  //   let text = "Take out the trash";
  //   cy.get('input[placeholder="Add a new todo item"]')
  //   .type(text, { force: true })
  //   cy.contains('input', 'Add').parent()
  //     .submit()
  //   cy.get('li')
  //     .should('contain.text', text)
  // })

  // R8UC1 #1
  // Denna funkar oftast men failar ibland, enligt Julians hintar ska det bero på något bakomliggande fel i system så det är inget fel på koden utan ska vara så typ? Svårt att förstå.
  it('adds new task to list', () => {
    let text = "Take out the trash";
    cy.get('li').its('length').then(($len) => {
      cy.get('input[placeholder="Add a new todo item"]')
        .type(text, { force: true })
      cy.contains('input', 'Add').parent()
        .submit()
      cy.get('.todo-item:last')
        .should('contain.text', text)
      cy.get('li').its('length').should('be.gt', $len)
    })
  })

  // R8UC1 #2
  // Denna kollar ändå att listan inte har blivit längre, vilket den har så testet failar men ska faila. 
  // Hur kollar man om ramen är röd, det finns ju hundra röda färger?
  it('should not be possible to submit an empty string', () => {
    cy.get('input[placeholder="Add a new todo item"]').clear({ force: true })
    cy.get('ul').find('li').its('length').then(($len) => {
      cy.contains('input', 'Add').parent()
        .submit()
      cy.get('.list-item').prev().not('have.text', '')
      cy.get('li').its('length').should('be.eq', $len)
    })
  })

  // R8UC2 #1
  it('sets active item to done', () => {
    let text = "New todo item to check";
    cy.get('input[placeholder="Add a new todo item"]')
      .type(text, { force: true })
    cy.contains('input', 'Add').parent()
      .submit()
      .then(() => {
        cy.get('ul').find('.todo-item:last').find('.checker')
          .invoke('removeClass', 'unchecked')
          .invoke('addClass', 'checked')
        cy.get('.todo-item:last').find('.editable').should('have.css', 'text-decoration').and('match', /line-through/)
      })
  })


  // R8UC2 #2
  it('sets done item to active', () => {
    let text = "New todo item to check";
    cy.get('input[placeholder="Add a new todo item"]')
      .type(text, { force: true })
    cy.contains('input', 'Add').parent()
      .submit()
      .then(() => {
        cy.get('ul').find('.todo-item:last').find('.checker')
          .invoke('removeClass', 'checked')
          .invoke('addClass', 'unchecked')
        cy.get('.todo-item:last').find('.editable').not('have.css', 'text-decoration')
      })
  })


  // R8UC3 #1
  // Denna funkar inte, i verkligheten tas den bort och jag ser anropet till DELETE men får inte till det. Beror detta på samma systemflaw som Julian har pratat om? En ledtråd är att det funkar om man testar manuellt men inte på det här sättet.
  it('removes existing todo item', () => {
    cy.get('ul').find('li').its('length').then(($len) => {
      cy.get('.remover').last()
        .click({ force: true })
      cy.get('ul').find('li').its('length').should('be.lt', $len)
    })
  })
})
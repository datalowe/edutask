describe('Test adding task to video list', () => {
  var backendUrl = 'http://localhost:5000'
  var userEmail = 'jane.doe@gmail.com'

  beforeEach(() => {    
    cy.request('POST', `${backendUrl}/populate`)

    cy.visit('http://localhost:3000')
    cy.contains('div', 'Email Address')
      .find('input')
      .type(userEmail)
    cy.get('form')
      .submit()
    cy.get('img').first()
      .click()
  })

  afterEach(() => {
    cy.request('GET', `${backendUrl}/users/bymail/${userEmail}`).then((uData) => {
        cy.request('DELETE', `${backendUrl}/users/${uData.body._id.$oid}`)
    })
  })

  // R8UC1 #1
  it('adds new task to list', () => {
    let text = "Take out the trash"
    cy.get('li').its('length').then((origLen) => {
      cy.get('input[placeholder="Add a new todo item"]')
        .type(text, { force: true })
      cy.contains('input', 'Add')
        .click()
      cy.get('.todo-item:last')
        .should('contain.text', text)
      cy.get('li').its('length').should('be.gt', origLen)
    })
  })

  // R8UC1 #2 part 1
  it('should not be possible to submit an empty string, meaning the task item list remains the same', () => {
    cy.get('input[placeholder="Add a new todo item"]').clear({ force: true })
    cy.get('ul').find('li').its('length').then(($len) => {
      cy.contains('input', 'Add').click({ force: true })
      cy.get('li').its('length').should('be.eq', $len)
    })
  })

  // R8UC1 #2 part 2
  // test fails, as form border is not updated/set to be red.
  it('should not be possible to submit an empty string, indicated by red form border', () => {
    cy.get('input[placeholder="Add a new todo item"]').clear({ force: true })
    cy.get('ul').find('li').its('length').then(($len) => {
      const addBtn = cy.contains('input', 'Add')
      addBtn.click({ force: true })
      // check that form rgb value has high R val, low G/B vals.
      addBtn.parent().should('have.css', 'borderColor').and('match', /rgb\([1-2]\d\d, \d\d, \d\d\)/)
    })
  })

  // R8UC2 #1
  it('sets active item to done', () => {
    let text = "New todo item to check"
    cy.get('input[placeholder="Add a new todo item"]')
      .type(text, { force: true })
    cy.contains('input', 'Add')
      .click()
      .then(() => {
        cy.get('ul').find('.todo-item:last').find('.checker').click()
        cy.get('.todo-item:last').find('.editable').should('have.css', 'text-decoration').and('match', /line-through/)
      })
  })


  // R8UC2 #2
  it('sets done item to active after', () => {
    let text = "New todo item to check"
    cy.get('input[placeholder="Add a new todo item"]')
      .type(text, { force: true })
    cy.contains('input', 'Add').parent()
      .submit()
      .then(() => {
        cy.get('ul').find('.todo-item:last').find('.checker').click()
        cy.get('ul').find('.todo-item:last').find('.checker').click()
        cy.get('.todo-item:last').find('.editable').not('have.css', 'text-decoration')
      })
  })

  // R8UC3 #1
  // This doesn't work when running tests in Cypress/Chromium, based on the network transfer history
  // it appears that GET/DELETE requests then aren't made in the expected order, leading to the frontend
  // not showing updated data.
  it('removes existing todo item', () => {
    cy.get('ul').find('li').its('length').then(($len) => {
      cy.get('.remover').last()
        .click({ force: true })
      cy.get('ul').find('li').its('length').should('be.lt', $len)
    })
  })
})
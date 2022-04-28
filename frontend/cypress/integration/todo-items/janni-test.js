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

  // // Fungerande test som lägger till en item och kontrollerar dess text, borde vara rimlig nivå för R8UC1 #1
  // it('adds new task to list', () => {
  //   let text = "Take out the trash"
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
  // Denna kollar ändå att listan inte har blivit längre, vilket den har så testet failar men ska faila. 
  // @janni ^ jag har nu ändrat så att det görs ett försök att klicka, som det står i specen. då går testet
  // igenom som väntat. jag kanske missförstått hur testet ska göras dock.
  it('should not be possible to submit an empty string, meaning the task item list remains the same', () => {
    cy.get('input[placeholder="Add a new todo item"]').clear({ force: true })
    cy.get('ul').find('li').its('length').then(($len) => {
      cy.contains('input', 'Add').click({ force: true })
      // @janni jag förstår inte nedan test, varför ska den kolla elementet innan första .todo-item?
      // cy.get('.todo-item').prev().not('have.text', '')
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
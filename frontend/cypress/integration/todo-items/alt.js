describe('Logging into the system', () => {
    const doneItem = "Done item";
    const newItem = "New item";
    const user = {
        email: "jane.doe@gmail.com",
        firstName: "Jane",
        lastName: "Doe"
    }
    const task = {
        title: "Top 10 best cat videos of all time",
        description: "Don't learn anything, just enjoy",
        url: "cbP2N1BQdYc",
        todos: newItem
    }

    const backendUrl = 'http://localhost:5000'
    
    beforeEach(function() {
        // create a fabricated user from a fixture
        cy.request({
            method: 'POST',
            url: `${backendUrl}/users/create`,
            form: true,
            body: user
        }).then((response) => {
            this.uid = response.body._id.$oid

            task.userid = this.uid
                    // Creates a new task
                    cy.request({
                        method: 'POST',
                        url: `${backendUrl}/tasks/create`,
                        form: true,
                        body: task
                    }).then((response) => {
                        // Creates a new todo item
                        cy.request({
                            method: 'POST',
                            url: `${backendUrl}/todos/create`,
                            body: {
                                'taskid': response.body[0]._id.$oid,
                                'description': doneItem
                            },
                            form: true
                        }).then((response) => {
                            // Toggles todo item to 'done'
                            cy.request({
                                method: 'PUT',
                                url: `${backendUrl}/todos/byid/${response.body._id.$oid}`,
                                body: {'data': `{'$set': {'done': true}}`},
                                form: true
                            }).then((response) => {
                                cy.log(response.body)

                                // Visits page
                                cy.visit('http://localhost:3000')
                                cy.contains('div', 'Email Address')
                                    .find('input')
                                    .type(user.email)
                                cy.get('form')
                                    .submit()
                                cy.get('img').first()
                                .click()
                            })
                            
                        })
                    })
        })
    })

    afterEach(function() {
        // clean up by deleting the user from the database
        cy.request('GET', `${backendUrl}/users/bymail/${user.email}`).then((uData) => {
            cy.request('DELETE', `${backendUrl}/users/${uData.body._id.$oid}`)
        })
    })

    it('starting out on the landing screen', () => {
        // make sure the landing page contains a header with "login"
        cy.get('h1')
            .should('contain.text', task.title)
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
        cy.get('li.todo-item').contains(newItem).parent().find('.checker').click()
        cy.wait(1000)
        .then(() => {
            cy.get('li.todo-item').contains(newItem).should('have.css', 'text-decoration').and('match', /line-through/)
        })
    })

    // R8UC2 #2
    it('sets done item to active after', () => {
        cy.get('li.todo-item').contains(doneItem).parent().find('.checker').click()
        .then(() => {
            cy.get('li.todo-item').contains(doneItem).not('have.css', 'text-decoration')
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
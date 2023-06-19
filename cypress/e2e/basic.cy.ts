describe('empty spec', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it("should allow you to register and login", () => {
    const loginForm = {
      email: 'test@example.com',
      password: 'test1234!',
    };
    cy.findByRole("link", { name: /Logg inn/i }).click();
		cy.findByRole("link", { name: /Registrer/i }).click();
    cy.findByRole("textbox", { name: /Epost-adresse/i }).type(loginForm.email);
    cy.findByLabelText(/Passord/i).type(loginForm.password);
    cy.findByRole("button", { name: /Registrer bruker/i }).click();
  })
}) 
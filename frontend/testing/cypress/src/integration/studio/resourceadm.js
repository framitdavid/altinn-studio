/// <reference types="cypress" />
/// <reference types="../../support" />

import * as texts from '@altinn-studio/language/src/nb.json';

// Cypress tests of sub-repo Resourceadm: this is a work in progress

context('Resourceadm', () => {
  before(() => {
    cy.studiologin(Cypress.env('autoTestUser'), Cypress.env('autoTestUserPwd'));
  });

  beforeEach(() => {
    cy.visit('/resourceadm/ttd/ttd-resources/');
  });

  it('is possible to visit Resourceadm main page', () => {
    cy.url().should('include', '/ttd/ttd-resources');
  });

  it('is possible to switch to all, and go to Dashboard via Error page', () => {
    cy.switchSelectedContext('all');
    cy.url().should('include', '/resourceadm/all');
    cy.findByRole('link', {
      name: texts['resourceadm.error_back_to_dashboard'],
    }).click();
    cy.url().should('include', '/dashboard');
  });

  it('is possible to switch to self, and go to Dashboard via Error page', () => {
    cy.switchSelectedContext('self');
    cy.findByRole('link', {
      name: texts['resourceadm.error_back_to_dashboard'],
    }).click();
    cy.url().should('include', '/dashboard');
  });

  it('is possible to switch to all, and return via Redirect page', () => {
    cy.switchSelectedContext('all');
    cy.url().should('include', '/resourceadm/all');
    cy.visit('/resourceadm/ttd/');
    cy.url().should('include', '/ttd/ttd-resources');
  });

  it('is possible to create a new Resource', () => {
    cy.get('button').contains(texts['resourceadm.dashboard_create_resource']).click();
    cy.findByRole('heading', {
      name: texts['resourceadm.dashboard_create_resource'],
    });

    cy.get('#resourceNameInputId').type('cy-ny-ressurs3');
    cy.get('button').contains(texts['resourceadm.dashboard_create_modal_create_button']).click();
  });

  it('is possible to visit Resource page via table edit button', () => {
    cy.findByRole('table').contains(texts['resourceadm.dashboard_table_row_edit']).click();
  });

  it('is possible to return from Resource page via left nav button', () => {
    cy.findByRole('table').contains(texts['resourceadm.dashboard_table_row_edit']).click();
    cy.get('button').contains(texts['resourceadm.left_nav_bar_back']).click();
  });

  it('is possible to visit Resource page and add a policy', () => {
    cy.switchSelectedContext('oneSingleRepoOrg');
    cy.findByRole('table').contains(texts['resourceadm.dashboard_table_row_edit']).click();
    cy.get('button').contains(texts['resourceadm.left_nav_bar_policy']).click();
    cy.findByRole('heading', {
      name: texts['resourceadm.resource_navigation_modal_title_resource'],
    });
    cy.get('[data-cy=navigation_modal_GoOnButton_tag]').click();
    cy.url().should('include', '/policy');
    cy.findByRole('heading', {
      name: texts['resourceadm.policy_editor_title'],
    });
    cy.get('button').contains(texts['policy_editor.card_button_text']).click();
    cy.get('button').contains(texts['resourceadm.left_nav_bar_back']).click();
  });
});

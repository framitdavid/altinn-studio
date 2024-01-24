import * as texts from '../../../../language/src/nb.json';
import * as testids from '../../../testids';

const getUserAppsListHeader = () => cy.findByRole('heading', { name: texts['dashboard.my_apps'] });
const getSearchResultsHeader = () =>
  cy.findByRole('heading', { name: texts['dashboard.search_result'] });
const getUserAppsList = () => getUserAppsListHeader().next();
const getSearchResults = () => getSearchResultsHeader().next();
const getLinksCellForApp = (table, name) =>
  table.findByRole('cell', { name }).siblings("div[data-field='links']");

export const dashboard = {
  getAppOwnerField: () => cy.findByLabelText(texts['general.service_owner']),
  getCancelLink: () => cy.findByRole('link', { name: texts['general.cancel'] }),
  getCreateAppButton: () =>
    cy.findByRole('button', { name: texts['dashboard.create_service_btn'] }),
  getLinksCellForSearchResultApp: (name) => getLinksCellForApp(getSearchResults(), name),
  getNewAppLink: () => cy.findByRole('link', { name: texts['dashboard.new_service'] }),
  getSavedNameField: () => cy.findByRole('textbox', { name: texts['general.service_name'] }),
  getSearchReposField: () => cy.findByTestId(testids.searchReposField),
  getSearchResults,
  getUserAppsList,
  getUserAppsListHeader,
};

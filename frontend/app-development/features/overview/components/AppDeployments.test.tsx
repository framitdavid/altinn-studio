import React from 'react';
import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import { AppDeployments } from './AppDeployments';
import { APP_DEVELOPMENT_BASENAME } from 'app-shared/constants';
import { renderWithProviders } from '../../../test/testUtils';
import { textMock } from '../../../../testing/mocks/i18nMock';
import { deployEnvironment, repository } from 'app-shared/mocks/mocks';

// Test data
const org = 'org';
const app = 'app';

const render = (queries = {}) => {
  return renderWithProviders(<AppDeployments />, {
    startUrl: `${APP_DEVELOPMENT_BASENAME}/${org}/${app}`,
    queries,
  });
};

describe('AppDeployments', () => {
  it('shows loading spinner when loading required data', () => {
    render();

    expect(screen.getByText(textMock('overview.app_loading'))).toBeInTheDocument();
  });

  it('shows an error message if an error occurs while loading data', async () => {
    render({
      getOrgList: jest.fn().mockImplementation(() => Promise.reject()),
    });
    await waitForElementToBeRemoved(() => screen.queryByTitle(textMock('overview.app_loading')));

    expect(screen.getByText(textMock('overview.app_error'))).toBeInTheDocument();
  });

  it('renders page', async () => {
    const envName = 'tt02';
    render({
      getEnvironments: jest.fn().mockImplementation(() =>
        Promise.resolve([
          {
            ...deployEnvironment,
            name: envName,
          },
        ]),
      ),
      getOrgList: jest.fn().mockImplementation(() =>
        Promise.resolve({
          orgs: {
            [org]: {
              environments: [envName],
            },
          },
        }),
      ),
      getRepoMetadata: jest.fn().mockImplementation(() =>
        Promise.resolve({
          ...repository,
          owner: {
            ...repository.owner,
            login: org,
          },
        }),
      ),
    });
    await waitForElementToBeRemoved(() => screen.queryByTitle(textMock('overview.app_loading')));

    expect(screen.getByText(textMock('overview.activity'))).toBeInTheDocument();
  });
});

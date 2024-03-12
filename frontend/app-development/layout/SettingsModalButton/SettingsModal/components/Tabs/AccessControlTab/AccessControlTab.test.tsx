import React from 'react';
import {
  act,
  render as rtlRender,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import type { AccessControlTabProps } from './AccessControlTab';
import { AccessControlTab } from './AccessControlTab';
import { textMock } from '../../../../../../../testing/mocks/i18nMock';
import { createQueryClientMock } from 'app-shared/mocks/queryClientMock';
import type { ServicesContextProps } from 'app-shared/contexts/ServicesContext';
import { ServicesContextProvider } from 'app-shared/contexts/ServicesContext';
import type { QueryClient, UseMutationResult } from '@tanstack/react-query';
import { useAppMetadataMutation } from 'app-development/hooks/mutations';
import type { ApplicationMetadata } from 'app-shared/types/ApplicationMetadata';
import { mockAppMetadata } from '../../../mocks/applicationMetadataMock';
import userEvent from '@testing-library/user-event';

const mockApp: string = 'app';
const mockOrg: string = 'org';

jest.mock('../../../../../../hooks/mutations/useAppMetadataMutation');
const updateAppMetadataMutation = jest.fn();
const mockUpdateAppMetadataMutation = useAppMetadataMutation as jest.MockedFunction<
  typeof useAppMetadataMutation
>;
mockUpdateAppMetadataMutation.mockReturnValue({
  mutate: updateAppMetadataMutation,
} as unknown as UseMutationResult<void, Error, ApplicationMetadata, unknown>);

const getAppMetadata = jest.fn().mockImplementation(() => Promise.resolve({}));

const defaultProps: AccessControlTabProps = {
  org: mockOrg,
  app: mockApp,
};

describe('AccessControlTab', () => {
  afterEach(jest.clearAllMocks);

  it('renders the header', async () => {
    render();
    const header = screen.getByRole('heading', {
      name: textMock('settings_modal.access_control_tab_heading'),
    });
    expect(header).toBeInTheDocument();
  });

  it('renders the columnheader', async () => {
    render();
    await waitForElementToBeRemoved(() =>
      screen.queryByTitle(textMock('settings_modal.loading_content')),
    );
    const columnHeader = screen.getByRole('columnheader', {
      name: textMock('settings_modal.access_control_tab_option_all_type_partner'),
    });
    expect(columnHeader).toBeInTheDocument();
  });

  it('initially displays the spinner when loading data', () => {
    render();

    expect(screen.getByTitle(textMock('settings_modal.loading_content'))).toBeInTheDocument();
  });

  it('fetches appMetadata on mount', () => {
    render();
    expect(getAppMetadata).toHaveBeenCalledTimes(1);
  });

  it('shows an error message if an error occured on the getAppMetadata query', async () => {
    const errorMessage = 'error-message-test';
    render({}, { getAppMetadata: () => Promise.reject({ message: errorMessage }) });

    await waitForElementToBeRemoved(() =>
      screen.queryByTitle(textMock('settings_modal.loading_content')),
    );

    expect(screen.getByText(textMock('general.fetch_error_message'))).toBeInTheDocument();
    expect(screen.getByText(textMock('general.error_message_with_colon'))).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should render all checkboxes', async () => {
    getAppMetadata.mockImplementation(() => Promise.resolve(mockAppMetadata));
    render();
    await waitForElementToBeRemoved(() =>
      screen.queryByTitle(textMock('settings_modal.loading_content')),
    );

    const bankruptcyEstateCheckbox = screen.getByRole('row', {
      name: textMock('settings_modal.access_control_tab_option_bankruptcy_estate'),
    });
    expect(bankruptcyEstateCheckbox).toBeInTheDocument();

    const organisationCheckbox = screen.getByRole('row', {
      name: textMock('settings_modal.access_control_tab_option_organisation'),
    });
    expect(organisationCheckbox).toBeInTheDocument();

    const personCheckbox = screen.getByRole('row', {
      name: textMock('settings_modal.access_control_tab_option_person'),
    });
    expect(personCheckbox).toBeInTheDocument();

    const subUnitCheckbox = screen.getByRole('row', {
      name: textMock('settings_modal.access_control_tab_option_sub_unit'),
    });
    expect(subUnitCheckbox).toBeInTheDocument();
  });

  it('should render all checkboxes as unchecked when applicationMetadata does not contain partyTypes allowed', async () => {
    getAppMetadata.mockImplementation(() =>
      Promise.resolve({ ...mockAppMetadata, partyTypesAllowed: null }),
    );
    render();
    await waitForElementToBeRemoved(() =>
      screen.queryByTitle(textMock('settings_modal.loading_content')),
    );

    const bankruptcyEstateCheckbox = screen.getByRole('row', {
      name: textMock('settings_modal.access_control_tab_option_bankruptcy_estate'),
    });
    expect(bankruptcyEstateCheckbox).not.toBeChecked();

    const organisationCheckbox = screen.getByRole('row', {
      name: textMock('settings_modal.access_control_tab_option_organisation'),
    });
    expect(organisationCheckbox).not.toBeChecked();

    const personCheckbox = screen.getByRole('row', {
      name: textMock('settings_modal.access_control_tab_option_person'),
    });
    expect(personCheckbox).not.toBeChecked();

    const subUnitCheckbox = screen.getByRole('row', {
      name: textMock('settings_modal.access_control_tab_option_sub_unit'),
    });
    expect(subUnitCheckbox).not.toBeChecked();
  });

  it('should render all checkboxes labels with the correct values based on the party types allowed', async () => {
    getAppMetadata.mockImplementation(() =>
      Promise.resolve({
        ...mockAppMetadata,
        partyTypesAllowed: {
          bankruptcyEstate: true,
          organisation: true,
          person: true,
          subUnit: true,
        },
      }),
    );

    render();
    await waitForElementToBeRemoved(() =>
      screen.queryByTitle(textMock('settings_modal.loading_content')),
    );

    const bankruptcyEstateCheckbox = screen.getByRole('row', {
      name: textMock('settings_modal.access_control_tab_option_bankruptcy_estate'),
    });
    expect(bankruptcyEstateCheckbox).toBeInTheDocument();

    const organisationCheckbox = screen.getByRole('row', {
      name: textMock('settings_modal.access_control_tab_option_organisation'),
    });
    expect(organisationCheckbox).toBeInTheDocument();

    const personCheckbox = screen.getByRole('row', {
      name: textMock('settings_modal.access_control_tab_option_person'),
    });
    expect(personCheckbox).toBeInTheDocument();

    const subUnitCheckbox = screen.getByRole('row', {
      name: textMock('settings_modal.access_control_tab_option_sub_unit'),
    });
    expect(subUnitCheckbox).toBeInTheDocument();
  });

  it('handles checkbox changes', async () => {
    const user = userEvent.setup();
    await resolveAndWaitForSpinnerToDisappear();

    const organisationCheckboxBefore = screen.getByRole('row', {
      name: textMock('settings_modal.access_control_tab_option_organisation'),
    });
    expect(organisationCheckboxBefore).not.toBeChecked();

    await act(() => user.click(organisationCheckboxBefore));

    expect(updateAppMetadataMutation).toHaveBeenCalledTimes(1);
    expect(updateAppMetadataMutation).toHaveBeenCalledWith({
      ...mockAppMetadata,
      partyTypesAllowed: {
        bankruptcyEstate: true,
        organisation: true,
        person: false,
        subUnit: false,
      },
    });
  });

  it('renders the documentation link with the correct text', async () => {
    render();
    await waitForElementToBeRemoved(() =>
      screen.queryByTitle(textMock('settings_modal.loading_content')),
    );

    const documentationLink = screen.getByText(
      textMock('settings_modal.access_control_tab_option_access_control_docs_link_text'),
    );
    expect(documentationLink).toBeInTheDocument();
  });
});

const resolveAndWaitForSpinnerToDisappear = async (props: Partial<AccessControlTabProps> = {}) => {
  getAppMetadata.mockImplementation(() => Promise.resolve(mockAppMetadata));
  render(props);
  await waitForElementToBeRemoved(() =>
    screen.queryByTitle(textMock('settings_modal.loading_content')),
  );
};

const render = (
  props: Partial<AccessControlTabProps> = {},
  queries: Partial<ServicesContextProps> = {},
  queryClient: QueryClient = createQueryClientMock(),
) => {
  const allQueries: ServicesContextProps = {
    getAppMetadata,
    ...queries,
  };

  return rtlRender(
    <ServicesContextProvider {...allQueries} client={queryClient}>
      <AccessControlTab {...defaultProps} {...props} />
    </ServicesContextProvider>,
  );
};

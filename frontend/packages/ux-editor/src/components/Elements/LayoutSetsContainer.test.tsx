import React from 'react';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LayoutSetsContainer } from './LayoutSetsContainer';
import { queryClientMock } from 'app-shared/mocks/queryClientMock';
import { renderWithProviders } from '../../testing/mocks';
import { layoutSetsMock, layout1NameMock } from '../../testing/layoutMock';
import type { AppContextProps } from '../../AppContext';
import { QueryKey } from 'app-shared/types/QueryKey';

// Test data
const org = 'org';
const app = 'app';
const layoutSetName1 = layoutSetsMock.sets[0].id;
const layoutSetName2 = layoutSetsMock.sets[1].id;
const selectedLayoutSet = layout1NameMock;
const setSelectedLayoutSetMock = jest.fn();

describe('LayoutSetsContainer', () => {
  it('renders component', async () => {
    render();

    expect(await screen.findByRole('option', { name: layoutSetName1 })).toBeInTheDocument();
    expect(await screen.findByRole('option', { name: layoutSetName2 })).toBeInTheDocument();
  });

  it('NativeSelect should be rendered', async () => {
    render();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('Should update selected layout set when set is clicked in native select', async () => {
    render();
    const user = userEvent.setup();
    await act(() => user.selectOptions(screen.getByRole('combobox'), layoutSetName2));
    expect(setSelectedLayoutSetMock).toHaveBeenCalledTimes(1);
  });
});

const render = () => {
  queryClientMock.setQueryData([QueryKey.LayoutSets, org, app], layoutSetsMock);
  const appContextProps: Partial<AppContextProps> = {
    selectedFormLayoutSetName: selectedLayoutSet,
    setSelectedFormLayoutSetName: setSelectedLayoutSetMock,
  };
  return renderWithProviders(<LayoutSetsContainer />, {
    appContextProps,
  });
};

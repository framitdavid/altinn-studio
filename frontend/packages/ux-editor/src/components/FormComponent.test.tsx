import React from 'react';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import type { IFormComponentProps } from './FormComponent';
import { FormComponent } from './FormComponent';
import { renderHookWithMockStore, renderWithMockStore } from '../testing/mocks';
import { component1IdMock, component1Mock } from '../testing/layoutMock';
import { textMock } from '../../../../testing/mocks/i18nMock';
import { useTextResourcesQuery } from 'app-shared/hooks/queries/useTextResourcesQuery';
import { ITextResource } from 'app-shared/types/global';
import { useDeleteFormComponentMutation } from '../hooks/mutations/useDeleteFormComponentMutation';
import { UseMutationResult } from '@tanstack/react-query';
import { IInternalLayout } from '../types/global';

const user = userEvent.setup();

// Test data:
const org = 'org';
const app = 'app';
const testTextResourceKey = 'test-key';
const testTextResourceValue = 'test-value';
const emptyTextResourceKey = 'empty-key';
const testTextResource: ITextResource = { id: testTextResourceKey, value: testTextResourceValue };
const emptyTextResource: ITextResource = { id: emptyTextResourceKey, value: '' };
const nbTextResources: ITextResource[] = [testTextResource, emptyTextResource];
const handleEditMock = jest.fn().mockImplementation(() => Promise.resolve());
const handleSaveMock = jest.fn();
const debounceSaveMock = jest.fn();
const handleDiscardMock = jest.fn();

jest.mock('../hooks/mutations/useDeleteFormComponentMutation');
const mockDeleteFormComponent = jest.fn();
const mockUseDeleteFormComponentMutation = useDeleteFormComponentMutation as jest.MockedFunction<typeof useDeleteFormComponentMutation>;
mockUseDeleteFormComponentMutation.mockReturnValue({
  mutate: mockDeleteFormComponent,
} as unknown as UseMutationResult<IInternalLayout, unknown, string, unknown>);

describe('FormComponent', () => {
  afterEach(jest.clearAllMocks);

  it('should render the component', async () => {
    await render();

    expect(screen.getByRole('button', { name: textMock('general.delete') })).toBeInTheDocument();
  });

  it('should delete when clicking the Delete button', async () => {
    await render();

    const button = screen.getByRole('button', { name: textMock('general.delete') });
    await act(() => user.click(button));

    expect(mockDeleteFormComponent).toHaveBeenCalledTimes(1);
  });

  it('should delete and discard when clicking the Delete button on the component being edited', async () => {
    await render({
      isEditMode: true,
    });

    const button = screen.getByRole('button', { name: textMock('general.delete') });
    await act(() => user.click(button));

    expect(mockUseDeleteFormComponentMutation).toHaveBeenCalledTimes(1);
    expect(handleDiscardMock).toHaveBeenCalledTimes(1);
  });

  it('should edit the component when clicking on the component', async () => {
    await render();

    const component = screen.getByText(textMock('ux_editor.component_input'));
    await act(() => user.click(component));

    expect(handleSaveMock).toBeCalledTimes(1);
    expect(handleEditMock).toBeCalledTimes(1);
  });

  describe('title', () => {
    it('should display the title', async () => {
      await render({
        component: {
          ...component1Mock,
          textResourceBindings: {
            title: testTextResourceKey
          },
        }
      });

      expect(screen.getByText(testTextResourceValue)).toBeInTheDocument();
    });

    it('should display the component type when the title is empty', async () => {
      await render({
        component: {
          ...component1Mock,
          textResourceBindings: {
            title: emptyTextResourceKey,
          },
        },
      });

      expect(screen.getByText(textMock('ux_editor.component_input'))).toBeInTheDocument();
    });

    it('should display the component type when the title is undefined', async () => {
      await render({
        component: {
          ...component1Mock,
          textResourceBindings: {
            title: undefined,
          },
        }
      });

      expect(screen.getByText(textMock('ux_editor.component_input'))).toBeInTheDocument();
    });

    it('should display "Unknown component" when both the title and the component type are undefined', async () => {
      await render({
        component: {
          ...component1Mock,
          textResourceBindings: undefined,
          type: undefined,
        }
      });

      expect(screen.getByText(textMock('ux_editor.component_unknown'))).toBeInTheDocument();
    });
  })
});

const waitForData = async () => {
  const { result: texts } = renderHookWithMockStore({}, {
    getTextResources: () => Promise.resolve({ language: 'nb', resources: nbTextResources })
  })(() => useTextResourcesQuery(org, app)).renderHookResult;
  await waitFor(() => expect(texts.current.isSuccess).toBe(true));
};

const render = async (props: Partial<IFormComponentProps> = {}) => {
  const allProps: IFormComponentProps = {
    id: component1IdMock,
    isEditMode: false,
    component: component1Mock,
    handleEdit: handleEditMock,
    handleSave: handleSaveMock,
    debounceSave: debounceSaveMock,
    handleDiscard: handleDiscardMock,
    ...props
  };

  await waitForData();

  return renderWithMockStore()(
    <DndProvider backend={HTML5Backend}>
      <FormComponent {...allProps} />
    </DndProvider>
  );
};

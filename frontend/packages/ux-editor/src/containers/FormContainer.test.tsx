import React from 'react';
import { screen } from '@testing-library/react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import type { IFormContainerProps } from './FormContainer';
import { FormContainer } from './FormContainer';
import { renderWithMockStore } from '../testing/mocks';
import { container1IdMock, layoutMock } from '../testing/layoutMock';

const handleDiscardMock = jest.fn();
const handleEditMock = jest.fn();

describe('FormContainer', () => {
  afterEach(jest.clearAllMocks);

  it('Renders children', async () => {
    const childComponentTestid = 'childComponent';
    const childComponent = <div data-testid={childComponentTestid}/>;
    await render({ children: childComponent });
    expect(screen.getByTestId(childComponentTestid)).toBeInTheDocument();
  });
});

const render = async (props: Partial<IFormContainerProps> = {}) => {
  const allProps: IFormContainerProps = {
    isBaseContainer: false,
    id: container1IdMock,
    container: layoutMock.containers[container1IdMock],
    handleEdit: handleEditMock,
    handleDiscard: handleDiscardMock,
    children: [],
    isEditMode: false,
    nestedGroupCount: jest.fn(),
    ...props,
  };

  return renderWithMockStore()(
    <DndProvider backend={HTML5Backend}>
      <FormContainer {...allProps} />
    </DndProvider>
  );
};

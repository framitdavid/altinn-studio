import { FormLayoutImpl } from './FormLayoutImpl';
import {
  component1IdMock,
  component1Mock,
  container1IdMock,
  layoutMock,
} from '../testing/layoutMock';
import { BASE_CONTAINER_ID } from 'app-shared/constants';
import { deepCopy } from 'app-shared/pure';
import { ComponentType } from 'app-shared/types/ComponentType';

describe('FormLayoutImpl', () => {
  const createFormLayout = () => new FormLayoutImpl(layoutMock);

  describe('getFormItemById', () => {
    it('Returns a component when the given id is a component id', () => {
      const formLayout = createFormLayout();
      const formItem = formLayout.getFormItemById(component1IdMock);
      expect(formItem).toEqual(component1Mock);
    });

    it('Returns a container when the given id is a container id', () => {
      const formLayout = createFormLayout();
      const formItem = formLayout.getFormItemById(container1IdMock);
      expect(formItem).toEqual(layoutMock.containers[container1IdMock]);
    });

    it('Returns undefined when the given id is not found', () => {
      const formLayout = createFormLayout();
      const formItem = formLayout.getFormItemById('badId');
      expect(formItem).toBeUndefined();
    });
  });

  describe('getNumberOfItems', () => {
    it('Returns the number of items', () => {
      const formLayout = createFormLayout();
      expect(formLayout.getNumberOfItems()).toEqual(3);
    });
  });

  describe('getParentId', () => {
    it('Returns the parent id of the given component', () => {
      const formLayout = createFormLayout();
      expect(formLayout.getParentId(component1IdMock)).toEqual(container1IdMock);
    });

    it('Returns the base container id if the given item is a top level item', () => {
      const formLayout = createFormLayout();
      expect(formLayout.getParentId(container1IdMock)).toEqual(BASE_CONTAINER_ID);
    });

    it('Returns undefined if the given item is not found', () => {
      const formLayout = createFormLayout();
      expect(formLayout.getParentId('badId')).toBeUndefined();
    });
  });

  describe('hasNavigationButtons', () => {
    it('Returns true if the layout has navigation buttons', () => {
      const layoutWithNavigationButtons = deepCopy(layoutMock);
      layoutWithNavigationButtons.components[component1IdMock].type =
        ComponentType.NavigationButtons;
      const layoutWithNavigationButtonsImpl = new FormLayoutImpl(layoutWithNavigationButtons);
      expect(layoutWithNavigationButtonsImpl.hasNavigationButtons()).toBe(true);
    });

    it('Returns false if the layout does not have navigation buttons', () => {
      const formLayoutImpl = createFormLayout();
      expect(formLayoutImpl.hasNavigationButtons()).toBe(false);
    });
  });
});

import {
  IFormDesignerComponents,
  IFormDesignerContainers,
  IFormLayoutOrder,
  IInternalLayout,
} from '../types/global';
import { KeyValuePairs } from 'app-shared/types/KeyValuePairs';
import { FormComponent } from '../types/FormComponent';
import { FormContainer } from '../types/FormContainer';
import { SimpleComponentType } from '../types/SimpleComponentType';
import { ComponentType } from 'app-shared/types/ComponentType';
import { BASE_CONTAINER_ID } from 'app-shared/constants';

export class FormLayoutImpl implements IInternalLayout {
  components: IFormDesignerComponents;
  containers: IFormDesignerContainers;
  order: IFormLayoutOrder;
  customRootProperties: KeyValuePairs;
  customDataProperties: KeyValuePairs;

  constructor(layout: IInternalLayout) {
    this.components = layout.components;
    this.containers = layout.containers;
    this.order = layout.order;
    this.customRootProperties = layout.customRootProperties;
    this.customDataProperties = layout.customDataProperties;
  }

  public getFormItemById = (id: string): FormComponent | FormContainer | undefined =>
    this.getAllFormItems()[id];

  public getNumberOfItems = (): number => this.allFormItemsAsArray().length;

  public hasNavigationButtons = (): boolean =>
    this.hasComponentOfType(ComponentType.NavigationButtons);

  public getParentId = (itemId: string): string =>
    this.getContainerIdList().find((key) => this.order[key].includes(itemId));

  private allFormItemsAsArray = (): (FormComponent | FormContainer)[] =>
    Object.values(this.getAllFormItems());

  private getAllFormItems = () => {
    const allItems = {
      ...this.components,
      ...this.containers,
    };
    delete allItems[BASE_CONTAINER_ID];
    return allItems;
  };

  private hasComponentOfType = (type: SimpleComponentType): boolean =>
    this.componentsAsArray().some((component) => component.type === type);

  private componentsAsArray = () => Object.values(this.components);

  private getContainerIdList = (): string[] => Object.keys(this.containers);
}

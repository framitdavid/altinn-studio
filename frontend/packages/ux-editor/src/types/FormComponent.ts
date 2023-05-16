import { ComponentType } from '../components';
import { ICreateFormComponent, IOption } from './global';

export interface FormComponentBase<T extends ComponentType = ComponentType> extends ICreateFormComponent {
  id: string;
  itemType: 'COMPONENT';
  type: T;
  disabled?: boolean;
  required?: boolean;
  hidden?: boolean;
  readOnly?: boolean;
  [id: string]: any;
}

interface FormOptionsComponentBase<T extends ComponentType> extends FormComponentBase<T> {
  options: IOption[];
  preselectedOptionIndex?: number;
  optionsId: string;
}

export interface FormHeaderComponent extends FormComponentBase<ComponentType.Header> {
  size: string; // Todo: We need to distinguish between size and level
}

export type FormParagraphComponent = FormComponentBase<ComponentType.Paragraph>;

export interface FormInputComponent extends FormComponentBase<ComponentType.Input> {
  disabled?: boolean;
}

export interface FormImageComponent extends FormComponentBase<ComponentType.Image> {
  image?: {
    src?: {
      [lang: string]: string;
    };
    align?: string | null;
    width?: string;
  };
}

export interface FormDatepickerComponent extends FormComponentBase<ComponentType.Datepicker> {
  timeStamp: boolean;
}

export interface FormDropdownComponent extends FormComponentBase<ComponentType.Dropdown> {
  optionsId: string;
}

export type FormCheckboxesComponent = FormOptionsComponentBase<ComponentType.Checkboxes>;
export type FormRadioButtonsComponent = FormOptionsComponentBase<ComponentType.RadioButtons>;
export type FormTextareaComponent = FormComponentBase<ComponentType.TextArea>;

export interface FormFileUploaderComponent extends FormComponentBase<ComponentType.FileUpload> {
  description: string;
  hasCustomFileEndings: boolean;
  maxFileSizeInMB: number;
  displayMode: string;
  maxNumberOfAttachments: number;
  minNumberOfAttachments: number;
  validFileEndings?: string;
}

export interface FormFileUploaderWithTagComponent extends FormComponentBase<ComponentType.FileUploadWithTag> {
  description: string;
  hasCustomFileEndings: boolean;
  maxFileSizeInMB: number;
  maxNumberOfAttachments: number;
  minNumberOfAttachments: number;
  validFileEndings?: string;
  optionsId: string;
}

export interface FormButtonComponent extends FormComponentBase<ComponentType.Button | ComponentType.NavigationButtons> {
  onClickAction: () => void;
}

export interface FormAddressComponent extends FormComponentBase<ComponentType.AddressComponent> {
  simplified: boolean;
}

export type FormGroupComponent = FormComponentBase<ComponentType.Group>;
export type FormNavigationBarComponent = FormComponentBase<ComponentType.NavigationBar>;
export type FormAttachmentListComponent = FormComponentBase<ComponentType.AttachmentList>;

export interface FormThirdPartyComponent extends FormComponentBase<ComponentType.ThirdParty> {
  tagName: string;
  framework: string;
  [id: string]: any;
}

export interface FormPanelComponent extends FormComponentBase<ComponentType.Panel> {
  variant: {
    title: string;
    description: string;
    type: string;
    enum: 'info' | 'warning' | 'success';
    default: 'info';
  };
  showIcon: {
    title: string;
    description: string;
    type: boolean;
    default: true;
  };
}

export interface FormMapComponent extends FormComponentBase<ComponentType.Map> {
  centerLocation: {
    latitude: number;
    longitude: number;
  };
  zoom: number;
  layers?: {
    url: string;
    attribution?: string;
    subdomains?: string[];
  }[];
}

export type FormComponent =
  | FormHeaderComponent
  | FormParagraphComponent
  | FormInputComponent
  | FormImageComponent
  | FormDatepickerComponent
  | FormDropdownComponent
  | FormCheckboxesComponent
  | FormRadioButtonsComponent
  | FormTextareaComponent
  | FormFileUploaderComponent
  | FormFileUploaderWithTagComponent
  | FormButtonComponent
  | FormAddressComponent
  | FormGroupComponent
  | FormNavigationBarComponent
  | FormAttachmentListComponent
  | FormThirdPartyComponent
  | FormPanelComponent
  | FormMapComponent;
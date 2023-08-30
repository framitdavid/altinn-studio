import type { IGenericEditComponent } from '../componentConfig';
import { getMinOccursFromDataModel, getXsdDataTypeFromDataModel } from '../../../utils/datamodel';
import { ComponentType } from 'app-shared/types/ComponentType';
import React from 'react';
import { useText } from '../../../hooks';
import { SelectDataModelComponent } from '../SelectDataModelComponent';
import { useDatamodelMetadataQuery } from '../../../hooks/queries/useDatamodelMetadataQuery';
import { useParams } from 'react-router-dom';

export interface EditDataModelBindingsProps extends IGenericEditComponent {
  renderOptions?: {
    label?: string;
    returnValue?: any;
    key?: string;
    uniqueKey?: any;
  };
  helpText?: string;
}

export const EditDataModelBindings = ({
  component,
  handleComponentChange,
  renderOptions,
  helpText,
}: EditDataModelBindingsProps) => {
  const { org, app } = useParams();
  const { data } = useDatamodelMetadataQuery(org, app);
  const t = useText();

  const handleDataModelChange = (selectedDataModelElement: string, key = 'simpleBinding') => {
    handleComponentChange({
      ...component,
      dataModelBindings: {
        ...component.dataModelBindings,
        [key]: selectedDataModelElement,
      },
      required: getMinOccursFromDataModel(selectedDataModelElement, data) > 0,
      timeStamp:
        component.type === ComponentType.Datepicker
          ? getXsdDataTypeFromDataModel(selectedDataModelElement, data) === 'DateTime'
          : undefined,
    });
  };

  const { uniqueKey, key, label } = renderOptions || {};
  return (
    <div key={uniqueKey || ''}>
      <SelectDataModelComponent
        propertyPath={`definitions/component/properties/dataModelBindings/properties/${
          key || 'simpleBinding'
        }`}
        label={
          label
            ? `${t('ux_editor.modal_properties_data_model_helper')} ${t('general.for')} ${label}`
            : t('ux_editor.modal_properties_data_model_helper')
        }
        componentType={component.type}
        inputId={`selectDataModelSelect-${label}`}
        selectedElement={
          component.dataModelBindings
            ? component.dataModelBindings[key || 'simpleBinding']
            : undefined
        }
        onDataModelChange={(dataModelField: string) => handleDataModelChange(dataModelField, key)}
        noOptionsMessage={t('general.no_options')}
        helpText={helpText}
      />
    </div>
  );
};

import React from 'react';
import { LegacyCheckbox } from '@digdir/design-system-react';
import type { IGenericEditComponent } from '../componentConfig';
import { useText } from '../../../hooks';
import { FormField } from '../../FormField';

export const EditRequired = ({ component, handleComponentChange }: IGenericEditComponent) => {
  const t = useText();

  const handleChange = () => {
    handleComponentChange({
      ...component,
      required: !component.required,
    });
  };

  return (
    <FormField
      id={component.id}
      label={t('ux_editor.modal_configure_required')}
      value={component.required}
      onChange={handleChange}
      propertyPath='definitions/component/properties/required'
    >
      {({ value, onChange }) => (
        <LegacyCheckbox checked={value} onChange={(e) => onChange(e.target.checked, e)} />
      )}
    </FormField>
  );
};

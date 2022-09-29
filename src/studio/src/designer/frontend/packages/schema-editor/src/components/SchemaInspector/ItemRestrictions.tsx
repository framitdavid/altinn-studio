import React, { MouseEvent } from 'react';
import { Checkbox, FormControlLabel } from '@material-ui/core';
import { getTranslation } from '../../utils/language';
import { FieldType, ILanguage, Restriction, UiSchemaItem } from '../../types';
import { EnumField } from './EnumField';
import { addEnum, deleteEnum, setRequired, setRestriction } from '../../features/editor/schemaEditorSlice';
import { useDispatch } from 'react-redux';
import { ArrayRestrictions } from './restrictions/ArrayRestrictions';
import { NumberRestrictions } from './restrictions/NumberRestrictions';
import { ObjectRestrictions } from './restrictions/ObjectRestrictions';
import { StringRestrictions } from './restrictions/StringRestrictions';
import classes from './ItemRestrictions.module.css';
import { Divider } from './Divider';
import { Fieldset } from './Fieldset';
import { Button } from '@altinn/altinn-design-system';

export interface RestrictionItemProps {
  restrictions: Restriction[];
  readonly: boolean;
  path: string;
  language: ILanguage;
  onChangeRestrictionValue: (id: string, key: string, value: string) => void;
}
interface Props {
  item: UiSchemaItem;
  language: ILanguage;
}
export const ItemRestrictions = ({ item, language }: Props) => {
  const dispatch = useDispatch();
  const handleRequiredChanged = (e: any, checked: boolean) => {
    if (checked !== item.isRequired) {
      dispatch(
        setRequired({
          path: item.path,
          key: item.displayName,
          required: checked,
        }),
      );
    }
  };

  const onChangeRestrictionValue = (path: string, value: any, key: string) =>
    dispatch(
      setRestriction({
        path,
        value: isNaN(value) ? value : +value,
        key,
      }),
    );

  const onChangeEnumValue = (value: string, oldValue?: string) =>
    dispatch(
      addEnum({
        path: item.path,
        value,
        oldValue,
      }),
    );

  const onDeleteEnumClick = (path: string, value: string) => dispatch(deleteEnum({ path, value }));

  const dispatchAddEnum = () => {
    if (item) {
      dispatch(
        addEnum({
          path: item.path,
          value: 'value',
        }),
      );
    }
  };
  const onAddEnumButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    dispatchAddEnum();
  };

  const t = (key: string) => getTranslation(key, language);
  const restrictionProps: RestrictionItemProps = {
    restrictions: item.restrictions ?? [],
    readonly: item.$ref !== undefined,
    path: item.path,
    onChangeRestrictionValue,
    language,
  };
  return (
    <div>
      <FormControlLabel
        control={<Checkbox checked={item.isRequired} onChange={handleRequiredChanged} name='checkedRequired' />}
        label={t('required')}
      />
      {item.$ref === undefined && (
        {
          [FieldType.Array]: <ArrayRestrictions {...restrictionProps} />,
          [FieldType.Boolean]: null,
          [FieldType.Integer]: <NumberRestrictions {...restrictionProps} />,
          [FieldType.Number]: <NumberRestrictions {...restrictionProps} />,
          [FieldType.Object]: <ObjectRestrictions {...restrictionProps} />,
          [FieldType.String]: <StringRestrictions {...restrictionProps} />,
          [FieldType.Null]: undefined,
          default: undefined,
        }[item.type ?? 'default']
      )}
      {item.type !== FieldType.Object && (
        <>
          <Divider />
          <Fieldset legend={t('enum_legend')}>
            {!item.enum?.length && <p className={classes.emptyEnumMessage}>{t('enum_empty')}</p>}
            {item.enum?.map((value: string, index) => (
              <EnumField
                fullWidth={true}
                key={'add-enum-field-' + index}
                language={language}
                onChange={onChangeEnumValue}
                onDelete={onDeleteEnumClick}
                onEnterKeyPress={dispatchAddEnum}
                path={item.path}
                value={value}
              />
            ))}
            <Button
              aria-label={t('add_enum')}
              className={classes.addEnumButton}
              id='add-enum-button'
              onClick={onAddEnumButtonClick}
            >
              <i/>
              <span>{t('add_enum')}</span>
            </Button>
          </Fieldset>
        </>
      )}
    </div>
  );
};
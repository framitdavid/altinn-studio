import React, { useEffect } from 'react';
import { Combobox, Switch } from '@digdir/design-system-react';
import type { IGenericEditComponent } from '../../componentConfig';
import { useAppMetadataQuery } from 'app-development/hooks/queries';
import { useStudioUrlParams } from 'app-shared/hooks/useStudioUrlParams';
import { useLayoutSetsQuery } from '../../../../hooks/queries/useLayoutSetsQuery'; //Why is this path different from useAppMetadataQuery?
import { useAppContext } from '../../../../hooks/useAppContext';
import { useTranslation } from 'react-i18next';
import type { ApplicationMetadata, DataTypeElement } from 'app-shared/types/ApplicationMetadata';
import type { LayoutSets } from 'app-shared/types/api/LayoutSetsResponse';
import classes from './AttachmentListComponent.module.css';
import { useFormContext } from '../../../../containers/FormContext';

export const AttachmentListComponent = ({
  component,
  handleComponentChange,
}: IGenericEditComponent) => {
  const [onlyCurrentTask, setOnlyCurrentTask] = React.useState(false);
  const { t } = useTranslation();
  const { org, app } = useStudioUrlParams();
  const { data: layoutSets } = useLayoutSetsQuery(org, app);

  const {
    // status: appMetadataStatus, // TODO: find out if this is needed (pending status)
    data: appMetadata,
    // error: appMetadataError, // TODO: find out if this is needed
  } = useAppMetadataQuery(org, app);
  const { selectedLayoutSet } = useAppContext();
  const tasks: string[] = getTasks(layoutSets, selectedLayoutSet, onlyCurrentTask);
  const dataTypes: string[] = getDataTypes(appMetadata, tasks);

  const handleValueChanges = (updateDataTypes: string[]) => {
    const componentHasSpecialVariants =
      component.dataTypeIds.includes('include-attachments') ||
      component.dataTypeIds.includes('include-all');
    const updateHasBothSpecialVariants =
      updateDataTypes.includes('include-attachments') && updateDataTypes.includes('include-all');
    const updateHasSpecialVariants =
      updateDataTypes.includes('include-attachments') || updateDataTypes.includes('include-all');

    if (updateHasBothSpecialVariants) {
      updateDataTypes = updateDataTypes.filter((dataType) => dataType !== component.dataTypeIds[0]);
    } else if (componentHasSpecialVariants && updateDataTypes.length > 1) {
      updateDataTypes = updateDataTypes.filter(
        (dataType) => dataType !== 'include-all' && dataType !== 'include-attachments',
      );
    } else if (updateHasSpecialVariants) {
      updateDataTypes = updateDataTypes.filter(
        (dataType) => dataType === 'include-all' || dataType === 'include-attachments',
      );
    }
    handleComponentChange({ ...component, dataTypeIds: updateDataTypes });
  };

  const checkForAvailableDataTypes = () => {
    if (onlyCurrentTask) {
      const filteredDataTypes = component.dataTypeIds.filter((dataType: string) =>
        dataTypes.includes(dataType),
      );
      return filteredDataTypes;
    }
    return component.dataTypeIds;
  };

  //* TODO: Find out in designsystem if Combobox does have any sort/filter method
  return (
    <>
      <Switch onChange={() => setOnlyCurrentTask(!onlyCurrentTask)} size='small'>
        {t('ux_editor.component_properties.current_task')}
      </Switch>
      <Combobox
        multiple
        label={t('ux_editor.component_properties.select_attachments')}
        className={classes.comboboxLabel}
        size='small'
        value={checkForAvailableDataTypes()}
        onValueChange={handleValueChanges}
      >
        {dataTypes.map((dataType) => {
          return (
            <Combobox.Option
              key={dataType}
              value={dataType}
              description={getDescription(dataType)}
              displayValue={getDescription(dataType)}
            />
          );
        })}
      </Combobox>
    </>
  );
};

const getTasks = (layoutSets: LayoutSets, selectedLayoutSet: string, onlyCurrentTask: boolean) => {
  const currentTask = () =>
    layoutSets.sets.find((layoutSet) => layoutSet.id === selectedLayoutSet).tasks ?? [];

  const sampleTasks = () => {
    const tasks = [];
    for (const layoutSet of layoutSets.sets) {
      tasks.push(...layoutSet.tasks);
      if (layoutSet.id === selectedLayoutSet) {
        break;
      }
    }
    return tasks;
  };

  return onlyCurrentTask ? currentTask() : sampleTasks();
};

const getDataTypes = (appMetadata: ApplicationMetadata, tasks: string[]) => {
  const filteredDataTypes = appMetadata?.dataTypes.filter(
    (dataType: DataTypeElement) =>
      !dataType.appLogic &&
      (tasks.some((task) => dataType.taskId === task) || dataType.id === 'ref-data-as-pdf'),
  );

  const mappedDataTypes = filteredDataTypes?.map((dataType: DataTypeElement) => dataType.id) ?? [];
  const sortedDataTypes = mappedDataTypes.sort((a, b) => a.localeCompare(b));

  sortedDataTypes.length !== 0 && mappedDataTypes.unshift('include-all', 'include-attachments');
  return mappedDataTypes;
};

const getDescription = (dataType: string) => {
  switch (dataType) {
    case 'ref-data-as-pdf':
      return 'Generert PDF';
    case 'include-all':
      return 'Alle vedlegg (inkl. PDF)';
    case 'include-attachments':
      return 'Alle vedlegg (eksl. PDF)';
    default:
      return dataType;
  }
};

/* TODO 31.01.23 */
// Save the selected dataTypes in the component
// Should maybe Include all (without PDF) be the default such as the config is in team apps?
// Take a better look at the sorting - is it needed? Is it used other places with a utility?
// Go over the code and simplify it if possible (Can I make the multiple combobox more generic?)
// Add unit tests
// Let be used in beta

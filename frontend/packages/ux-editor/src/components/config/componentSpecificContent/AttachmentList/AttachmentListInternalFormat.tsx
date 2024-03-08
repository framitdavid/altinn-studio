import React, { useState } from 'react';
import { Switch } from '@digdir/design-system-react';
import { AttachmentListContent } from './AttachmentListContent';
import { useTranslation } from 'react-i18next';
import { ArrayUtils } from '@studio/pure-functions';
import { currentTasks, getAvailableAttachments, reservedDataTypes } from './AttachmentListUtils';
import type { LayoutSets } from 'app-shared/types/api/LayoutSetsResponse';
import type { ApplicationMetadata } from 'app-shared/types/ApplicationMetadata';

type AttachmentListInternalFormatProps = {
  handleOutGoingData: (selectedDataTypes: string[], availableAttachments: string[]) => void;
  internalDataFormat: {
    availableAttachments: string[];
    selectedDataTypes: string[];
  };
  layoutSets: LayoutSets;
  selectedLayoutSet: string;
  appMetadata: ApplicationMetadata;
};

export const AttachmentListInternalFormat = (props: AttachmentListInternalFormatProps) => {
  const { handleOutGoingData, internalDataFormat, layoutSets, selectedLayoutSet, appMetadata } =
    props;
  const { availableAttachments } = internalDataFormat;
  const { t } = useTranslation();
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>(
    internalDataFormat.selectedDataTypes,
  );
  const includePdf = selectedDataTypes.includes(reservedDataTypes.refDataAsPdf);
  const currentTask = selectedDataTypes.includes(reservedDataTypes.currentTask);

  const onChangePdf = (isChecked: boolean) => {
    const updatedSelection = toggleItemInArray(
      selectedDataTypes,
      reservedDataTypes.refDataAsPdf,
      isChecked,
    );

    setSelectedDataTypes(updatedSelection);
    handleOutGoingData(updatedSelection, availableAttachments);
  };

  const onChangeTask = (isChecked: boolean) => {
    let updatedSelection: string[];

    if (isChecked) {
      const selectedAttachments = ArrayUtils.intersection(selectedDataTypes, availableAttachments);
      const availableAttachmentsCurrentTask = getAvailableAttachments(
        currentTasks(layoutSets, selectedLayoutSet),
        appMetadata.dataTypes,
      );
      const selectedAttachmentsCurrentTask = ArrayUtils.intersection(
        selectedAttachments,
        availableAttachmentsCurrentTask,
      );
      selectedAttachmentsCurrentTask.push(reservedDataTypes.currentTask);

      if (includePdf) {
        selectedAttachmentsCurrentTask.push(reservedDataTypes.refDataAsPdf);
      }

      updatedSelection = selectedAttachmentsCurrentTask;
    } else {
      updatedSelection = toggleItemInArray(
        selectedDataTypes,
        reservedDataTypes.currentTask,
        isChecked,
      );
    }

    setSelectedDataTypes(updatedSelection);
    handleOutGoingData(updatedSelection, updatedSelection);
  };

  return (
    <>
      <Switch onChange={(e) => onChangeTask(e.target.checked)} size='small' checked={currentTask}>
        {t('ux_editor.component_properties.current_task')}
      </Switch>
      <Switch onChange={(e) => onChangePdf(e.target.checked)} size='small' checked={includePdf}>
        {t('ux_editor.component_properties.select_pdf')}
      </Switch>
      <AttachmentListContent
        availableAttachments={availableAttachments}
        selectedDataTypes={selectedDataTypes}
        setSelectedDataTypes={setSelectedDataTypes}
        handleOutGoingData={handleOutGoingData}
      />
    </>
  );
};

const toggleItemInArray = (array: string[], item: string, add: boolean): string[] =>
  add ? array.concat(item) : ArrayUtils.removeItemByValue(array, item);

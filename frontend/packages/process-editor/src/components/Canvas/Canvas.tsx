import React from 'react';
import { useTranslation } from 'react-i18next';

import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';

import classes from './Canvas.module.css';
import { useBpmnContext } from '../../contexts/BpmnContext';
import { useConfirmationDialogOnPageLeave } from 'app-shared/hooks/useConfirmationDialogOnPageLeave';
import { BPMNViewer } from './BPMNViewer';
import { BPMNEditor } from './BPMNEditor';
import { CanvasActionMenu } from './CanvasActionMenu';

export type CanvasProps = {
  onSave: (bpmnXml: string) => void;
};
export const Canvas = ({ onSave }: CanvasProps): React.ReactElement => {
  const { getUpdatedXml, isEditAllowed, numberOfUnsavedChanges } = useBpmnContext();

  const { t } = useTranslation();

  const handleOnSave = async (): Promise<void> => {
    onSave(await getUpdatedXml());
  };

  useConfirmationDialogOnPageLeave(
    Boolean(numberOfUnsavedChanges),
    t('process_editor.unsaved_changes_confirmation_message'),
  );

  return (
    <div className={classes.container}>
      <CanvasActionMenu onSave={handleOnSave} />
      <div className={classes.wrapper}>{isEditAllowed ? <BPMNEditor /> : <BPMNViewer />}</div>
    </div>
  );
};

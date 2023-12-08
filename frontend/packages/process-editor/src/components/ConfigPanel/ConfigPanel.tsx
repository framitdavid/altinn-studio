import React from 'react';

import classes from './ConfigPanel.module.css';
import { VersionAlert } from './VersionAlert';
import { useTranslation } from 'react-i18next';
import { Alert, Heading, Paragraph } from '@digdir/design-system-react';
import { useBpmnContext } from '../../contexts/BpmnContext';
import { useBpmnViewer } from '../../hooks/useBpmnViewer';

/**
 * @component
 *  Displays the configuration panel area of the ProcessEditor
 *
 * @returns {JSX.Element} - The rendered component
 */
export const ConfigPanel = (): JSX.Element => {
  const { t } = useTranslation();
  const { isEditAllowed } = useBpmnContext();
  const { bpmnDetails } = useBpmnViewer();

  return (
    <div className={classes.configPanel}>
      <p>---- {JSON.stringify(bpmnDetails)}</p>
      {!isEditAllowed && <VersionAlert />}
      <div className={classes.content}>
        <Heading level={2} size='xsmall'>
          {t('process_editor.configuration_panel_heading')}
        </Heading>
        <Alert severity='info'>
          <Heading level={3} size='xxsmall'>
            {t('process_editor.configuration_panel.under_development_title')}
          </Heading>
          <Paragraph size='small'>
            {t('process_editor.configuration_panel.under_development_body')}
          </Paragraph>
        </Alert>
      </div>
    </div>
  );
};

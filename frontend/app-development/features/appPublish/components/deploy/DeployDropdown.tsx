import React, { useState } from 'react';
import classes from './DeployDropdown.module.css';
import { AltinnIcon, AltinnSpinner } from 'app-shared/components';
import {
  Button,
  ButtonVariant,
  Popover,
  PopoverVariant,
  Select,
} from '@digdir/design-system-react';
import { ButtonContainer } from 'app-shared/primitives';
import { DeploymentStatus, ImageOption } from '../appDeploymentComponent';
import { formatTimeHHmm } from 'app-shared/pure/date-format';
import { getAzureDevopsBuildResultUrl } from '../../../../utils/urlHelper';
import { getParsedLanguageFromKey } from 'app-shared/utils/language';
import { shouldDisplayDeployStatus } from './utils';

interface Props {
  appDeployedVersion: string;
  envName: string;
  imageOptions: ImageOption[];
  language: any;
  disabled: boolean;
  deployHistoryEntry: any;
  deploymentStatus: DeploymentStatus;
  setSelectedImageTag: (tag) => void;
  selectedImageTag: string;
  startDeploy: any;
}

export const DeployDropdown = ({
  appDeployedVersion,
  imageOptions,
  envName,
  language,
  deploymentStatus,
  deployHistoryEntry,
  selectedImageTag,
  setSelectedImageTag,
  disabled,
  startDeploy,
}: Props) => {
  const [popoverIsOpen, setPopoverIsOpen] = useState(false);
  const t = (key: string, params?: any) => getParsedLanguageFromKey(key, language, params || []);
  return (
    <>
      <div>{t('app_deploy_messages.choose_version')}</div>
      <div className={classes.select} id={`deploy-select-${envName.toLowerCase()}`}>
        {imageOptions.length > 0 && (
          <Select
            options={imageOptions || []}
            onChange={(value: string) => setSelectedImageTag(value)}
          />
        )}
      </div>
      <div className={classes.deployButton}>
        <Popover
          open={popoverIsOpen}
          placement={'right'}
          variant={PopoverVariant.Warning}
          trigger={
            <Button
              disabled={disabled}
              onClick={(_) => setPopoverIsOpen(!popoverIsOpen)}
              id={`deploy-button-${envName.toLowerCase()}`}
            >
              {t('app_deploy_messages.btn_deploy_new_version')}
            </Button>
          }
        >
          <>
            {appDeployedVersion
              ? t('app_deploy_messages.deploy_confirmation', [selectedImageTag, appDeployedVersion])
              : t('app_deploy_messages.deploy_confirmation_short', [selectedImageTag])}
            <ButtonContainer>
              <Button
                id={`deploy-button-${envName.toLowerCase()}-confirm`}
                onClick={() => startDeploy()}
              >
                Ja
              </Button>
              <Button onClick={(_) => setPopoverIsOpen(false)} variant={ButtonVariant.Quiet}>
                Avbryt
              </Button>
            </ButtonContainer>
          </>
        </Popover>
      </div>
      {shouldDisplayDeployStatus(deployHistoryEntry?.created) && (
        <div className={classes.deployStatusGridContainer}>
          <div className={classes.deploySpinnerGridItem}>
            {deploymentStatus === DeploymentStatus.inProgress && <AltinnSpinner />}
            {deploymentStatus === DeploymentStatus.succeeded && (
              <AltinnIcon iconClass='ai ai-check-circle' iconColor='#12AA64' iconSize='3.6rem' />
            )}
            {(deploymentStatus === DeploymentStatus.partiallySucceeded ||
              deploymentStatus === DeploymentStatus.none) && (
              <AltinnIcon iconClass='ai ai-info-circle' iconColor='#008FD6' iconSize='3.6rem' />
            )}
            {(deploymentStatus === DeploymentStatus.canceled ||
              deploymentStatus === DeploymentStatus.failed) && (
              <AltinnIcon
                iconClass='ai ai-circle-exclamation'
                iconColor='#E23B53'
                iconSize='3.6rem'
              />
            )}
          </div>
          <div>
            {deploymentStatus === DeploymentStatus.inProgress &&
              t('app_deploy_messages.deploy_in_progress', [
                deployHistoryEntry?.createdBy,
                deployHistoryEntry?.tagName,
                getAzureDevopsBuildResultUrl(deployHistoryEntry?.build.id),
              ])}
            {deploymentStatus === DeploymentStatus.succeeded &&
              t('app_deploy_messages.success', [
                deployHistoryEntry?.tagName,
                formatTimeHHmm(deployHistoryEntry?.build.finished),
                envName,
                deployHistoryEntry?.createdBy,
                getAzureDevopsBuildResultUrl(deployHistoryEntry?.build.id),
              ])}
            {deploymentStatus === DeploymentStatus.failed &&
              t('app_deploy_messages.failed', [
                deployHistoryEntry?.tagName,
                formatTimeHHmm(deployHistoryEntry?.build.finished),
                envName,
                getAzureDevopsBuildResultUrl(deployHistoryEntry?.build.id),
              ])}
            {deploymentStatus === DeploymentStatus.canceled &&
              t('app_deploy_messages.canceled', [
                deployHistoryEntry?.tagName,
                formatTimeHHmm(deployHistoryEntry?.build.finished),
                envName,
                getAzureDevopsBuildResultUrl(deployHistoryEntry?.build.id),
              ])}
            {deploymentStatus === DeploymentStatus.partiallySucceeded &&
              t('app_deploy_messages.partiallySucceeded', [
                deployHistoryEntry?.tagName,
                envName,
                formatTimeHHmm(deployHistoryEntry?.build.finished),
                getAzureDevopsBuildResultUrl(deployHistoryEntry?.build.id),
              ])}
            {deploymentStatus === DeploymentStatus.none &&
              t('app_deploy_messages.none', [
                deployHistoryEntry?.tagName,
                formatTimeHHmm(deployHistoryEntry?.build.finished),
                envName,
                getAzureDevopsBuildResultUrl(deployHistoryEntry?.build.id),
              ])}
          </div>
        </div>
      )}
    </>
  );
};

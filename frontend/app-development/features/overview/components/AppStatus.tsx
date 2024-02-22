import React, { useMemo } from 'react';
import classes from './AppStatus.module.css';
import { useStudioUrlParams } from 'app-shared/hooks/useStudioUrlParams';
import { useAppDeploymentsQuery } from 'app-development/hooks/queries';
import { Trans, useTranslation } from 'react-i18next';
import { Alert, Heading, Paragraph } from '@digdir/design-system-react';
import { StudioSpinner } from '@studio/components';
import { formatDateDDMMYY, formatTimeHHmm } from 'app-shared/pure/date-format';
import { getAzureDevopsBuildResultUrl } from 'app-development/utils/urlHelper';
import { publishPath } from 'app-shared/api/paths';
import type { PipelineDeployment } from 'app-shared/types/api/PipelineDeployment';
import { KubernetesDeploymentStatus } from 'app-shared/types/api/KubernetesDeploymentStatus';
import { BuildResult, BuildStatus } from 'app-shared/types/Build';
import { Link } from '@digdir/design-system-react';
import type { DeployEnvironment } from 'app-shared/types/DeployEnvironment';
import { getAppLink } from 'app-shared/ext-urls';
import type { AppDeployment } from 'app-shared/types/api/AppDeployment';

export type AppStatusProps = {
  appDeployment: AppDeployment;
  envName: string;
  envType: string;
  urlToApp: string;
};

export const AppStatus = ({ appDeployment, envName, envType, urlToApp }: AppStatusProps) => {
  const { org, app } = useStudioUrlParams();
  const { t } = useTranslation();

  const formatDateTime = (dateAsString: string): string => {
    return t('general.date_time_format', {
      date: formatDateDDMMYY(dateAsString),
      time: formatTimeHHmm(dateAsString),
    });
  };

  const kubernetesDeployment = appDeployment?.kubernetesDeploymentList.find(
    (item) => item.envName.toLowerCase() === envName.toLowerCase(),
  );

  if (!kubernetesDeployment?.status) {
    return (
      <DeploymentStatusInfo
        envType={envType}
        envName={envName}
        severity='info'
        content={t('overview.no_app')}
        footer={
          <Trans i18nKey='overview.go_to_publish'>
            <a href={publishPath(org, app)} />
          </Trans>
        }
      />
    );
  }

  if (!kubernetesDeployment.status) {
    return (
      <DeploymentStatusInfo
        envType={envType}
        envName={envName}
        severity='info'
        content={t('overview.no_app')}
        footer={
          <Trans i18nKey='overview.go_to_publish'>
            <a href={publishPath(org, app)} />
          </Trans>
        }
      />
    );
  }

  switch (kubernetesDeployment.status) {
    case KubernetesDeploymentStatus.completed:
      // TODO - remove and replace by kubernetes date
      const deploymentSucceeded = appDeployment?.pipelineDeploymentList.find(
        (item) =>
          item.tagName.toLowerCase() === kubernetesDeployment.version.toLowerCase() &&
          (item.build.result === BuildResult.succeeded ||
            item.build.result === BuildResult.partiallySucceeded) &&
          item.build.finished !== null,
      );
      return (
        <DeploymentStatusInfo
          envType={envType}
          envName={envName}
          severity='success'
          content={
            <Trans
              i18nKey={'overview.success'}
              values={{
                version: kubernetesDeployment.version,
              }}
              components={{
                a: <Link href={urlToApp}> </Link>,
              }}
            />
          }
          footer={
            <Trans
              i18nKey={'overview.last_published'}
              values={{
                lastPublishedDate: formatDateTime(deploymentSucceeded?.created),
              }}
            />
          }
        />
      );
    case KubernetesDeploymentStatus.failed:
      // TODO - remove and replace by a link to the publish page
      const deploymentFailed = appDeployment?.pipelineDeploymentList.find(
        (item) =>
          item.tagName.toLowerCase() === kubernetesDeployment.version.toLowerCase() &&
          item.build.result === BuildResult.failed,
      );
      return (
        <DeploymentStatusInfo
          envType={envType}
          envName={envName}
          severity='warning'
          content={t('overview.unavailable')}
          footer={
            <Trans i18nKey='overview.go_to_build_log'>
              <a href={getAzureDevopsBuildResultUrl(deploymentFailed?.build.id)} />
            </Trans>
          }
        />
      );
    default:
      return (
        <DeploymentStatusInfo
          envType={envType}
          envName={envName}
          severity='info'
          content={
            <StudioSpinner
              size='small'
              spinnerTitle={t('overview.in_progress')}
              showSpinnerTitle
              className={classes.loadingSpinner}
            />
          }
          footer={
            <Trans i18nKey='overview.go_to_publish'>
              <a href={publishPath(org, app)} />
            </Trans>
          }
        />
      );
  }
};

type DeploymentStatusInfoProps = {
  envType: string;
  envName: string;
  severity: 'success' | 'warning' | 'info';
  content: string | React.ReactNode;
  footer: string | JSX.Element;
};
const DeploymentStatusInfo = ({
  envType,
  envName,
  severity,
  content,
  footer,
}: DeploymentStatusInfoProps) => {
  const { t } = useTranslation();
  const isProduction = envType.toLowerCase() === 'production';
  const headingText = isProduction ? t('general.production') : envName;

  return (
    <Alert severity={severity} className={classes.alert}>
      <Heading spacing level={2} size='xsmall' className={classes.heading}>
        {headingText}
      </Heading>
      <Paragraph spacing size='small'>
        {content}
      </Paragraph>
      <Paragraph size='xsmall'>{footer}</Paragraph>
    </Alert>
  );
};

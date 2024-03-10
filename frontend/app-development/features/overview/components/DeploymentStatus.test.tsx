import React from 'react';
import { screen } from '@testing-library/react';
import type { DeploymentStatusProps } from './DeploymentStatus';
import { DeploymentStatus } from './DeploymentStatus';
import { APP_DEVELOPMENT_BASENAME } from 'app-shared/constants';
import { renderWithProviders } from '../../../test/testUtils';
import { textMock } from '../../../../testing/mocks/i18nMock';
import { kubernetesDeployment } from 'app-shared/mocks/mocks';
import { KubernetesDeploymentStatus } from 'app-shared/types/api/KubernetesDeploymentStatus';

// Test data
const org = 'ttd';
const app = 'test-ttd';
const defaultProps: DeploymentStatusProps = {
  envName: 'tt02',
  isProduction: false,
};

const render = (props: Partial<DeploymentStatusProps> = {}) => {
  return renderWithProviders(<DeploymentStatus {...defaultProps} {...props} />, {
    startUrl: `${APP_DEVELOPMENT_BASENAME}/${org}/${app}`,
  });
};

describe('DeploymentStatus', () => {
  it('shows production when environment is production', async () => {
    render({
      envName: 'production',
      isProduction: true,
    });

    expect(screen.getByText(textMock('general.production'))).toBeInTheDocument();
  });

  it('shows environment name when environment is not production', async () => {
    render({
      envName: 'tt02',
      isProduction: false,
    });

    expect(screen.getByText('TT02')).toBeInTheDocument();
  });

  it('shows alert when KubernetesDeploymentStatus is completed', async () => {
    render({
      kubernetesDeployment: {
        ...kubernetesDeployment,
        status: KubernetesDeploymentStatus.completed,
      },
    });

    expect(
      screen.getByText(textMock('app_deployment.kubernetes_deployment.status.completed')),
    ).toBeInTheDocument();
  });

  it('shows alert when KubernetesDeploymentStatus is failed', async () => {
    render({
      kubernetesDeployment: {
        ...kubernetesDeployment,
        status: KubernetesDeploymentStatus.failed,
      },
    });

    expect(
      screen.getByText(textMock('app_deployment.kubernetes_deployment.status.failed')),
    ).toBeInTheDocument();
  });

  it('shows alert when KubernetesDeploymentStatus is progressing', async () => {
    render({
      kubernetesDeployment: {
        ...kubernetesDeployment,
        status: KubernetesDeploymentStatus.progressing,
        statusDate: new Date().toString(),
      },
    });

    expect(
      screen.getByText(textMock('app_deployment.kubernetes_deployment.status.progressing')),
    ).toBeInTheDocument();
  });

  it('shows alert when no app is deployed', async () => {
    render();

    expect(
      screen.getByText(textMock('app_deployment.kubernetes_deployment.status.none')),
    ).toBeInTheDocument();
  });

  it('shows alert when KubernetesDeploymentStatus is unavailable', async () => {
    render({
      kubernetesDeployment: {
        ...kubernetesDeployment,
        status: null,
        statusDate: '',
      },
    });

    expect(
      screen.getByText(textMock('app_deployment.kubernetes_deployment.status.unavailable')),
    ).toBeInTheDocument();
  });
});

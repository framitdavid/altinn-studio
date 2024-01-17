import React, { useState } from 'react';
import classes from './ImportResourceModal.module.css';
import { Modal } from '../Modal';
import { Combobox } from '@digdir/design-system-react';
import { useTranslation } from 'react-i18next';
import { EnvironmentType } from 'resourceadm/types/EnvironmentType';
import { useNavigate } from 'react-router-dom';
import { ServiceContent } from './ServiceContent';
import { Altinn2LinkService } from 'app-shared/types/Altinn2LinkService';
import { useImportResourceFromAltinn2Mutation } from 'resourceadm/hooks/mutations';
import { Resource } from 'app-shared/types/ResourceAdm';
import { getResourcePageURL } from 'resourceadm/utils/urlUtils';
import { AxiosError } from 'axios';
import { ServerCodes } from 'app-shared/enums/ServerCodes';
import { useUrlParams } from 'resourceadm/hooks/useSelectedContext';
import { StudioButton } from '@studio/components';

const environmentOptions = ['AT21', 'AT22', 'AT23', 'AT24', 'TT02', 'PROD'];

export type ImportResourceModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

/**
 * @component
 *    Displays the modal where the user can select an environemt and service from
 *    Altinn 2 to import to Altinn 3.
 *    The user must select which environment to import from to be able to select the service.
 *    The user must then selct a service before the title and id will be visible.
 *    When the environment and service is selected, the button to start planning the
 *    importing will be available.
 *
 * @property {boolean}[isOpen] - Boolean for if the modal is open
 * @property {function}[onClose] - Function to handle close
 *
 * @returns {React.ReactNode} - The rendered component
 */
export const ImportResourceModal = ({
  isOpen,
  onClose,
}: ImportResourceModalProps): React.ReactNode => {
  const { t } = useTranslation();

  const { selectedContext, repo } = useUrlParams();

  const navigate = useNavigate();

  const [selectedEnv, setSelectedEnv] = useState<EnvironmentType>();
  const [selectedService, setSelectedService] = useState<Altinn2LinkService>();

  const [resourceIdExists, setResourceIdExists] = useState(false);

  const { mutate: importResourceFromAltinn2Mutation } =
    useImportResourceFromAltinn2Mutation(selectedContext);

  /**
   * Reset fields on close
   */
  const handleClose = () => {
    onClose();
    setSelectedEnv(undefined);
  };

  /**
   * Import the resource from Altinn 2, and navigate to about page on success
   */
  const handleImportResource = () => {
    importResourceFromAltinn2Mutation(
      {
        environment: selectedEnv,
        serviceCode: selectedService.externalServiceCode,
        serviceEdition: selectedService.externalServiceEditionCode,
      },
      {
        onSuccess: (resource: Resource) => {
          navigate(getResourcePageURL(selectedContext, repo, resource.identifier, 'about'));
        },
        onError: (error: AxiosError) => {
          if (error.response.status === ServerCodes.Conflict) {
            setResourceIdExists(true);
          }
        },
      },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('resourceadm.dashboard_import_modal_title')}
      contentClassName={classes.contentWidth}
    >
      <div className={classes.dropdownWraper}>
        <Combobox
          value={selectedEnv ? [selectedEnv] : undefined}
          label={t('resourceadm.dashboard_import_modal_select_env')}
          onValueChange={(newValue: EnvironmentType[]) => setSelectedEnv(newValue[0])}
        >
          {environmentOptions.map((env) => (
            <Combobox.Option key={env} value={env}>
              {env}
            </Combobox.Option>
          ))}
        </Combobox>
      </div>
      {selectedEnv && (
        <ServiceContent
          selectedContext={selectedContext}
          env={selectedEnv}
          selectedService={selectedService}
          onSelectService={(altinn2LinkService: Altinn2LinkService) =>
            setSelectedService(altinn2LinkService)
          }
          resourceIdExists={resourceIdExists}
        />
      )}
      <div className={classes.buttonWrapper}>
        <StudioButton onClick={handleClose} color='first' variant='tertiary' size='small'>
          {t('general.cancel')}
        </StudioButton>
        {selectedEnv && selectedService && (
          <div className={classes.importButton}>
            <StudioButton onClick={handleImportResource} color='first' size='small'>
              {t('resourceadm.dashboard_import_modal_import_button')}
            </StudioButton>
          </div>
        )}
      </div>
    </Modal>
  );
};

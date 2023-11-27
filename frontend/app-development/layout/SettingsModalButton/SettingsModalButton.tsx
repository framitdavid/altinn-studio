import React, { ReactNode, useRef, useState } from 'react';
import { Button } from '@digdir/design-system-react';
import { CogIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import { SettingsModal } from './SettingsModal';

export type SettingsModalButtonProps = {
  /**
   * The org
   */
  org: string;
  /**
   * The app
   */
  app: string;
};

/**
 * @component
 *    Displays a button to open the Settings modal
 *
 * @property {string}[org] - The org
 * @property {string}[app] - The app
 *
 * @returns {ReactNode} - The rendered component
 */
export const SettingsModalButton = ({ org, app }: SettingsModalButtonProps): ReactNode => {
  const { t } = useTranslation();
  // const [isOpen, setIsOpen] = useState(false);

  const modalRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <Button
        onClick={() => modalRef.current?.showModal()}
        size='small'
        variant='tertiary'
        color='inverted'
        icon={<CogIcon />}
      >
        {t('settings_modal.heading')}
      </Button>
      {
        // Done to prevent API calls to be executed before the modal is open
        // isOpen && (
        <SettingsModal ref={modalRef} org={org} app={app} /> // isOpen={isOpen} onClose={() => setIsOpen(false)} org={org} app={app} />
        //)
      }
    </>
  );
};

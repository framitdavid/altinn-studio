import React, { useState } from 'react';
import classes from './NewResourceModal.module.css';
import { Button } from '@digdir/design-system-react';
import { Modal } from '../Modal';
import { ResourceNameAndId } from '../ResourceNameAndId';
import { useCreateResourceMutation } from 'resourceadm/hooks/mutations';
import { useNavigate, useParams } from 'react-router-dom';
import type { NewResource } from 'app-shared/types/ResourceAdm';
import { getResourcePageURL } from 'resourceadm/utils/urlUtils';
import { useTranslation } from 'react-i18next';

export type NewResourceModalProps = {
  /**
   * Boolean for if the modal is open
   */
  isOpen: boolean;
  /**
   * Function to handle close
   * @returns void
   */
  onClose: () => void;
};

/**
 * @component
 *    Displays the modal telling the user that there is a merge conflict
 *
 * @property {boolean}[isOpen] - Boolean for if the modal is open
 * @property {function}[onClose] - Function to handle close
 *
 * @returns {React.ReactNode} - The rendered component
 */
export const NewResourceModal = ({ isOpen, onClose }: NewResourceModalProps): React.ReactNode => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { selectedContext } = useParams();
  const repo = `${selectedContext}-resources`;

  const [id, setId] = useState('');
  const [title, setTitle] = useState('');
  const [editIdFieldOpen, setEditIdFieldOpen] = useState(false);
  const [resourceIdExists, setResourceIdExists] = useState(false);
  const [bothFieldsHaveSameValue, setBothFieldsHaveSameValue] = useState(true);

  // Mutation function to create new resource
  const { mutate: createNewResource } = useCreateResourceMutation(selectedContext);

  /**
   * Creates a new resource in backend, and navigates if success
   */
  const handleCreateNewResource = () => {
    const idAndTitle: NewResource = {
      identifier: id,
      title: {
        nb: title,
        nn: '',
        en: '',
      },
    };

    createNewResource(idAndTitle, {
      onSuccess: () =>
        navigate(getResourcePageURL(selectedContext, repo, idAndTitle.identifier, 'about')),
      onError: (error: any) => {
        if (error.response.status === 409) {
          setResourceIdExists(true);
          setEditIdFieldOpen(true);
        }
      },
    });
  };

  /**
   * Replaces the spaces in the value typed with '-'.
   */
  const handleIDInput = (val: string) => {
    setId(val.replace(/\s/g, '-'));
    setResourceIdExists(false);
  };

  /**
   * Updates the value of the title. If the edit field is not open,
   * then it updates the ID to the same as the title.
   *
   * @param val the title value typed
   */
  const handleEditTitle = (val: string) => {
    if (!editIdFieldOpen && bothFieldsHaveSameValue) {
      setId(val.replace(/\s/g, '-'));
    }
    setTitle(val);
  };

  /**
   * Handles the click of the edit button. If we click the edit button
   * so that it closes the edit field, the id is set to the title.
   *
   * @param isOpened the value of the button when it is pressed
   * @param isSave if the save button is pressed, keep id and title separate
   */
  const handleClickEditButton = (isOpened: boolean, isSave: boolean) => {
    setEditIdFieldOpen(isOpened);

    if (isSave) {
      setBothFieldsHaveSameValue(false);
    } else {
      if (!isOpened) {
        setBothFieldsHaveSameValue(true);
        // If we stop editing, set the ID to the title
        if (title !== id) setId(title.replace(/\s/g, '-'));
      }
    }
  };

  /**
   * Closes the modal and resets the fields
   */
  const handleClose = () => {
    onClose();
    setId('');
    setTitle('');
    setEditIdFieldOpen(false);
    setResourceIdExists(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('resourceadm.dashboard_create_modal_title')}
      contentClassName={classes.contentWidth}
    >
      <ResourceNameAndId
        isEditOpen={editIdFieldOpen}
        title={title}
        text={t('resourceadm.dashboard_create_modal_resource_name_and_id_text')}
        id={id}
        handleEditTitle={handleEditTitle}
        handleIdInput={handleIDInput}
        handleClickEditButton={(isSave: boolean) => handleClickEditButton(!editIdFieldOpen, isSave)}
        resourceIdExists={resourceIdExists}
        bothFieldsHaveSameValue={bothFieldsHaveSameValue}
        className={classes.resourceNameAndId}
      />
      <div className={classes.buttonWrapper}>
        <div className={classes.closeButton}>
          <Button onClick={onClose} color='first' variant='tertiary' size='small'>
            {t('general.cancel')}
          </Button>
        </div>
        <Button
          onClick={() =>
            !(id.length === 0 || title.length === 0) ? handleCreateNewResource() : undefined
          }
          color='first'
          aria-disabled={id.length === 0 || title.length === 0}
          size='small'
        >
          {t('resourceadm.dashboard_create_modal_create_button')}
        </Button>
      </div>
    </Modal>
  );
};

import React, { ReactNode, forwardRef } from 'react';
import classes from './StudioModal.module.css';
import { Button, Modal, ModalProps } from '@digdir/design-system-react';
import { useTranslation } from 'react-i18next';
import { MultiplyIcon } from '@altinn/icons';

/*export type StudioModalProps = {
      isOpen: boolean;
      onClose: () => void;
      title: ReactNode;
      children: ReactNode;
    }*/

export type StudioModalProps = {
  header: ReactNode;
  content: ReactNode;
  footer?: ReactNode;
} & Omit<ModalProps, 'header' | 'content' | 'footer'>;

/**
 * @component
 *    Component that displays a Modal for Altinn-studio
 *
 * @example
 *    <StudioModal
 *      isOpen={isOpen}
 *      onClose={() => setIsOpen(false)}
 *      title={
 *        <div>
 *          <SomeIcon />
 *          <Heading level={1} size='small'>Some name</Heading>
 *        </div>
 *      }
 *    >
 *      <div>
 *        <SomeChildrenComponents />
 *      </div>
 *    </StudioModal>
 *
 * @property {boolean}[isOpen] - Flag for if the modal is open
 * @property {function}[onClose] - Fucntion to execute when closing modal
 * @property {ReactNode}[title] - Title of the modal
 * @property {ReactNode}[children] - Content in the modal
 *
 * @returns {ReactNode} - The rendered component
 */
export const StudioModal = forwardRef<HTMLDialogElement, StudioModalProps>(
  //({ isOpen, onClose, title, children, ...rest }: StudioModalProps, ref): ReactNode => {
  ({ header, content, footer, ...rest }: StudioModalProps, ref): ReactNode => {
    const { t } = useTranslation();

    return (
      <Modal ref={ref} className={classes.modal} {...rest}>
        <Modal.Header className={classes.header}>{header}</Modal.Header>
        <Modal.Content className={classes.content}>{content}</Modal.Content>
        {footer && <Modal.Footer>{footer}</Modal.Footer>}
      </Modal>
    );
    /*(
      <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        className={classes.modal}
        overlayClassName={classes.modalOverlay}
        ariaHideApp={false}
        ref={ref}
        {...rest}
      >
        <div className={classes.headingWrapper}>
          {title}
          <div className={classes.closeButtonWrapper}>
            <Button
              variant='tertiary'
              icon={<MultiplyIcon />}
              onClick={onClose}
              aria-label={t('modal.close_icon')}
            />
          </div>
        </div>
        <div className={classes.contentWrapper}>{children}</div>
      </Modal>
    );*/
  },
);

StudioModal.displayName = 'StudioModal';

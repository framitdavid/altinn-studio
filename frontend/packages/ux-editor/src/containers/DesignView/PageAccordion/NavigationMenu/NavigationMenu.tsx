import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { DropdownMenu } from '@digdir/design-system-react';
import { MenuElipsisVerticalIcon, ArrowUpIcon, ArrowDownIcon } from '@navikt/aksel-icons';
import { useFormLayoutSettingsQuery } from '../../../../hooks/queries/useFormLayoutSettingsQuery';
import { useUpdateLayoutOrderMutation } from '../../../../hooks/mutations/useUpdateLayoutOrderMutation';
import { useStudioUrlParams } from 'app-shared/hooks/useStudioUrlParams';
import { useAppContext } from '../../../../hooks/useAppContext';
import { StudioButton } from '@studio/components';

export type NavigationMenuProps = {
  pageName: string;
  pageIsReceipt: boolean;
};

/**
 * @component
 *    Displays the buttons to move a page accoridon up or down, edit the name and delete the page
 *
 * @property {string}[pageName] - The name of the page
 * @property {boolean}[pageIsReceipt] - If the page is a receipt page
 *
 * @returns {JSX.Element} - The rendered component
 */
export const NavigationMenu = ({ pageName, pageIsReceipt }: NavigationMenuProps): JSX.Element => {
  const { t } = useTranslation();

  const { org, app } = useStudioUrlParams();

  const { selectedLayoutSet, invalidLayouts } = useAppContext();
  const invalid = invalidLayouts.includes(pageName);

  const { data: formLayoutSettings } = useFormLayoutSettingsQuery(org, app, selectedLayoutSet);

  const layoutOrder = formLayoutSettings?.pages?.order;
  const disableUp = layoutOrder.indexOf(pageName) === 0;
  const disableDown = layoutOrder.indexOf(pageName) === layoutOrder.length - 1;

  const { mutate: updateLayoutOrder } = useUpdateLayoutOrderMutation(org, app, selectedLayoutSet);

  const settingsRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const moveLayout = (action: 'up' | 'down') => {
    if (action === 'up' || action === 'down') {
      updateLayoutOrder({ layoutName: pageName, direction: action });
    }
    setDropdownOpen(false);
  };

  return (
    <div>
      <StudioButton
        icon={<MenuElipsisVerticalIcon />}
        onClick={() => setDropdownOpen((v) => !v)}
        aria-haspopup='menu'
        variant='tertiary'
        title={t('general.options')}
        size='small'
        ref={settingsRef}
      />
      <DropdownMenu
        anchorEl={settingsRef.current}
        open={dropdownOpen}
        onClose={() => setDropdownOpen(false)}
        portal
        size='small'
      >
        <DropdownMenu.Content>
          <DropdownMenu.Group>
            {!pageIsReceipt && (
              <>
                <DropdownMenu.Item
                  onClick={() => !(disableUp || invalid) && moveLayout('up')}
                  disabled={disableUp || invalid}
                  id='move-page-up-button'
                >
                  <ArrowUpIcon />
                  {t('ux_editor.page_menu_up')}
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => !(disableDown || invalid) && moveLayout('down')}
                  disabled={disableDown || invalid}
                  id='move-page-down-button'
                >
                  <ArrowDownIcon />
                  {t('ux_editor.page_menu_down')}
                </DropdownMenu.Item>
              </>
            )}
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu>
    </div>
  );
};

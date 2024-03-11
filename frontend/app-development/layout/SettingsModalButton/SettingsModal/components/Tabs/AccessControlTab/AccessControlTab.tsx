import type { ReactNode } from 'react';
import React, { useState } from 'react';
import classes from './AccessControlTab.module.css';
import { Trans, useTranslation } from 'react-i18next';
import { TabHeader } from '../../TabHeader';
import {
  Checkbox,
  ErrorMessage,
  HelpText,
  Link,
  Paragraph,
  Popover,
  Table,
} from '@digdir/design-system-react';
import type { PartyTypesAllowed } from 'app-shared/types/ApplicationMetadata';
import { useAppMetadataMutation } from 'app-development/hooks/mutations';
import {
  getPartyTypesAllowedOptions,
  initialPartyTypes,
} from '../../../utils/tabUtils/accessControlTabUtils';
import { useAppMetadataQuery } from 'app-development/hooks/queries';
import { LoadingTabData } from '../../LoadingTabData';
import { TabDataError } from '../../TabDataError';
import { TabContent } from '../../TabContent';

enum CheckboxState {
  Checked = 'checked',
  Indeterminate = 'indeterminate',
  Unchecked = 'unchecked',
}

export type AccessControlTabProps = {
  org: string;
  app: string;
};

/**
 * @component
 *    Displays the tab rendering the access control for an app
 *
 * @property {string}[org] - The org
 * @property {string}[app] - The app
 *
 * @returns {ReactNode} - The rendered component
 */
export const AccessControlTab = ({ org, app }: AccessControlTabProps): ReactNode => {
  const { t } = useTranslation();
  const [checkedCheckboxes, setCheckedCheckboxes] = useState<string[]>([]);
  const [isPopoverOpened, setIsPopoverOpened] = useState<boolean>(false);

  const {
    status: appMetadataStatus,
    data: appMetadata,
    error: appMetadataError,
  } = useAppMetadataQuery(org, app);

  const { mutate: updateAppMetadataMutation } = useAppMetadataMutation(org, app);

  const handleChange = (newPartyTypes: string[], currentPartyTypesAllowed: PartyTypesAllowed) => {
    const newPartyTypesAllowed = { ...currentPartyTypesAllowed };

    Object.keys(currentPartyTypesAllowed).forEach((key) => {
      newPartyTypesAllowed[key] = newPartyTypes.includes(key);
    });
    updateAppMetadataMutation({ ...appMetadata, partyTypesAllowed: newPartyTypesAllowed });
  };

  const isAnyCheckboxChecked = checkedCheckboxes.length > 0;

  const areAllCheckboxesChecked = checkedCheckboxes.length === getPartyTypesAllowedOptions().length;

  const tableHeaderCheckboxState = isAnyCheckboxChecked
    ? areAllCheckboxesChecked
      ? CheckboxState.Checked
      : CheckboxState.Indeterminate
    : CheckboxState.Unchecked;

  const handleTableHeaderCheckboxChange = () => {
    if (tableHeaderCheckboxState === CheckboxState.Checked) setCheckedCheckboxes([]);
    else setCheckedCheckboxes(getPartyTypesAllowedOptions().map((option) => option.value));
  };

  const handleCheckboxChange = (value: string) => {
    const updatedCheckboxes = checkedCheckboxes.includes(value)
      ? checkedCheckboxes.filter((checkbox) => checkbox !== value)
      : [...checkedCheckboxes, value];

    if (checkedCheckboxes.length === 1 && updatedCheckboxes.length === 0) {
      setIsPopoverOpened(true);
      return;
    }
    setCheckedCheckboxes(updatedCheckboxes);
  };

  const handlePopoverClose = () => setIsPopoverOpened(false);

  const displayContent = () => {
    switch (appMetadataStatus) {
      case 'pending': {
        return <LoadingTabData />;
      }
      case 'error': {
        return (
          <TabDataError>
            {appMetadataError && <ErrorMessage>{appMetadataError.message}</ErrorMessage>}
          </TabDataError>
        );
      }
      case 'success': {
        const currentPartyTypesAllowed = appMetadata?.partyTypesAllowed ?? initialPartyTypes;

        return (
          <>
            <Checkbox.Group
              legend={t('settings_modal.access_control_tab_checkbox_legend_label')}
              size='small'
              onChange={(newValues: string[]) => handleChange(newValues, currentPartyTypesAllowed)}
              value={Object.keys(currentPartyTypesAllowed).filter(
                (key) => currentPartyTypesAllowed[key],
              )}
            >
              <Paragraph asChild size='small' short>
                <span>{t('settings_modal.access_control_tab_checkbox_description')}</span>
              </Paragraph>
            </Checkbox.Group>

            <Table className={classes.tableContent}>
              <Table.Head>
                <Table.Row>
                  <Table.HeaderCell className={classes.header}>
                    <Checkbox
                      indeterminate={tableHeaderCheckboxState === CheckboxState.Indeterminate}
                      checked={tableHeaderCheckboxState === CheckboxState.Checked}
                      onChange={handleTableHeaderCheckboxChange}
                      size='small'
                      value='all'
                    />
                  </Table.HeaderCell>
                  <Table.HeaderCell className={classes.header}>
                    {t('settings_modal.access_control_tab_option_all_type_partner')}
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Head>

              <Table.Body>
                {getPartyTypesAllowedOptions().map((option) => (
                  <Table.Row key={option.value}>
                    <Table.Cell className={classes.checkboxContent}>
                      <Popover
                        open={isPopoverOpened}
                        onClose={handlePopoverClose}
                        variant='info'
                        placement='top-start'
                      >
                        <Checkbox
                          onChange={() => handleCheckboxChange(option.value)}
                          size='small'
                          value={option.value}
                          checked={checkedCheckboxes.includes(option.value)}
                        />

                        <Popover.Content>
                          {t(
                            'settings_modal.access_control_tab_option_choose_type_popover_message',
                          )}
                        </Popover.Content>
                      </Popover>
                    </Table.Cell>
                    <Table.Cell>{t(option.label)}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </>
        );
      }
    }
  };

  return (
    <TabContent>
      <div className={classes.tabHeaderContent}>
        <TabHeader text={t('settings_modal.access_control_tab_heading')} />
        <HelpText title={''}>{t('settings_modal.access_control_tab_help_text_heading')}</HelpText>
      </div>
      {displayContent()}
      <span className={classes.docsLinkText}>
        {t('settings_modal.access_control_tab_option_access_control_docs_link_text')}
      </span>
      <div className={classes.docsLink}>
        <Trans i18nKey={'settings_modal.access_control_tab_option_access_control_docs_link'}>
          <Link>documantation</Link>
        </Trans>
      </div>
    </TabContent>
  );
};

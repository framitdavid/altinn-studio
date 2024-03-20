import React from 'react';
import { useLayoutSetsQuery } from '../../hooks/queries/useLayoutSetsQuery';
import { NativeSelect } from '@digdir/design-system-react';
import { useStudioUrlParams } from 'app-shared/hooks/useStudioUrlParams';
import { useText, useSelectedFormLayoutSetName } from '../../hooks';
import classes from './LayoutSetsContainer.module.css';

export function LayoutSetsContainer() {
  const { org, app } = useStudioUrlParams();
  const layoutSetsQuery = useLayoutSetsQuery(org, app);
  const layoutSetNames = layoutSetsQuery.data?.sets?.map((set) => set.id);
  const t = useText();
  const { selectedFormLayoutSetName, setSelectedFormLayoutSetName } =
    useSelectedFormLayoutSetName();

  const onLayoutSetClick = (set: string) => {
    if (selectedFormLayoutSetName !== set) {
      setSelectedFormLayoutSetName(set);
    }
  };

  if (!layoutSetNames) return null;

  return (
    <div className={classes.dropDownContainer}>
      <NativeSelect
        label={t('left_menu.layout_dropdown_menu_label')}
        onChange={(event) => onLayoutSetClick(event.target.value)}
        value={selectedFormLayoutSetName}
        className={classes.layoutSetsDropDown}
      >
        {layoutSetNames.map((set: string) => {
          return (
            <option key={set} value={set}>
              {set}
            </option>
          );
        })}
      </NativeSelect>
    </div>
  );
}

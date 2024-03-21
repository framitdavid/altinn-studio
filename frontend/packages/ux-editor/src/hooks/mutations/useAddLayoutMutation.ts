import { useFormLayoutsQuery } from '../queries/useFormLayoutsQuery';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ObjectUtils } from '@studio/pure-functions';
import { createEmptyLayout } from '../../utils/formLayoutUtils';
import type { IInternalLayout } from '../../types/global';
import type { ExternalFormLayout } from 'app-shared/types/api/FormLayoutsResponse';
import { useServicesContext } from 'app-shared/contexts/ServicesContext';
import { QueryKey } from 'app-shared/types/QueryKey';
import { useFormLayoutSettingsMutation } from './useFormLayoutSettingsMutation';
import { useFormLayoutSettingsQuery } from '../queries/useFormLayoutSettingsQuery';
import type { ILayoutSettings } from 'app-shared/types/global';
import { addOrRemoveNavigationButtons } from '../../utils/formLayoutsUtils';
import { internalLayoutToExternal } from '../../converters/formLayoutConverters';
import { useSelectedFormLayoutName } from '../../hooks';

export interface AddLayoutMutationArgs {
  layoutName: string;
  isReceiptPage?: boolean;
}

export const useAddLayoutMutation = (org: string, app: string, layoutSetName: string) => {
  const { saveFormLayout } = useServicesContext();
  const formLayoutsQuery = useFormLayoutsQuery(org, app, layoutSetName);
  const formLayoutSettingsQuery = useFormLayoutSettingsQuery(org, app, layoutSetName);
  const formLayoutSettingsMutation = useFormLayoutSettingsMutation(org, app, layoutSetName);
  const { setSelectedFormLayoutName } = useSelectedFormLayoutName();
  const queryClient = useQueryClient();

  const save = async (updatedLayoutName: string, updatedLayout: IInternalLayout) => {
    const convertedLayout: ExternalFormLayout = internalLayoutToExternal(updatedLayout);
    return await saveFormLayout(org, app, updatedLayoutName, layoutSetName, convertedLayout);
  };

  return useMutation({
    mutationFn: async ({ layoutName, isReceiptPage }: AddLayoutMutationArgs) => {
      const layoutSettings: ILayoutSettings = formLayoutSettingsQuery.data;
      const layouts = formLayoutsQuery.data;

      if (Object.keys(layouts).indexOf(layoutName) !== -1) throw Error('Layout already exists');
      let newLayouts = ObjectUtils.deepCopy(layouts);

      newLayouts[layoutName] = createEmptyLayout();
      newLayouts = await addOrRemoveNavigationButtons(
        newLayouts,
        save,
        layoutName,
        isReceiptPage ? layoutName : layoutSettings.receiptLayoutName,
      );
      return { newLayouts, layoutName, isReceiptPage };
    },

    onSuccess: async ({ newLayouts, layoutName, isReceiptPage }) => {
      const layoutSettings: ILayoutSettings = ObjectUtils.deepCopy(formLayoutSettingsQuery.data);
      const { order } = layoutSettings?.pages;

      if (isReceiptPage) layoutSettings.receiptLayoutName = layoutName;
      else order.push(layoutName);

      await formLayoutSettingsMutation.mutateAsync(layoutSettings);

      queryClient.setQueryData([QueryKey.FormLayouts, org, app, layoutSetName], () => newLayouts);

      setSelectedFormLayoutName(layoutName);
    },
  });
};

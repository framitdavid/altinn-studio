import React, { useEffect } from 'react';
import { FormDesigner } from './containers/FormDesigner';
import { useText, useSelectedFormLayoutSetName, useSelectedFormLayoutName } from './hooks';
import { StudioPageSpinner } from '@studio/components';
import { ErrorPage } from './components/ErrorPage';
import { useDatamodelMetadataQuery } from './hooks/queries/useDatamodelMetadataQuery';
import { useWidgetsQuery } from './hooks/queries/useWidgetsQuery';
import { useTextResourcesQuery } from 'app-shared/hooks/queries/useTextResourcesQuery';
import { useLayoutSetsQuery } from './hooks/queries/useLayoutSetsQuery';
import { useStudioUrlParams } from 'app-shared/hooks/useStudioUrlParams';
import { FormItemContextProvider } from './containers/FormItemContext';

/**
 * This is the main React component responsible for controlling
 * the mode of the application and loading initial data for the
 * application
 */

export function App() {
  const t = useText();
  const { org, app } = useStudioUrlParams();
  const {
    selectedFormLayoutSetName,
    setSelectedFormLayoutSetName,
    removeFormSelectedLayoutSetName,
  } = useSelectedFormLayoutSetName();
  const { selectedFormLayoutName } = useSelectedFormLayoutName();
  const { data: layoutSets, isSuccess: areLayoutSetsFetched } = useLayoutSetsQuery(org, app);
  const { isSuccess: areWidgetsFetched, isError: widgetFetchedError } = useWidgetsQuery(org, app);
  const { isSuccess: isDatamodelFetched, isError: dataModelFetchedError } =
    useDatamodelMetadataQuery(org, app, selectedFormLayoutSetName);
  const { isSuccess: areTextResourcesFetched } = useTextResourcesQuery(org, app);

  useEffect(() => {
    if (
      areLayoutSetsFetched &&
      selectedFormLayoutSetName &&
      (!layoutSets || !layoutSets.sets.map((set) => set.id).includes(selectedFormLayoutSetName))
    )
      removeFormSelectedLayoutSetName();
  }, [
    areLayoutSetsFetched,
    layoutSets,
    selectedFormLayoutSetName,
    removeFormSelectedLayoutSetName,
  ]);

  const componentIsReady =
    areWidgetsFetched && isDatamodelFetched && areTextResourcesFetched && areLayoutSetsFetched;

  const componentHasError = dataModelFetchedError || widgetFetchedError;

  const mapErrorToDisplayError = (): { title: string; message: string } => {
    const defaultTitle = t('general.fetch_error_title');
    const defaultMessage = t('general.fetch_error_message');

    const createErrorMessage = (resource: string): { title: string; message: string } => ({
      title: `${defaultTitle} ${resource}`,
      message: defaultMessage,
    });

    if (dataModelFetchedError) {
      return createErrorMessage(t('general.dataModel'));
    }
    if (widgetFetchedError) {
      return createErrorMessage(t('general.widget'));
    }

    return createErrorMessage(t('general.unknown_error'));
  };

  useEffect(() => {
    if (selectedFormLayoutSetName === null && layoutSets) {
      // Only set layout set if layout sets exists and there is no layout set selected yet
      setSelectedFormLayoutSetName(layoutSets.sets[0].id);
    }
  }, [layoutSets, selectedFormLayoutSetName, setSelectedFormLayoutSetName]);

  if (componentHasError) {
    const mappedError = mapErrorToDisplayError();
    return <ErrorPage title={mappedError.title} message={mappedError.message} />;
  }

  if (componentIsReady) {
    return (
      <FormItemContextProvider>
        <FormDesigner
          selectedLayout={selectedFormLayoutName}
          selectedLayoutSet={selectedFormLayoutSetName}
        />
      </FormItemContextProvider>
    );
  }
  return <StudioPageSpinner showSpinnerTitle={false} spinnerTitle={t('ux_editor.loading_page')} />;
}

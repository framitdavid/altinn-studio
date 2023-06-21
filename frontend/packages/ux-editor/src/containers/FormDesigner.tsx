import { firstAvailableLayout } from "../utils/formLayoutsUtils";
import React, { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { RightMenu } from '../components/rightMenu/RightMenu';
import { DesignView } from './DesignView';
import classes from './FormDesigner.module.css';
import { LeftMenu } from '../components/leftMenu/LeftMenu';
import { FormContextProvider } from './FormContext';
import { deepCopy } from 'app-shared/pure';
import { useText } from '../hooks';
import { useParams, useSearchParams } from 'react-router-dom';
import { useAddLayoutMutation } from '../hooks/mutations/useAddLayoutMutation';
import { useFormLayoutsQuery } from '../hooks/queries/useFormLayoutsQuery';
import { useFormLayoutSettingsQuery } from '../hooks/queries/useFormLayoutSettingsQuery';
import { useRuleModelQuery } from '../hooks/queries/useRuleModelQuery';
import { FormLayoutActions } from '../features/formDesigner/formLayout/formLayoutSlice';
import { ErrorPage } from '../components/ErrorPage';
import { PageSpinner } from 'app-shared/components';
import { DEFAULT_SELECTED_LAYOUT_NAME } from 'app-shared/constants';
import { useRuleConfigQuery } from '../hooks/queries/useRuleConfigQuery';
import { useInstanceIdQuery } from 'app-shared/hooks/queries';

export interface FormDesignerProps {
  selectedLayout: string;
  selectedLayoutSet: string | undefined;
}

export const FormDesigner = ({ selectedLayout, selectedLayoutSet }: FormDesignerProps): JSX.Element => {
  const dispatch = useDispatch();
  const { org, app } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: instanceId } = useInstanceIdQuery(org, app);
  const { data: formLayouts, isError: layoutFetchedError } = useFormLayoutsQuery(org, app, selectedLayoutSet);
  const { data: formLayoutSettings } = useFormLayoutSettingsQuery(org, app, selectedLayoutSet);
  const { data: ruleModel } = useRuleModelQuery(org, app, selectedLayoutSet);
  const { isSuccess: isRuleConfigFetched } = useRuleConfigQuery(org, app, selectedLayoutSet);
  const addLayoutMutation = useAddLayoutMutation(org, app, selectedLayoutSet);
  const layoutOrder = useMemo(() => formLayouts?.[selectedLayout]?.order || {}, [formLayouts, selectedLayout]);
  const t = useText();

  const layoutPagesOrder = formLayoutSettings?.pages.order;

  const formLayoutIsReady =
    instanceId &&
    formLayouts &&
    formLayoutSettings &&
    ruleModel &&
    isRuleConfigFetched;

  const mapErrorToDisplayError = (): { title: string; message: string } => {
    const defaultTitle = t('general.fetch_error_title');
    const defaultMessage = t('general.fetch_error_message');

    const createErrorMessage = (resource: string): { title: string; message: string } => ({
      title: `${defaultTitle} ${resource}`,
      message: defaultMessage
    });

    if (layoutFetchedError) {
      return createErrorMessage(t('general.layout'));
    }
  }

  /**
   * Set the correct selected layout based on url parameters
   */
  useEffect(() => {
    if (searchParams.has('deletedLayout')) {
      const layoutToSelect = firstAvailableLayout(
        searchParams.get('deletedLayout'),
        layoutPagesOrder
      );
      dispatch(FormLayoutActions.updateSelectedLayout(layoutToSelect));
      setSearchParams(
        layoutToSelect !== DEFAULT_SELECTED_LAYOUT_NAME ? { layout: layoutToSelect } : {}
      );
    } else if (!searchParams.has('layout') && layoutPagesOrder?.[0]) {
      setSearchParams({ ...deepCopy(searchParams), layout: layoutPagesOrder[0] });
      dispatch(FormLayoutActions.updateSelectedLayout(layoutPagesOrder[0]));
    } else if (searchParams.has('layout')) {
      dispatch(FormLayoutActions.updateSelectedLayout(searchParams.get('layout')));
      // Need to use InstanceId as storage key since apps uses it and it is needed to sync layout between preview and editor
      if (instanceId) localStorage.setItem(instanceId, selectedLayout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, layoutPagesOrder, selectedLayout, org, app, instanceId]);


  useEffect((): void => {
    const addInitialPage = (): void => {
      const layoutName = `${t('general.page')}1`;
      addLayoutMutation.mutate({ layoutName, isReceiptPage: false });
    };

    const layoutsWithContentExist = layoutOrder && !Object.keys(layoutOrder).length;
    // Old apps might have selectedLayout='default' even when there exist a single layout.
    // Should only add initial page if no layouts exist.
    if (selectedLayout === DEFAULT_SELECTED_LAYOUT_NAME && !layoutsWithContentExist) {
      addInitialPage();
    }
  }, [app, dispatch, org, selectedLayout, t, layoutOrder, addLayoutMutation]);

  if (layoutFetchedError) {
    const mappedError = mapErrorToDisplayError();
    return <ErrorPage title={mappedError.title} message={mappedError.message}/>;
  }

  if (formLayoutIsReady) {
    return (
      <DndProvider backend={HTML5Backend}>
        <div className={classes.root}>
          <div className={classes.container}>
            <LeftMenu className={classes.leftContent + ' ' + classes.item} />
            <FormContextProvider>
              <DesignView className={classes.mainContent + ' ' + classes.item} />
              <RightMenu className={classes.rightContent + ' ' + classes.item} />
            </FormContextProvider>
          </div>
        </div>
      </DndProvider>
    );
  }
  return <PageSpinner text={t('general.loading')}/>;
};

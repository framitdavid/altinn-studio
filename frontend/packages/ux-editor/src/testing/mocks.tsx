import type { ReactNode } from 'react';
import React from 'react';
import configureStore from 'redux-mock-store';
import type { IAppDataState } from '../features/appData/appDataReducers';
import type { IAppState } from '../types/global';
import type { ITextResourcesState } from '../features/appData/textResources/textResourcesSlice';
import { Provider } from 'react-redux';
import { render, renderHook } from '@testing-library/react';
import { ServicesContextProps, ServicesContextProvider } from 'app-shared/contexts/ServicesContext';
import { IFormDesignerState } from '../features/formDesigner/formDesignerReducer';
import { ILayoutSettings } from 'app-shared/types/global';
import { BrowserRouter } from 'react-router-dom';
import ruleHandlerMock from './ruleHandlerMock';
import { PreviewConnectionContextProvider } from 'app-shared/providers/PreviewConnectionContext';
import { ruleConfig as ruleConfigMock } from './ruleConfigMock';
import {
  externalLayoutsMock,
  layout1NameMock,
  layout2NameMock,
  layoutSetsMock,
} from './layoutMock';
import { queriesMock as allQueriesMock } from 'app-shared/mocks/queriesMock';
import { QueryClient } from '@tanstack/react-query';
import expressionSchema from './schemas/json/layout/expression.schema.v1.json';
import numberFormatSchema from './schemas/json/layout/number-format.schema.v1.json';
import layoutSchema from './schemas/json/layout/layout.schema.v1.json';

export const textResourcesMock: ITextResourcesState = {
  currentEditId: undefined,
};

export const appDataMock: IAppDataState = {
  textResources: textResourcesMock,
};

export const formDesignerMock: IFormDesignerState = {
  layout: {
    error: null,
    saving: false,
    unSavedChanges: false,
    selectedLayoutSet: 'test-layout-set',
    selectedLayout: layout1NameMock,
    invalidLayouts: [],
  },
};

export const appStateMock: IAppState = {
  appData: appDataMock,
  formDesigner: formDesignerMock,
};

export const formLayoutSettingsMock: ILayoutSettings = {
  pages: {
    order: [layout1NameMock, layout2NameMock],
  },
  receiptLayoutName: 'Kvittering'
};

export const textLanguagesMock = ['nb', 'nn', 'en'];

export const optionListIdsMock: string[] = ['test-1', 'test-2'];

export const queriesMock: ServicesContextProps = {
  ...allQueriesMock,
  addAppAttachmentMetadata: jest.fn().mockImplementation(() => Promise.resolve({})),
  addLayoutSet: jest.fn(),
  configureLayoutSet: jest.fn(),
  deleteAppAttachmentMetadata: jest.fn().mockImplementation(() => Promise.resolve({})),
  deleteFormLayout: jest.fn().mockImplementation(() => Promise.resolve({})),
  getDatamodelMetadata: jest.fn().mockImplementation(() => Promise.resolve({ elements: {} })),
  getFormLayoutSettings: jest
    .fn()
    .mockImplementation(() => Promise.resolve(formLayoutSettingsMock)),
  getFormLayouts: jest.fn().mockImplementation(() => Promise.resolve(externalLayoutsMock)),
  getInstanceIdForPreview: jest.fn(),
  getOptionListIds: jest.fn().mockImplementation(() => Promise.resolve(optionListIdsMock)),
  getLayoutSets: jest.fn().mockImplementation(() => Promise.resolve(layoutSetsMock)),
  getRuleConfig: jest.fn().mockImplementation(() => Promise.resolve(ruleConfigMock)),
  getRuleModel: jest.fn().mockImplementation(() => Promise.resolve(ruleHandlerMock)),
  getTextLanguages: jest.fn().mockImplementation(() => Promise.resolve(textLanguagesMock)),
  getTextResources: jest.fn().mockImplementation(() => Promise.resolve([])),
  getWidgetSettings: jest.fn().mockImplementation(() => Promise.resolve({})),
  saveFormLayout: jest.fn().mockImplementation(() => Promise.resolve({})),
  saveFormLayoutSettings: jest.fn().mockImplementation(() => Promise.resolve({})),
  updateAppAttachmentMetadata: jest.fn().mockImplementation(() => Promise.resolve({})),
  updateFormLayoutName: jest.fn().mockImplementation(() => Promise.resolve({})),
  upsertTextResources: jest.fn().mockImplementation(() => Promise.resolve()),
  getExpressionSchema: jest.fn().mockImplementation(() => Promise.resolve(expressionSchema)),
  getLayoutSchema: jest.fn().mockImplementation(() => Promise.resolve(layoutSchema)),
  getNumberFormatSchema: jest.fn().mockImplementation(() => Promise.resolve(numberFormatSchema)),
};

export const queryClientMock = new QueryClient({
  logger: {
    log: () => {},
    warn: () => {},
    error: () => {},
  },
  defaultOptions: {
    queries: { staleTime: Infinity },
  },
});

export const renderWithMockStore =
  (state: Partial<IAppState> = {}, queries: Partial<ServicesContextProps> = {}) =>
  (component: ReactNode) => {
    const store = configureStore()({ ...appStateMock, ...state });
    const renderResult = render(
      <ServicesContextProvider {...queriesMock} {...queries} client={queryClientMock}>
        <PreviewConnectionContextProvider>
          <Provider store={store}>
            <BrowserRouter>{component}</BrowserRouter>
          </Provider>
        </PreviewConnectionContextProvider>
      </ServicesContextProvider>
    );
    return { renderResult, store };
  };
export const renderHookWithMockStore =
  (state: Partial<IAppState> = {}, queries: Partial<ServicesContextProps> = {}) =>
  (hook: () => any) => {
    const store = configureStore()({ ...appStateMock, ...state });
    const renderHookResult = renderHook(hook, {
      wrapper: ({ children }) => (
        <ServicesContextProvider {...queriesMock} {...queries} client={queryClientMock}>
          <PreviewConnectionContextProvider>
            <Provider store={store}>{children}</Provider>
          </PreviewConnectionContextProvider>
        </ServicesContextProvider>
      ),
    });
    return { renderHookResult, store };
  };

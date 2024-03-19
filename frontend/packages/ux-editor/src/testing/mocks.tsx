import type { ReactNode } from 'react';
import React from 'react';
import type { RenderOptions } from '@testing-library/react';
import { render, renderHook } from '@testing-library/react';
import type { ServicesContextProps } from 'app-shared/contexts/ServicesContext';
import { ServicesContextProvider } from 'app-shared/contexts/ServicesContext';
import type { ILayoutSettings } from 'app-shared/types/global';
import { BrowserRouter } from 'react-router-dom';
import { PreviewConnectionContextProvider } from 'app-shared/providers/PreviewConnectionContext';
import { layout1NameMock, layout2NameMock } from './layoutMock';
import { queriesMock } from 'app-shared/mocks/queriesMock';
import type { QueryClient } from '@tanstack/react-query';
import type { AppContextProps } from '../AppContext';
import { AppContext } from '../AppContext';
import { appContextMock } from './appContextMock';
import { queryClientMock } from 'app-shared/mocks/queryClientMock';

export const formLayoutSettingsMock: ILayoutSettings = {
  pages: {
    order: [layout1NameMock, layout2NameMock],
  },
  receiptLayoutName: 'Kvittering',
};

export const textLanguagesMock = ['nb', 'nn', 'en'];

export const optionListIdsMock: string[] = ['test-1', 'test-2'];

type WrapperArgs = {
  appContextProps: Partial<AppContextProps>;
  queries: Partial<ServicesContextProps>;
  queryClient: QueryClient;
};

const wrapper = ({
  appContextProps = {},
  queries = {},
  queryClient = queryClientMock,
}: WrapperArgs) => {
  const renderComponent = (component: ReactNode) => (
    <ServicesContextProvider {...queriesMock} {...queries} client={queryClient}>
      <PreviewConnectionContextProvider>
        <AppContext.Provider value={{ ...appContextMock, ...appContextProps }}>
          <BrowserRouter>{component}</BrowserRouter>
        </AppContext.Provider>
      </PreviewConnectionContextProvider>
    </ServicesContextProvider>
  );
  return { renderComponent };
};

/**
 *
 * @deprecated Use renderWithProviders instead
 */
export const renderWithMockStore =
  (
    queries: Partial<ServicesContextProps> = {},
    queryClient: QueryClient = queryClientMock,
    appContextProps: Partial<AppContextProps> = {},
  ) =>
  (component: ReactNode) => {
    const { renderComponent } = wrapper({
      appContextProps,
      queries,
      queryClient,
    });
    const renderResult = render(renderComponent(component));
    const rerender = (rerenderedComponent) =>
      renderResult.rerender(renderComponent(rerenderedComponent));
    return { renderResult: { ...renderResult, rerender } };
  };

export const renderHookWithMockStore =
  (
    queries: Partial<ServicesContextProps> = {},
    queryClient: QueryClient = queryClientMock,
    appContextProps: Partial<AppContextProps> = {},
  ) =>
  (hook: () => any) => {
    const { renderComponent } = wrapper({
      appContextProps,
      queries,
      queryClient,
    });
    const renderHookResult = renderHook(hook, {
      wrapper: ({ children }) => renderComponent(children),
    });
    return { renderHookResult };
  };

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  queries?: Partial<ServicesContextProps>;
  queryClient?: QueryClient;
  appContextProps?: Partial<AppContextProps>;
}

export const renderWithProviders = (
  component: ReactNode,
  {
    queries = {},
    queryClient = queryClientMock,
    appContextProps = {},
    ...renderOptions
  }: Partial<ExtendedRenderOptions> = {},
) => {
  function Wrapper({ children }: React.PropsWithChildren<unknown>) {
    return (
      <ServicesContextProvider {...queriesMock} {...queries} client={queryClient}>
        <PreviewConnectionContextProvider>
          <AppContext.Provider value={{ ...appContextMock, ...appContextProps }}>
            <BrowserRouter>{children}</BrowserRouter>
          </AppContext.Provider>
        </PreviewConnectionContextProvider>
      </ServicesContextProvider>
    );
  }

  return {
    ...render(component, {
      wrapper: Wrapper,
      ...renderOptions,
    }),
  };
};

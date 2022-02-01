import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { RenderOptions } from '@testing-library/react';
import type { PreloadedState } from '@reduxjs/toolkit';
import { RootState, AppStore, setupStore } from 'src/store';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: PreloadedState<RootState>;
  store?: AppStore;
}

export const renderWithProviders = (
  component: any,
  {
    preloadedState = {},
    store = setupStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {},
) => {
  function Wrapper({ children }: React.PropsWithChildren<unknown>) {
    return <Provider store={store}>{children}</Provider>;
  }

  return {
    store,
    ...rtlRender(component, {
      wrapper: Wrapper,
      ...renderOptions,
    }),
  };
};


export const handlers = [
  rest.get(
    'https://api.bring.com/shippingguide/api/postalCode.json',
    (req, res, ctx) => {
      const mockApiResponse = {
        valid: true,
        result: 'OSLO',
      };
      return res(ctx.json(mockApiResponse));
    },
  ),
];

export { setupServer, rest };

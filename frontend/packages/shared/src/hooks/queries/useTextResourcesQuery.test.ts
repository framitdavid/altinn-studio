import { queriesMock } from 'app-shared/mocks/queriesMock';
import {
  renderHookWithMockStore,
  textLanguagesMock,
} from '../../../../ux-editor/src/testing/mocks';
import { useTextResourcesQuery } from './useTextResourcesQuery';
import { waitFor } from '@testing-library/react';

// Test data:
const org = 'org';
const app = 'app';

describe('useTextResourcesQuery', () => {
  it('Calls getTextResources for each language', async () => {
    const getTextLanguages = jest.fn().mockImplementation(() => Promise.resolve(textLanguagesMock));
    const { result: resourcesResult } = renderHookWithMockStore(
      {},
      {
        getTextLanguages,
      },
    )(() => useTextResourcesQuery(org, app)).renderHookResult;
    await waitFor(() => expect(resourcesResult.current.isSuccess).toBe(true));
    expect(getTextLanguages).toHaveBeenCalledTimes(1);
    expect(getTextLanguages).toHaveBeenCalledWith(org, app);
    expect(queriesMock.getTextResources).toHaveBeenCalledTimes(textLanguagesMock.length);
    textLanguagesMock.forEach((language) => {
      expect(queriesMock.getTextResources).toHaveBeenCalledWith(org, app, language);
    });
  });
});

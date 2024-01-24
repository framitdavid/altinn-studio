import { expect } from '@playwright/test';
import { Gitea } from '../../helpers/Gitea';
import { test } from '../../extenders/testExtend';

test('Delete the test app', async ({ request, testAppName }) => {
  const gitea = new Gitea();
  const response = await request.delete(gitea.getDeleteAppEndpoint({ app: testAppName }));
  expect(response.ok()).toBeTruthy();

  const response2 = await request.delete(gitea.getDeleteAppEndpoint({ app: `${testAppName}2` }));
  expect(response2.ok()).toBeTruthy();
});

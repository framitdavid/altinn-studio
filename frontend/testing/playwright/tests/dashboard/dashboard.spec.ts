import { Page, expect } from '@playwright/test';
import { test } from '../../extenders/testExtend';
import { DesignerApi } from '../../helpers/DesignerApi';
import type { StorageState } from '../../types/StorageState';
import { DashboardPage } from 'testing/playwright/pages/DashboardPage';

// This line must be there to ensure that the tests do not run in parallell, and
// that the before all call is being executed before we start the tests
test.describe.configure({ mode: 'serial' });

// Before the tests starts, we need to create the dashboard app
test.beforeAll(async ({ testAppName, request, storageState }) => {
  // Create a new app
  const designerApi1 = new DesignerApi({ app: testAppName });
  const response1 = await designerApi1.createApp(request, storageState as StorageState);
  expect(response1.ok()).toBeTruthy();
});

const setupAndVerifyDashboardPage = async (
  page: Page,
  testAppName: string,
): Promise<DashboardPage> => {
  const dashboardPage = new DashboardPage(page, { app: testAppName });
  await dashboardPage.loadDashboardPage();
  await dashboardPage.verifyDashboardPage();
  return dashboardPage;
};

test('It is possible to view apps, and add and remove from favourites', async ({
  page,
  testAppName,
}) => {
  const dashboardPage = await setupAndVerifyDashboardPage(page, testAppName);

  await dashboardPage.clickOnStarFirstApplication();
});

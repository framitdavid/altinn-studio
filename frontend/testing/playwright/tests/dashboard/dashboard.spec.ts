import { Page, expect } from '@playwright/test';
import { test } from '../../extenders/testExtend';
import { DataModelPage } from '../../pages/DataModelPage';
import { DesignerApi } from '../../helpers/DesignerApi';
import type { StorageState } from '../../types/StorageState';
import { DashboardPage } from 'testing/playwright/pages/DashboardPage';

// This line must be there to ensure that the tests do not run in parallell, and
// that the before all call is being executed before we start the tests
test.describe.configure({ mode: 'serial' });

// Before the tests starts, we need to create the dashboard app
test.beforeAll(async ({ testAppName, request, storageState }) => {
  // Create a new app
  const designerApi = new DesignerApi({ app: testAppName });
  const response = await designerApi.createApp(request, storageState as StorageState);
  expect(response.ok()).toBeTruthy();
});

test.beforeEach(async ({ page, testAppName }) => {
  // Load the dashboard page
  const dashboardPage = new DashboardPage(page, { app: testAppName });
  await dashboardPage.loadDashboardPage();
  await dashboardPage.verifyDashboardPage();
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

test('that the page does not have any broken links', async ({ page, testAppName }) => {
  const dashboardPage = await setupAndVerifyDashboardPage(page, testAppName);
});

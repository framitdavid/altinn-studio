import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';
import { ExtendedTestOptions } from './extenders/testExtend';

// TODO - make enum
const DATAMODEL_APP_TEST_NAME = 'data-model-app-test';

config();

export default defineConfig<ExtendedTestOptions>({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    locale: 'nb-NO',
    timezoneId: 'Europe/Oslo',
    trace: 'on-first-retry',
  },

  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'create-app-only',
      dependencies: ['setup'],
      testDir: './tests/create-app-only/',
      testMatch: '*.spec.ts',
      teardown: 'teardown-create-app-only',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL,
        storageState: '.playwright/auth/user.json',
        testAppName: 'simple-app-test',
        headless: true,
      },
    },
    {
      name: 'teardown-create-app-only',
      testDir: './tests/create-app-only/',
      testMatch: '*create-app-only.teardown.ts',
      use: {
        baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL,
        testAppName: 'simple-app-test',
      },
    },
    {
      name: 'data-model',
      dependencies: ['setup'],
      testDir: './tests/data-model/',
      testMatch: '*.spec.ts',
      teardown: 'teardown-data-model',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL,
        storageState: '.playwright/auth/user.json',
        testAppName: DATAMODEL_APP_TEST_NAME,
        headless: true,
      },
    },
    {
      name: 'teardown-data-model',
      testDir: './tests/data-model/',
      testMatch: '*data-model.teardown.ts',
      use: {
        baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL,
        testAppName: DATAMODEL_APP_TEST_NAME,
      },
    },
  ],
});

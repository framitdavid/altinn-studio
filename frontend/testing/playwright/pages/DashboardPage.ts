﻿import { BasePage } from '../helpers/BasePage';
import { Locator, Page } from '@playwright/test';
import { Environment } from '../helpers/StudioEnvironment';

export class DashboardPage extends BasePage {
  constructor(page: Page, environment?: Environment) {
    super(page, environment);
  }

  public async loadDashboardPage(): Promise<void> {
    await this.page.goto(this.getRoute('dashboard'));
  }

  public async verifyDashboardPage(): Promise<void> {
    await this.page.waitForURL(this.getRoute('dashboard'));
  }

  public async clickOnCreateAppLink(): Promise<void> {
    await this.getLinkByTextKey('dashboard.new_service').click();
  }

  public async getAllRows(): Promise<Locator[]> {
    return await this.page.getByRole('row').all();
  }

  public async clickOnStarFirstApplication(): Promise<void> {
    await this.getButtonByTextKey('dashboard.star').click();
  }
}

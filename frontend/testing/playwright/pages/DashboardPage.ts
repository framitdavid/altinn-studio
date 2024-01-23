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
    await this.page.getByRole('link', { name: this.textMock('dashboard.new_service') }).click();
  }

  public async checkThatAllLinksAreValid(): Promise<void> {
    const links = this.getAllLinks();
  }

  private async getAllLinks(): Promise<Locator[]> {
    return await this.page.locator('role=link').all();
  }
}

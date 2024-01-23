import { BasePage } from '../helpers/BasePage';
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

  public async checkThatThereIsNoFavouriteAppInList(appName: string): Promise<void> {
    // The .first() is added becuase the key is used two places; one in favourite list, and one in all applications list
    await this.getMenuItemByTextKey('dashboard.unstar', { appName }).first().isHidden();
  }

  public async clickOnFavouriteApplication(appName: string): Promise<void> {
    await this.getMenuItemByTextKey('dashboard.star', { appName }).click();
  }

  public async checkThatThereIsFavouriteAppInList(appName: string): Promise<void> {
    await this.getMenuItemByTextKey('dashboard.star', { appName }).isVisible();
  }

  public async clickOnUnFavouriteApplicatin(appName: string): Promise<void> {
    // The .first() is added becuase the key is used two places; one in favourite list, and one in all applications list
    await this.getMenuItemByTextKey('dashboard.unstar', { appName }).first().click();
  }
}

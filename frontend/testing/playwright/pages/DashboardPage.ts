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

  public async clickOnHeaderAvatar(): Promise<void> {
    await this.page.getByAltText(this.textMock('shared.header_button_alt')).click();
  }

  public async clickOnAllApplications(): Promise<void> {
    await this.getMenuItemByTextKey('shared.header_all').click();
  }

  public async checkThatAllApplicationsHeaderIsVisible(): Promise<void> {
    await this.getHeadingByTextKeyAndLevel('dashboard.all_apps', 2).isVisible();
  }

  public async clickOnOrgApplications(): Promise<void> {
    await this.getMenuItemByName(this.getOrgName()).click();
  }

  public async checkThatAllOrgApplicationsHeaderIsVisible(): Promise<void> {
    await this.getHeadingByTextKeyAndLevel('dashboard.org_apps', 2, {
      orgName: this.getOrgName(),
    }).isVisible();
  }
}

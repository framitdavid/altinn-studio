import { BasePage } from '../helpers/BasePage';
import type { Environment } from '../helpers/StudioEnvironment';
import type { Page } from '@playwright/test';
import type { LanguageCode } from '../enum/LanguageCode';
import { expect } from '@playwright/test';

export class TextEditorPage extends BasePage {
  constructor(page: Page, environment?: Environment) {
    super(page, environment);
  }

  public async loadTextEditorPage(): Promise<void> {
    await this.page.goto(this.getRoute('editorText'));
  }

  public async verifyTextEditorPage(): Promise<void> {
    await this.page.waitForURL(this.getRoute('editorText'));
  }

  public async verifyThatTextareaIsVisibleWithCorrectId(
    lang: LanguageCode,
    textKey: string,
  ): Promise<void> {
    await this.page
      .getByLabel(
        this.textMock('text_editor.table_row_input_label', {
          lang: this.textMock(`language.${lang}`),
          textKey: textKey,
        }),
      )
      .isVisible();
  }

  public async getTextareaValue(lang: LanguageCode, textKey: string): Promise<string> {
    return await this.page
      .getByRole('textbox', {
        name: this.textMock('text_editor.table_row_input_label', {
          lang: this.textMock(`language.${lang}`),
          textKey: textKey,
        }),
      })
      .inputValue();
  }

  public async verifyThatTextKeyIsVisible(textKey: string): Promise<void> {
    await this.page.getByText(textKey, { exact: true }).isVisible();
  }

  public async clickOnChangeTextKeyButton(textKey: string): Promise<void> {
    await this.page
      .getByRole('button', { name: this.textMock('text_editor.toggle_edit_mode', { textKey }) })
      .click();
  }

  public async writeNewTextKey(oldTextKey: string, newTextKey: string): Promise<void> {
    await this.page
      .getByRole('textbox', {
        name: this.textMock('text_editor.key.edit', { textKey: oldTextKey }),
      })
      .fill(newTextKey);
  }

  public async waitForTextareaToUpdateTheLabel(lang: LanguageCode, textKey: string): Promise<void> {
    const textarea = this.page.getByRole('textbox', {
      name: this.textMock('text_editor.table_row_input_label', {
        lang: this.textMock(`language.${lang}`),
        textKey: textKey,
      }),
    });

    await expect(textarea).toBeVisible();
  }

  public async clickOnAddNewTextButton(): Promise<void> {
    await this.page
      .getByRole('button', {
        name: this.textMock('text_editor.new_text'),
      })
      .click();
  }

  public async waitForNewTextareaToAppear(): Promise<void> {
    // The numbers behind _ is autogenerated, so we no not know the exact id at the moment.
    const newId: string = 'id_';

    const textarea = this.page.getByRole('textbox', {
      name: this.textMock('text_editor.table_row_input_label', {
        lang: this.textMock('language.nb'),
        textKey: newId,
      }),
    });

    await expect(textarea).toBeVisible();
  }

  public async writeNewTextInTextarea(
    lang: LanguageCode,
    textKey: string,
    newValue: string,
  ): Promise<void> {
    await this.page
      .getByRole('textbox', {
        name: this.textMock('text_editor.table_row_input_label', {
          lang: this.textMock(`language.${lang}`),
          textKey: textKey,
        }),
      })
      .fill(newValue);
  }

  public async openSelectLanguageCombobox(): Promise<void> {
    await this.page
      .getByRole('combobox', {
        name: this.textMock('schema_editor.language_add_language'),
      })
      .click();
  }

  public async selectOptionFromLanguageCombobox(lang: LanguageCode): Promise<void> {
    await this.page.getByRole('option', { name: this.textMock(`language.${lang}`) }).click();
  }

  public async clickOnAddLanguageButton(): Promise<void> {
    await this.page
      .getByRole('button', { name: this.textMock('general.add'), exact: true })
      .click();
  }

  public async waitForLanguageCheckboxToAppear(lang: LanguageCode): Promise<void> {
    const checkbox = this.page.getByRole('checkbox', { name: lang });
    await expect(checkbox).toBeVisible();
  }

  public async verifyThatTextareaIsHidden(lang: LanguageCode, textKey: string): Promise<void> {
    await this.page
      .getByRole('textbox', {
        name: this.textMock('text_editor.table_row_input_label', {
          lang: this.textMock(`language.${lang}`),
          textKey: textKey,
        }),
      })
      .isHidden();
  }

  public async clickOnLanguageCheckbox(lang: LanguageCode): Promise<void> {
    await this.page.getByRole('checkbox', { name: lang }).click();
  }
}

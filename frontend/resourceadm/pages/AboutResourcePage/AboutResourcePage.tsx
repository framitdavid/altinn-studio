import React, { useRef, useState } from 'react';
import classes from './AboutResourcePage.module.css';
import {
  Select,
  TextField,
  TextArea,
  ErrorMessage,
  Heading,
  Paragraph,
  Label,
} from '@digdir/design-system-react';
import { Switch } from 'resourceadm/components/Switch';
import { useParams } from 'react-router-dom';
import type { SupportedLanguage, Translation } from 'resourceadm/types/global';
import type {
  ResourceThematic,
  SupportedLanguageKey,
  Resource,
  ResourceTypeOption,
  ResourceKeyword,
  ResourceSector,
} from 'app-shared/types/ResourceAdm';
import { ScreenReaderSpan } from 'resourceadm/components/ScreenReaderSpan';
import { RightTranslationBar } from 'resourceadm/components/RightTranslationBar';
import {
  getMissingInputLanguageString,
  getResourcePageTextfieldError,
} from 'resourceadm/utils/resourceUtils';
import { resourceTypeMap } from 'resourceadm/utils/resourceUtils/resourceUtils';
import { useTranslation } from 'react-i18next'

/**
 * Initial value for languages with empty fields
 */
const emptyLangauges: SupportedLanguage = { nb: '', nn: '', en: '' };

type AboutResourcePageProps = {
  /**
   * Flag to decide if all errors should be shown or not
   */
  showAllErrors: boolean;
  /**
   * The metadata for the resource
   */
  resourceData: Resource;
  /**
   * The list of possible sectors
   */
  sectorsData: ResourceSector[];
  /**
   * The list of possible thematic areas
   */
  thematicData: ResourceThematic[];
  /**
   * Function to be handled when saving the resource
   * @param r the resource
   * @returns void
   */
  onSaveResource: (r: Resource) => void;
};

/**
 * @component
 *    Page that displays information about a resource
 *
 * @property {boolean}[showAllErrors] - Flag to decide if all errors should be shown or not
 * @property {Resource}[resourceData] - The metadata for the resource
 * @property {ResourceSector[]}[sectorsData] - The list of possible sectors
 * @property {ResourceThematic[]}[thematicData] - The list of possible thematic areas
 * @property {function}[onSaveResource] - Function to be handled when saving the resource
 *
 * @returns {React.ReactNode} - The rendered component
 */
export const AboutResourcePage = ({
  showAllErrors,
  resourceData,
  sectorsData,
  thematicData,
  onSaveResource,
}: AboutResourcePageProps): React.ReactNode => {
  const { t } = useTranslation();

  const { resourceId } = useParams();

  /**
   * Resource type options
   */
  const resourceTypeOptions = Object.keys(resourceTypeMap).map(key => ({
    value: key,
    label: resourceTypeMap[key]
  }));

  /**
   * ------------ Temporary functions -------------
   * The first one maps keyword to string, and the second from string to keyword
   *
   * TODO - Find out how to handle it in the future
   */
  const mapKeywordsArrayToString = (resourceKeywords: ResourceKeyword[]): string => {
    return resourceKeywords.map((k) => k.word).join(', ');
  };
  const mapKeywordStringToKeywordTypeArray = (keywrodString: string): ResourceKeyword[] => {
    return keywrodString.split(', ').map((val) => ({ language: 'nb', word: val.trim() }));
  };

  // States to store the different input values
  const [resourceType, setResourceType] = useState<ResourceTypeOption>(resourceData.resourceType);
  const [title, setTitle] = useState<SupportedLanguageKey<string>>(
    resourceData.title ?? emptyLangauges
  );
  const [description, setDescription] = useState<SupportedLanguageKey<string>>(
    resourceData.description ?? emptyLangauges
  );
  const [homepage, setHomepage] = useState(resourceData.homepage ?? '');
  const [keywords, setKeywords] = useState(
    resourceData.keywords ? mapKeywordsArrayToString(resourceData.keywords) : ''
  );
  const [sector, setSector] = useState<string[]>(
    resourceData.sector
      ? resourceData.sector.map((s) => sectorsData.find((sd) => sd.code === s).label['nb'])
      : []
  );
  const [thematicArea, setThematicArea] = useState(resourceData.thematicArea ?? '');
  const [rightDescription, setRightDescription] = useState<SupportedLanguageKey<string>>(
    resourceData.rightDescription ?? emptyLangauges
  );
  const [isPublicService, setIsPublicService] = useState(resourceData.isPublicService ?? false);

  // To handle which translation value is shown in the right menu
  const [translationType, setTranslationType] = useState<Translation>('none');

  // To handle the error state of the page
  const [hasResourceTypeError, setHasResourceTypeError] = useState(
    resourceData.resourceType === undefined || resourceData.resourceType === null
  );
  const [hasTitleError, setHasTitleError] = useState(
    getResourcePageTextfieldError(resourceData.title)
  );
  const [hasDescriptionError, setHasDescriptionError] = useState(
    getResourcePageTextfieldError(resourceData.description)
  );
  const [hasRightDescriptionError, setHasRightDescriptionError] = useState(
    getResourcePageTextfieldError(resourceData.rightDescription)
  );

  // useRefs to handle tabbing between the input elements and the right translation bar
  const rightTranslationBarRef = useRef(null);
  const titleFieldRef = useRef(null);
  const descriptionFieldRef = useRef(null);
  const homePageRef = useRef(null);
  const rightDescriptionRef = useRef(null);
  const isPublicServiceRef = useRef(null);

  /**
   * Function that saves the resource to backend
   */
  const handleSaveResource = () => {
    // Map sectoroption to with label to the sector code - TODO: Language
    const sectorToSave: string[] = sector.map(
      (s) => sectorsData.find((sd) => sd.label['nb'] === s).code
    );

    const editedResourceObject: Resource = {
      ...resourceData,
      identifier: resourceId,
      resourceType,
      title,
      description,
      keywords: mapKeywordStringToKeywordTypeArray(keywords),
      homepage,
      isPublicService,
      sector: sectorToSave,
      thematicArea,
      rightDescription,
    };

    onSaveResource(editedResourceObject);
  };

  /**
   * Handles the change in the dropdown of resource type. Based on the string
   * selected it updates the resource type with the correct key.
   *
   * @param type the selected string
   */
  const handleChangeResourceType = (type: ResourceTypeOption) => {
    setResourceType(type);
    setHasResourceTypeError(!Object.keys(resourceTypeMap).includes(type));
  };

  /**
   * Displays the given text in a warning card
   *
   * @param text the text to display
   */
  const displayWarningCard = (text: string) => {
    return (
      <div className={classes.warningCardWrapper}>
        <ErrorMessage size='small'>{text}</ErrorMessage>
      </div>
    );
  };

  /**
   * Sets the values of the selected field and updates if the error is shown or not.
   *
   * @param value the value typed in the input field
   */
  const handleChangeTranslationValues = (value: SupportedLanguage) => {
    const error = value.nb === '' || value.nn === '' || value.en === '';
    if (translationType === 'title') {
      setHasTitleError(error);
      setTitle(value);
    }
    if (translationType === 'description') {
      setHasDescriptionError(error);
      setDescription(value);
    }
    if (translationType === 'rightDescription') {
      setHasRightDescriptionError(error);
      setRightDescription(value);
    }
  };

  /**
   * Function that handles the tabbing into the right translation bar
   */
  const handleTabKeyIntoRightBar = (e: any) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      if (rightTranslationBarRef.current) {
        rightTranslationBarRef.current.focus();
      }
    }
  };

  /**
   * Function that handles the leaving of the right translation bar.
   * It sets the ref to the next element on the page so that the
   * navigation feels natural.
   */
  const handleLeaveLastFieldRightBar = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.key === 'Tab') {
      if (translationType === 'title') {
        if (descriptionFieldRef.current) {
          e.preventDefault();
          descriptionFieldRef.current.focus();
        }
      }
      if (translationType === 'description') {
        if (homePageRef.current) {
          e.preventDefault();
          homePageRef.current.focus();
        }
      }
      if (translationType === 'rightDescription') {
        if (isPublicServiceRef.current) {
          e.preventDefault();
          isPublicServiceRef.current.focus(null);
        }
      }
    }
  };

  /**
   * Displays the correct content in the right translation bar.
   */
  const displayRightTranslationBar = () => {
    return (
      <div className={classes.rightWrapper}>
        <RightTranslationBar
          title={
            translationType === 'title'
              ? t('resourceadm.about_resource_translation_title')
              : translationType === 'description'
              ? t('resourceadm.about_resource_translation_description')
              : t('resourceadm.about_resource_translation_right_description')
          }
          value={
            translationType === 'title'
              ? title
              : translationType === 'description'
              ? description
              : rightDescription
          }
          onLanguageChange={handleChangeTranslationValues}
          usesTextArea={translationType === 'description'}
          showErrors={showAllErrors}
          ref={rightTranslationBarRef}
          onLeaveLastField={handleLeaveLastFieldRightBar}
          onBlur={handleSaveResource}
        />
      </div>
    );
  };

  /**
   * Displays the content on the page
   */
  const displayContent = () => {
    return (
      <>
        <Heading size='large' spacing level={1}>
          {t('resourceadm.about_resource_title')}
        </Heading>
        <Label size='medium' spacing>
          {t('resourceadm.about_resource_resource_type')}
        </Label>
        <Paragraph short size='small'>
          {t('resourceadm.about_resource_resource_type_label')}
        </Paragraph>
        <div className={classes.inputWrapper}>
          <Select
            options={resourceTypeOptions.map(o => ({ ...o, label: t(o.label) }))}
            onChange={handleChangeResourceType}
            value={resourceType}
            label={t('resourceadm.about_resource_resource_type')}
            hideLabel
            onFocus={() => setTranslationType('none')}
            error={showAllErrors && hasResourceTypeError}
            onBlur={handleSaveResource}
          />
          {showAllErrors &&
            hasResourceTypeError &&
            displayWarningCard(t('resourceadm.about_resource_resource_type_error'))}
        </div>
        <div className={classes.divider} />
        <Label size='medium' spacing>
          {t('resourceadm.about_resource_resource_title_label')}
        </Label>
        <Paragraph size='small'>
          {t('resourceadm.about_resource_resource_title_text')}
        </Paragraph>
        <div className={classes.inputWrapper}>
          <TextField
            value={title['nb']}
            onChange={(e) => handleChangeTranslationValues({ ...title, nb: e.target.value })}
            onFocus={() => setTranslationType('title')}
            aria-labelledby='resource-title'
            isValid={!(showAllErrors && hasTitleError && title['nb'] === '')}
            ref={titleFieldRef}
            onKeyDown={handleTabKeyIntoRightBar}
            onBlur={handleSaveResource}
          />
          <ScreenReaderSpan
            id='resource-title'
            label={t('resourceadm.about_resource_resource_title_sr_label')}
          />
          {showAllErrors &&
            hasTitleError &&
            displayWarningCard(getMissingInputLanguageString(title, t('resourceadm.about_resource_error_usage_string_title'), t))}
        </div>
        <div className={classes.divider} />
        <Label size='medium' spacing>
          {t('resourceadm.about_resource_resource_description_label')}
        </Label>
        <Paragraph size='small'>
          {t('resourceadm.about_resource_resource_description_text')}
        </Paragraph>
        <div className={classes.inputWrapper}>
          <TextArea
            value={description['nb']}
            resize='vertical'
            onChange={(e) => {
              handleChangeTranslationValues({ ...description, nb: e.currentTarget.value });
            }}
            onFocus={() => setTranslationType('description')}
            rows={5}
            aria-labelledby='resource-description'
            isValid={!(showAllErrors && hasDescriptionError && description['nb'] === '')}
            ref={descriptionFieldRef}
            onKeyDown={handleTabKeyIntoRightBar}
            onBlur={handleSaveResource}
          />
          <ScreenReaderSpan
            id='resource-description'
            label={t('resourceadm.about_resource_resource_description_sr_label')}
          />
          {showAllErrors &&
            hasDescriptionError &&
            displayWarningCard(getMissingInputLanguageString(description, t('resourceadm.about_resource_error_usage_string_description'), t))}
        </div>
        {/* TODO - Find out if 'Tilgjengelig språk' should be inserted here */}
        <div className={classes.divider} />
        <Label size='medium' spacing>
          {t('resourceadm.about_resource_homepage_label')}
        </Label>
        <Paragraph short size='small'>
          {t('resourceadm.about_resource_homepage_text')}
        </Paragraph>
        <div className={classes.inputWrapper}>
          <TextField
            value={homepage}
            onChange={(e) => setHomepage(e.target.value)}
            aria-labelledby='resource-homepage'
            onFocus={() => setTranslationType('none')}
            ref={homePageRef}
            onBlur={handleSaveResource}
          />
          <ScreenReaderSpan
            id='resource-homepage'
            label={t('resourceadm.about_resource_homepage_sr_label')}
          />
        </div>
        <div className={classes.divider} />
        <Label size='medium' spacing>
          {t('resourceadm.about_resource_keywords_label')}
        </Label>
        <Paragraph size='small'>
          {t('resourceadm.about_resource_keywords_text')}
        </Paragraph>
        <div className={classes.inputWrapper}>
          <TextField
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            aria-labelledby='resource-keywords'
            onFocus={() => setTranslationType('none')}
            onBlur={handleSaveResource}
          />
          <ScreenReaderSpan
            id='resource-keywords'
            label={t('resourceadm.about_resource_keywords_sr_label')}
          />
        </div>
        <div className={classes.divider} />
        <Label size='medium' spacing>
          {t('resourceadm.about_resource_sector_label')}
        </Label>
        <Paragraph size='small'>
          {t('resourceadm.about_resource_sector_text')}
        </Paragraph>
        <div className={classes.inputWrapper}>
          <Select
            multiple
            // TODO - Language
            options={sectorsData.map((sd) => ({ value: sd.label['nb'], label: sd.label['nb'] }))}
            onChange={(e) => setSector(e)}
            value={sector}
            label={t('resourceadm.about_resource_sector_sr_label')}
            hideLabel
            onFocus={() => setTranslationType('none')}
            onBlur={handleSaveResource}
          />
        </div>
        <div className={classes.divider} />
        <Label size='medium' spacing>
          {t('resourceadm.about_resource_thematic_label')}
        </Label>
        <Paragraph size='small'>
          {t('resourceadm.about_resource_thematic_text')}
        </Paragraph>
        <div className={classes.inputWrapper}>
          <Select
            options={thematicData.map((td) => ({ value: td.uri, label: td.uri }))}
            onChange={(e: string) => setThematicArea(e)}
            value={thematicArea}
            label={t('resourceadm.about_resource_thematic_sr_label')}
            hideLabel
            onFocus={() => setTranslationType('none')}
            onBlur={handleSaveResource}
          />
        </div>
        <div className={classes.divider} />
        <Label size='medium' spacing>
          {t('resourceadm.about_resource_rights_description_label')}
        </Label>
        <Paragraph size='small'>
          {t('resourceadm.about_resource_rights_description_text')}
        </Paragraph>
        <div className={classes.inputWrapper}>
          <TextField
            value={rightDescription['nb']}
            onChange={(e) => setRightDescription({ ...rightDescription, nb: e.target.value })}
            aria-labelledby='resource-delegationtext'
            onFocus={() => setTranslationType('rightDescription')}
            ref={rightDescriptionRef}
            onKeyDown={handleTabKeyIntoRightBar}
            onBlur={handleSaveResource}
            isValid={!(showAllErrors && hasRightDescriptionError && rightDescription['nb'] === '')}
          />
          <ScreenReaderSpan
            id='resource-delegationtext'
            label={t('resourceadm.about_resource_rights_description_sr_label')}
          />
          {showAllErrors &&
            hasRightDescriptionError &&
            displayWarningCard(getMissingInputLanguageString(rightDescription, t('resourceadm.about_resource_error_usage_string_rights_description'), t))}
        </div>
        <div className={classes.divider} />
        <Label size='medium' spacing>
          {t('resourceadm.about_resource_public_service_label')}
        </Label>
        <Paragraph short size='small'>
          {t('resourceadm.about_resource_public_service_text')}
        </Paragraph>
        <div className={classes.inputWrapper}>
          <Switch
            isChecked={isPublicService}
            onToggle={(b: boolean) => setIsPublicService(b)}
            onFocus={() => setTranslationType('none')}
            ref={isPublicServiceRef}
            onBlur={handleSaveResource}
          />
          <p
            className={isPublicService ? classes.toggleTextActive : classes.toggleTextInactive}
          >
            {t('resourceadm.about_resource_public_service_show_text', { showText: isPublicService ? t('resourceadm.about_resource_public_service_show') : t('resourceadm.about_resource_public_service_dont_show') })}
          </p>
        </div>
      </>
    );
  };

  return (
    <div className={classes.wrapper}>
      <div className={classes.pageWrapper}>{displayContent()}</div>
      {translationType !== 'none' && displayRightTranslationBar()}
    </div>
  );
};

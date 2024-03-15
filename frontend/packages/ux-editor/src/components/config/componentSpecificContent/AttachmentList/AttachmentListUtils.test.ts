import {
  convertInternalToExternalFormat,
  reservedDataTypes,
  convertExternalToInternalFormat,
  selectionIsValid,
} from './AttachmentListUtils';
import type { InternalDataTypesFormat } from './AttachmentListUtils';
import type { KeyValuePairs } from 'app-shared/types/KeyValuePairs';

describe('Convert to external format: convertInternalToExternalFormat', () => {
  type TestCaseConvertToExternalFormat = {
    availableAttachments: {
      attachmentsCurrentTasks: string[];
      attachmentsAllTasks: string[];
    };
    dataTypeIds: {
      currentTask: boolean;
      includePdf: boolean;
      selectedDataTypes: string[];
    };
    expectedResults: string[];
  };

  const testCasesDataTypes: KeyValuePairs<TestCaseConvertToExternalFormat> = {
    'all attachments and current task and pdf': {
      availableAttachments: {
        attachmentsCurrentTasks: ['attachment2'],
        attachmentsAllTasks: ['attachment1', 'attachment2'],
      },
      dataTypeIds: {
        currentTask: true,
        includePdf: true,
        selectedDataTypes: ['attachment2'],
      },
      expectedResults: [reservedDataTypes.includeAll, reservedDataTypes.currentTask],
    },
    'all attachments and all tasks and pdf': {
      availableAttachments: {
        attachmentsCurrentTasks: ['attachment2'],
        attachmentsAllTasks: ['attachment1', 'attachment2'],
      },
      dataTypeIds: {
        currentTask: false,
        includePdf: true,
        selectedDataTypes: ['attachment1', 'attachment2'],
      },
      expectedResults: [reservedDataTypes.includeAll],
    },
    'all attachments and current task': {
      availableAttachments: {
        attachmentsCurrentTasks: ['attachment2'],
        attachmentsAllTasks: ['attachment1', 'attachment2'],
      },
      dataTypeIds: {
        currentTask: true,
        includePdf: false,
        selectedDataTypes: ['attachment2'],
      },
      expectedResults: [reservedDataTypes.currentTask],
    },
    'all attachments and all tasks': {
      availableAttachments: {
        attachmentsCurrentTasks: ['attachment1', 'attachment2'],
        attachmentsAllTasks: ['attachment1', 'attachment2'],
      },
      dataTypeIds: {
        currentTask: false,
        includePdf: false,
        selectedDataTypes: ['attachment1', 'attachment2'],
      },
      expectedResults: [],
    },
    'some attachments and current task and pdf': {
      availableAttachments: {
        attachmentsCurrentTasks: ['attachment2', 'attachment3'],
        attachmentsAllTasks: ['attachment1', 'attachment2', 'attachment3'],
      },
      dataTypeIds: {
        currentTask: true,
        includePdf: true,
        selectedDataTypes: ['attachment2'],
      },
      expectedResults: [
        'attachment2',
        reservedDataTypes.refDataAsPdf,
        reservedDataTypes.currentTask,
      ],
    },
    'some attachments and all tasks': {
      availableAttachments: {
        attachmentsCurrentTasks: ['attachment2'],
        attachmentsAllTasks: ['attachment1', 'attachment2'],
      },
      dataTypeIds: {
        currentTask: false,
        includePdf: false,
        selectedDataTypes: ['attachment1'],
      },
      expectedResults: ['attachment1'],
    },
  };

  const testCaseNames: (keyof typeof testCasesDataTypes)[] = Object.keys(testCasesDataTypes);

  it.each(testCaseNames)('should convert to external format with %s', (testCaseName) => {
    const testCase = testCasesDataTypes[testCaseName];
    expect(
      convertInternalToExternalFormat({
        availableAttachments: testCase.availableAttachments,
        dataTypeIds: testCase.dataTypeIds,
      }),
    ).toEqual(testCase.expectedResults);
  });
});

describe('Convert to internal format: convertExternalToInternalFormat', () => {
  type TestCaseConvertInternalFormat = {
    availableAttachments: {
      attachmentsCurrentTasks: string[];
      attachmentsAllTasks: string[];
    };
    dataTypeIds: string[];
    expectedResults: {
      currentTask: boolean;
      includePdf: boolean;
      selectedDataTypes: string[];
    };
  };

  describe('convert all data', () => {
    const testCasesAllDataTypes: KeyValuePairs<TestCaseConvertInternalFormat> = {
      'all attachments and current task and pdf': {
        availableAttachments: {
          attachmentsCurrentTasks: ['attachment2'],
          attachmentsAllTasks: ['attachment1', 'attachment2'],
        },
        dataTypeIds: [reservedDataTypes.includeAll, reservedDataTypes.currentTask],
        expectedResults: {
          currentTask: true,
          includePdf: true,
          selectedDataTypes: ['attachment2'],
        },
      },
      'all attachments and all tasks and pdf': {
        availableAttachments: {
          attachmentsCurrentTasks: ['attachment2'],
          attachmentsAllTasks: ['attachment1', 'attachment2'],
        },
        dataTypeIds: [reservedDataTypes.includeAll],
        expectedResults: {
          currentTask: false,
          includePdf: true,
          selectedDataTypes: ['attachment1', 'attachment2'],
        },
      },
      'all attachments and current task': {
        availableAttachments: {
          attachmentsCurrentTasks: ['attachment2'],
          attachmentsAllTasks: ['attachment1', 'attachment2'],
        },
        dataTypeIds: [reservedDataTypes.currentTask],
        expectedResults: {
          currentTask: true,
          includePdf: false,
          selectedDataTypes: ['attachment2'],
        },
      },
      'all attachments and all tasks': {
        availableAttachments: {
          attachmentsCurrentTasks: ['attachment2'],
          attachmentsAllTasks: ['attachment1', 'attachment2'],
        },
        dataTypeIds: [],
        expectedResults: {
          currentTask: false,
          includePdf: false,
          selectedDataTypes: ['attachment1', 'attachment2'],
        },
      },
      'some attachments and current task and pdf': {
        availableAttachments: {
          attachmentsCurrentTasks: ['attachment2'],
          attachmentsAllTasks: ['attachment1', 'attachment2'],
        },
        dataTypeIds: ['attachment2', reservedDataTypes.refDataAsPdf, reservedDataTypes.currentTask],
        expectedResults: {
          currentTask: true,
          includePdf: true,
          selectedDataTypes: ['attachment2'],
        },
      },
      'all tasks and pdf': {
        availableAttachments: {
          attachmentsCurrentTasks: ['attachment1'],
          attachmentsAllTasks: ['attachment1', 'attachment2'],
        },
        dataTypeIds: ['attachment1', reservedDataTypes.refDataAsPdf],
        expectedResults: {
          currentTask: false,
          includePdf: true,
          selectedDataTypes: ['attachment1'],
        },
      },
    };

    const testCaseNames: (keyof typeof testCasesAllDataTypes)[] =
      Object.keys(testCasesAllDataTypes);

    it.each(testCaseNames)('should convert to internal format with %s', (testCaseName) => {
      const testCase = testCasesAllDataTypes[testCaseName];
      expect(
        convertExternalToInternalFormat({
          availableAttachments: testCase.availableAttachments,
          dataTypeIds: testCase.dataTypeIds,
        }),
      ).toEqual(testCase.expectedResults);
    });
  });
});

describe('validateSelection', () => {
  it('should return false when no selection', () => {
    const output: InternalDataTypesFormat = {
      currentTask: false,
      includePdf: false,
      selectedDataTypes: [],
    };
    expect(selectionIsValid(output)).toBeFalsy();
  });

  it('should return true when there is a selection', () => {
    const output: InternalDataTypesFormat = {
      currentTask: false,
      includePdf: false,
      selectedDataTypes: ['attachment1'],
    };
    expect(selectionIsValid(output)).toBeTruthy();
  });

  it('should return true when there is a selection and current task', () => {
    const output: InternalDataTypesFormat = {
      currentTask: true,
      includePdf: false,
      selectedDataTypes: ['attachment1'],
    };
    expect(selectionIsValid(output)).toBeTruthy();
  });

  it('should return false when there is only current task', () => {
    const output: InternalDataTypesFormat = {
      currentTask: true,
      includePdf: false,
      selectedDataTypes: [],
    };
    expect(selectionIsValid(output)).toBeFalsy();
  });

  it('should return true when there is only pdf', () => {
    const output: InternalDataTypesFormat = {
      currentTask: false,
      includePdf: true,
      selectedDataTypes: [],
    };
    expect(selectionIsValid(output)).toBeTruthy;
  });
});

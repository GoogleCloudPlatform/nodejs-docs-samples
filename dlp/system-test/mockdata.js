// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const DLP = require('@google-cloud/dlp');
const sinon = require('sinon');

/**
  Mock data for unit test cases.
  This data is used to simulate API responses in place of actual API calls.
*/
const MOCK_DATA = {
  INSPECT_BIG_QUERY_WITH_SAMPLING: (
    projectId,
    dataProjectId,
    datasetId,
    tableId,
    topicId,
    jobName
  ) => ({
    REQUEST_CREATE_DLP_JOB: {
      parent: `projects/${projectId}/locations/global`,
      inspectJob: {
        inspectConfig: {
          infoTypes: [{name: 'PERSON_NAME'}],
          includeQuote: true,
        },
        storageConfig: {
          bigQueryOptions: {
            tableReference: {
              projectId: dataProjectId,
              datasetId: datasetId,
              tableId: tableId,
            },
            rowsLimit: 1000,
            sampleMethod:
              DLP.protos.google.privacy.dlp.v2.BigQueryOptions.SampleMethod
                .RANDOM_START,
            includedFields: [{name: 'name'}],
          },
        },
        actions: [
          {
            pubSub: {
              topic: `projects/${projectId}/topics/${topicId}`,
            },
          },
        ],
      },
    },
    RESPONSE_GET_DLP_JOB: [
      {
        name: jobName,
        inspectDetails: {
          result: {
            infoTypeStats: [
              {
                count: 1,
                infoType: {
                  name: 'PERSON_NAME',
                },
              },
            ],
          },
        },
      },
    ],
    MOCK_MESSAGE: {
      attributes: {
        DlpJobName: jobName,
      },
      ack: sinon.stub(),
      nack: sinon.stub(),
    },
  }),
  DEIDENTIFY_TABLE_WITH_FPE: (projectId, alphabet, keyName, wrappedKey) => ({
    REQUEST_DEIDENTIFY_CONTENT: {
      parent: `projects/${projectId}/locations/global`,
      deidentifyConfig: {
        recordTransformations: {
          fieldTransformations: [
            {
              fields: [{name: 'Employee ID'}],
              primitiveTransformation: {
                cryptoReplaceFfxFpeConfig: {
                  cryptoKey: {
                    kmsWrapped: {
                      wrappedKey: wrappedKey,
                      cryptoKeyName: keyName,
                    },
                  },
                  commonAlphabet: alphabet,
                },
              },
            },
          ],
        },
      },
      item: {
        table: {
          headers: [
            {name: 'Employee ID'},
            {name: 'Date'},
            {name: 'Compensation'},
          ],
          rows: [
            {
              values: [
                {stringValue: '11111'},
                {stringValue: '2015'},
                {stringValue: '$10'},
              ],
            },
            {
              values: [
                {stringValue: '22222'},
                {stringValue: '2016'},
                {stringValue: '$20'},
              ],
            },
            {
              values: [
                {stringValue: '33333'},
                {stringValue: '2016'},
                {stringValue: '$15'},
              ],
            },
          ],
        },
      },
    },
    RESPONSE_DEIDENTIFY_CONTENT: [{item: {table: {}}}],
  }),
  INSPECT_GCS_WITH_SAMPLING: (
    projectId,
    gcsUri,
    topicId,
    infoTypes,
    jobName
  ) => ({
    REQUEST_CREATE_DLP_JOB: {
      parent: `projects/${projectId}/locations/global`,
      inspectJob: {
        inspectConfig: {
          infoTypes: infoTypes,
          minLikelihood: DLP.protos.google.privacy.dlp.v2.Likelihood.POSSIBLE,
          includeQuote: true,
          excludeInfoTypes: true,
        },
        storageConfig: {
          cloudStorageOptions: {
            fileSet: {url: gcsUri},
            bytesLimitPerFile: 200,
            filesLimitPercent: 90,
            fileTypes: [DLP.protos.google.privacy.dlp.v2.FileType.TEXT_FILE],
            sampleMethod:
              DLP.protos.google.privacy.dlp.v2.CloudStorageOptions.SampleMethod
                .RANDOM_START,
          },
        },
        actions: [
          {
            pubSub: {
              topic: `projects/${projectId}/topics/${topicId}`,
            },
          },
        ],
      },
    },
    RESPONSE_GET_DLP_JOB: [
      {
        name: jobName,
        inspectDetails: {
          result: {
            infoTypeStats: [
              {
                count: 1,
                infoType: {
                  name: 'PERSON_NAME',
                },
              },
            ],
          },
        },
      },
    ],
    MOCK_MESSAGE: {
      attributes: {
        DlpJobName: jobName,
      },
      ack: sinon.stub(),
      nack: sinon.stub(),
    },
  }),
  DEIDENTIFY_WITH_DETEMINISTIC: (
    projectId,
    string,
    infoTypes,
    keyName,
    wrappedKey,
    surrogateType
  ) => ({
    REQUEST_DEIDENTIFY_CONTENT: {
      parent: `projects/${projectId}/locations/global`,
      deidentifyConfig: {
        infoTypeTransformations: {
          transformations: [
            {
              infoTypes,
              primitiveTransformation: {
                cryptoDeterministicConfig: {
                  cryptoKey: {
                    kmsWrapped: {
                      wrappedKey: wrappedKey,
                      cryptoKeyName: keyName,
                    },
                  },
                  surrogateInfoType: {name: surrogateType},
                },
              },
            },
          ],
        },
      },
      inspectConfig: {
        infoTypes,
      },
      item: {
        value: string,
      },
    },
    RESPONSE_DEIDENTIFY_CONTENT: [{item: {value: ''}}],
  }),
  REIDENTIFY_WITH_DETEMINISTIC: (
    projectId,
    string,
    keyName,
    wrappedKey,
    surrogateType
  ) => ({
    REQUEST_REIDENTIFY_CONTENT: {
      parent: `projects/${projectId}/locations/global`,
      reidentifyConfig: {
        infoTypeTransformations: {
          transformations: [
            {
              infoTypes: [{name: surrogateType}],
              primitiveTransformation: {
                cryptoDeterministicConfig: {
                  cryptoKey: {
                    kmsWrapped: {
                      wrappedKey: wrappedKey,
                      cryptoKeyName: keyName,
                    },
                  },
                  surrogateInfoType: {name: surrogateType},
                },
              },
            },
          ],
        },
      },
      inspectConfig: {
        customInfoTypes: [
          {
            infoType: {name: surrogateType},
            surrogateType: {},
          },
        ],
      },
      item: {
        value: string,
      },
    },
    RESPONSE_REIDENTIFY_CONTENT: [{item: {value: ''}}],
  }),
  REIDENTIFY_TABLE_WITH_FPE: (projectId, alphabet, keyName, wrappedKey) => ({
    REQUEST_REIDENTIFY_CONTENT: {
      parent: `projects/${projectId}/locations/global`,
      reidentifyConfig: {
        recordTransformations: {
          fieldTransformations: [
            {
              fields: [{name: 'Employee ID'}],
              primitiveTransformation: {
                cryptoReplaceFfxFpeConfig: {
                  cryptoKey: {
                    kmsWrapped: {
                      wrappedKey: wrappedKey,
                      cryptoKeyName: keyName,
                    },
                  },
                  commonAlphabet: alphabet,
                },
              },
            },
          ],
        },
      },
      item: {
        table: {
          headers: [{name: 'Employee ID'}],
          rows: [{values: [{stringValue: '90511'}]}],
        },
      },
    },
    RESPONSE_REIDENTIFY_CONTENT: [{item: {table: {}}}],
  }),
  REIDENTIFY_TEXT_WITH_FPE: (
    projectId,
    text,
    alphabet,
    keyName,
    wrappedKey,
    surrogateType
  ) => ({
    REQUEST_REIDENTIFY_CONTENT: {
      parent: `projects/${projectId}/locations/global`,
      reidentifyConfig: {
        infoTypeTransformations: {
          transformations: [
            {
              primitiveTransformation: {
                cryptoReplaceFfxFpeConfig: {
                  cryptoKey: {
                    kmsWrapped: {
                      wrappedKey: wrappedKey,
                      cryptoKeyName: keyName,
                    },
                  },
                  commonAlphabet: alphabet,
                  surrogateInfoType: {
                    name: surrogateType,
                  },
                },
              },
            },
          ],
        },
      },
      inspectConfig: {
        customInfoTypes: [
          {
            infoType: {
              name: surrogateType,
            },
            surrogateType: {},
          },
        ],
      },
      item: {value: text},
    },
    RESPONSE_REIDENTIFY_CONTENT: [{item: {value: ''}}],
  }),
  INSPECT_GCS_SEND_TO_SCC: (projectId, gcsUri, jobName) => ({
    REQUEST_CREATE_DLP_JOB: {
      parent: `projects/${projectId}/locations/global`,
      inspectJob: {
        inspectConfig: {
          infoTypes: [
            {name: 'EMAIL_ADDRESS'},
            {name: 'PERSON_NAME'},
            {name: 'LOCATION'},
            {name: 'PHONE_NUMBER'},
          ],
          minLikelihood: DLP.protos.google.privacy.dlp.v2.Likelihood.UNLIKELY,
          limits: {
            maxFindingsPerItem: 100,
          },
        },
        storageConfig: {
          cloudStorageOptions: {
            fileSet: {url: gcsUri},
          },
        },
        actions: [
          {
            publishSummaryToCscc: {},
          },
        ],
      },
    },
    RESPONSE_GET_DLP_JOB_SUCCESS: [
      {
        name: jobName,
        state: 'DONE',
        inspectDetails: {
          result: {
            infoTypeStats: [
              {
                count: 1,
                infoType: {
                  name: 'PERSON_NAME',
                },
              },
            ],
          },
        },
      },
    ],
    RESPONSE_GET_DLP_JOB_FAILED: [
      {
        name: jobName,
        state: 'FAILED',
        inspectDetails: {},
      },
    ],
  }),
  INSPECT_BIG_QUERY_SEND_TO_SCC: (
    projectId,
    dataProjectId,
    datasetId,
    tableId,
    jobName
  ) => ({
    REQUEST_CREATE_DLP_JOB: {
      parent: `projects/${projectId}/locations/global`,
      inspectJob: {
        inspectConfig: {
          infoTypes: [
            {name: 'EMAIL_ADDRESS'},
            {name: 'PERSON_NAME'},
            {name: 'LOCATION'},
            {name: 'PHONE_NUMBER'},
          ],
          minLikelihood: DLP.protos.google.privacy.dlp.v2.Likelihood.UNLIKELY,
          limits: {
            maxFindingsPerItem: 100,
          },
          includeQuote: true,
        },
        storageConfig: {
          bigQueryOptions: {
            tableReference: {
              projectId: dataProjectId,
              datasetId: datasetId,
              tableId: tableId,
            },
          },
        },
        actions: [
          {
            publishSummaryToCscc: {enable: true},
          },
        ],
      },
    },
    RESPONSE_GET_DLP_JOB_SUCCESS: [
      {
        name: jobName,
        state: 'DONE',
        inspectDetails: {
          result: {
            infoTypeStats: [
              {
                count: 1,
                infoType: {
                  name: 'PERSON_NAME',
                },
              },
            ],
          },
        },
      },
    ],
    RESPONSE_GET_DLP_JOB_FAILED: [
      {
        name: jobName,
        state: 'FAILED',
        inspectDetails: {},
      },
    ],
  }),
  INSPECT_DATASTORE_SEND_TO_SCC: (
    projectId,
    datastoreNamespace,
    datastoreKind,
    jobName
  ) => ({
    REQUEST_CREATE_DLP_JOB: {
      parent: `projects/${projectId}/locations/global`,
      inspectJob: {
        inspectConfig: {
          infoTypes: [
            {name: 'EMAIL_ADDRESS'},
            {name: 'PERSON_NAME'},
            {name: 'LOCATION'},
            {name: 'PHONE_NUMBER'},
          ],
          minLikelihood: DLP.protos.google.privacy.dlp.v2.Likelihood.UNLIKELY,
          limits: {
            maxFindingsPerItem: 100,
          },
          includeQuote: true,
        },
        storageConfig: {
          datastoreOptions: {
            kind: {
              name: datastoreKind,
            },
            partitionId: {
              projectId: projectId,
              namespaceId: datastoreNamespace,
            },
          },
        },
        actions: [
          {
            publishSummaryToCscc: {enable: true},
          },
        ],
      },
    },
    RESPONSE_GET_DLP_JOB_SUCCESS: [
      {
        name: jobName,
        state: 'DONE',
        inspectDetails: {
          result: {
            infoTypeStats: [
              {
                count: 1,
                infoType: {
                  name: 'PERSON_NAME',
                },
              },
            ],
          },
        },
      },
    ],
    RESPONSE_GET_DLP_JOB_FAILED: [
      {
        name: jobName,
        state: 'FAILED',
        inspectDetails: {},
      },
    ],
  }),
  INSPECT_WITH_STORED_INFOTYPE: (projectId, string, infoTypeId) => ({
    REQUEST_INSPECT_CONTENT: {
      parent: `projects/${projectId}/locations/global`,
      inspectConfig: {
        customInfoTypes: [
          {
            infoType: {
              name: 'GITHUB_LOGINS',
            },
            storedType: {
              name: infoTypeId,
            },
          },
        ],
        includeQuote: true,
      },
      item: {
        value: string,
      },
    },
    RESPONSE_INSPECT_CONTENT: [
      {
        result: {
          findings: [
            {
              infoType: {
                name: infoTypeId,
              },
              quote: '(223) 456-7890',
              likelihood: 'VERY_LIKELY',
            },
          ],
        },
      },
    ],
  }),
  DEIDENTIFY_CLOUD_STORAGE: (
    projectId,
    inputDirectory,
    tableId,
    datasetId,
    outputDirectory,
    deidentifyTemplateId,
    structuredDeidentifyTemplateId,
    imageRedactTemplateId,
    jobName
  ) => ({
    REQUEST_CREATE_DLP_JOB: {
      parent: `projects/${projectId}/locations/global`,
      inspectJob: {
        inspectConfig: {
          infoTypes: [{name: 'PERSON_NAME'}, {name: 'EMAIL_ADDRESS'}],
          includeQuote: true,
        },
        storageConfig: {
          cloudStorageOptions: {
            fileSet: {url: inputDirectory},
          },
        },
        actions: [
          {
            deidentify: {
              cloudStorageOutput: outputDirectory,
              transformationConfig: {
                deidentifyTemplate: deidentifyTemplateId,
                structuredDeidentifyTemplate: structuredDeidentifyTemplateId,
                imageRedactTemplate: imageRedactTemplateId,
              },
              transformationDetailsStorageConfig: {
                table: {
                  projectId: projectId,
                  tableId: tableId,
                  datasetId: datasetId,
                },
              },
              fileTypes: [
                {fileType: 'IMAGE'},
                {fileType: 'CSV'},
                {fileType: 'TEXT_FILE'},
              ],
            },
          },
        ],
      },
    },
    RESPONSE_GET_DLP_JOB_SUCCESS: [
      {
        name: jobName,
        state: 'DONE',
        inspectDetails: {
          result: {
            infoTypeStats: [
              {
                count: 1,
                infoType: {
                  name: 'PERSON_NAME',
                },
              },
            ],
          },
        },
      },
    ],
    RESPONSE_GET_DLP_JOB_FAILED: [
      {
        name: jobName,
        state: 'FAILED',
        inspectDetails: {},
      },
    ],
  }),
  K_ANONYMITY_WITH_ENTITY_ID: (
    projectId,
    datasetId,
    sourceTableId,
    outputTableId,
    jobName
  ) => ({
    REQUEST_CREATE_DLP_JOB: {
      parent: `projects/${projectId}/locations/global`,
      riskJob: {
        sourceTable: {
          projectId: projectId,
          datasetId: datasetId,
          tableId: sourceTableId,
        },
        privacyMetric: {
          kAnonymityConfig: {
            entityId: {field: {name: 'Name'}},
            quasiIds: [{name: 'Age'}, {name: 'Mystery'}],
          },
        },
        actions: [
          {
            saveFindings: {
              outputConfig: {
                table: {
                  projectId: projectId,
                  datasetId: datasetId,
                  tableId: outputTableId,
                },
              },
            },
          },
        ],
      },
    },
    RESPONSE_GET_DLP_JOB_SUCCESS: [
      {
        name: jobName,
        state: 'DONE',
        riskDetails: {
          kAnonymityResult: {
            equivalenceClassHistogramBuckets: [
              {
                bucketValues: [
                  {
                    quasiIdsValues: [
                      {
                        stringValue: '["19","8291 3627 8250 1234"]',
                        type: 'stringValue',
                      },
                    ],
                    equivalenceClassSize: '1',
                  },
                  {
                    quasiIdsValues: [
                      {
                        stringValue: '["27","4231 5555 6781 9876"]',
                        type: 'stringValue',
                      },
                    ],
                    equivalenceClassSize: '1',
                  },
                ],
                equivalenceClassSizeLowerBound: '1',
                equivalenceClassSizeUpperBound: '1',
                bucketSize: '2',
                bucketValueCount: '2',
              },
            ],
          },
        },
      },
    ],
    RESPONSE_GET_DLP_JOB_FAILED: [
      {
        name: jobName,
        state: 'FAILED',
        inspectDetails: {},
      },
    ],
  }),
  INSPECT_SEND_DATA_TO_HYBRID_JOB_TRIGGER: (
    projectId,
    string,
    jobTriggerId,
    jobName
  ) => ({
    REQUEST_HYBRID_INSPECT_JOB_TRIGGER: {
      name: `projects/${projectId}/jobTriggers/${jobTriggerId}`,
      hybridItem: {
        item: {value: string},
        findingDetails: {
          containerDetails: {
            full_path: '10.0.0.2:logs1:app1',
            relative_path: 'app1',
            root_path: '10.0.0.2:logs1',
            type: 'logging_sys',
            version: '1.2',
          },
          labels: {env: 'prod', 'appointment-bookings-comments': ''},
        },
      },
    },
    RESPONSE_GET_DLP_JOB_SUCCESS: [
      {
        name: jobName,
        state: 'DONE',
        inspectDetails: {
          result: {
            infoTypeStats: [
              {
                count: 1,
                infoType: {
                  name: 'EMAIL_ADDRESS',
                },
              },
            ],
            processedBytes: 1,
          },
        },
      },
    ],
    RESPONSE_GET_DLP_JOB_FAILED: [
      {
        name: jobName,
        state: 'FAILED',
        inspectDetails: {},
      },
    ],
    REQUEST_LIST_DLP_JOBS: {
      parent: `projects/${projectId}/jobTriggers/${jobTriggerId}`,
      filter: `trigger_name=projects/${projectId}/jobTriggers/${jobTriggerId}`,
    },
  }),
  K_ANONYMITY_ANALYSIS: (
    projectId,
    tableProjectId,
    datasetId,
    tableId,
    topicId,
    quasiIds,
    jobName
  ) => ({
    REQUEST_CREATE_DLP_JOB: {
      parent: `projects/${projectId}/locations/global`,
      riskJob: {
        privacyMetric: {
          kAnonymityConfig: {
            quasiIds: quasiIds,
          },
        },
        sourceTable: {
          projectId: tableProjectId,
          datasetId: datasetId,
          tableId: tableId,
        },
        actions: [
          {
            pubSub: {
              topic: `projects/${projectId}/topics/${topicId}`,
            },
          },
        ],
      },
    },
    RESPONSE_GET_DLP_JOB_SUCCESS: [
      {
        name: jobName,
        state: 'DONE',
        riskDetails: {
          kAnonymityResult: {
            equivalenceClassHistogramBuckets: [
              {
                bucketValues: [
                  {
                    quasiIdsValues: [
                      {
                        stringValue: '["19","8291 3627 8250 1234"]',
                        type: 'stringValue',
                      },
                    ],
                    equivalenceClassSize: '1',
                  },
                  {
                    quasiIdsValues: [
                      {
                        stringValue: '["27","4231 5555 6781 9876"]',
                        type: 'stringValue',
                      },
                    ],
                    equivalenceClassSize: '1',
                  },
                ],
                equivalenceClassSizeLowerBound: '1',
                equivalenceClassSizeUpperBound: '1',
                bucketSize: '2',
                bucketValueCount: '2',
              },
            ],
          },
        },
      },
    ],
    MOCK_MESSAGE: {
      attributes: {
        DlpJobName: jobName,
      },
      ack: sinon.stub(),
      nack: sinon.stub(),
    },
  }),
  NUMERICAL_STATS: (
    projectId,
    tableProjectId,
    datasetId,
    tableId,
    columnName,
    topicId,
    jobName
  ) => ({
    REQUEST_CREATE_DLP_JOB: {
      parent: `projects/${projectId}/locations/global`,
      riskJob: {
        privacyMetric: {
          numericalStatsConfig: {
            field: {
              name: columnName,
            },
          },
        },
        sourceTable: {
          projectId: tableProjectId,
          datasetId: datasetId,
          tableId: tableId,
        },
        actions: [
          {
            pubSub: {
              topic: `projects/${projectId}/topics/${topicId}`,
            },
          },
        ],
      },
    },
    RESPONSE_GET_DLP_JOB_SUCCESS: [
      {
        name: jobName,
        state: 'DONE',
        riskDetails: {
          numericalStatsResult: {
            quantileValues: [
              {
                stringValue: '20',
                type: 'stringValue',
              },
              {
                stringValue: '20',
                type: 'stringValue',
              },
              {
                stringValue: '45',
                type: 'stringValue',
              },
            ],
            minValue: {
              stringValue: '20',
              type: 'stringValue',
            },
            maxValue: {
              stringValue: '45',
              type: 'stringValue',
            },
          },
        },
      },
    ],
    MOCK_MESSAGE: {
      attributes: {
        DlpJobName: jobName,
      },
      ack: sinon.stub(),
      nack: sinon.stub(),
    },
  }),
  K_MAP_ESTIMATION_ANALYSIS: (
    projectId,
    tableProjectId,
    datasetId,
    tableId,
    topicId,
    regionCode,
    quasiIds,
    jobName
  ) => ({
    REQUEST_CREATE_DLP_JOB: {
      parent: `projects/${projectId}/locations/global`,
      riskJob: {
        privacyMetric: {
          kMapEstimationConfig: {
            quasiIds: quasiIds,
            regionCode: regionCode,
          },
        },
        sourceTable: {
          projectId: tableProjectId,
          datasetId: datasetId,
          tableId: tableId,
        },
        actions: [
          {
            pubSub: {
              topic: `projects/${projectId}/topics/${topicId}`,
            },
          },
        ],
      },
    },
    RESPONSE_GET_DLP_JOB_SUCCESS: [
      {
        name: jobName,
        state: 'DONE',
        riskDetails: {
          kMapEstimationResult: {
            kMapEstimationHistogram: [
              {
                bucketValues: [
                  {
                    quasiIdsValues: [
                      {
                        stringValue: '20',
                        type: 'integerValue',
                      },
                    ],
                    estimatedAnonymity: '1',
                  },
                ],
                minAnonymity: 1,
                maxAnonymity: 1,
                bucketSize: 5,
                bucketValueCount: 1,
              },
              {
                bucketValues: [
                  {
                    quasiIdsValues: [
                      {
                        stringValue: '45',
                        type: 'integerValue',
                      },
                    ],
                    estimatedAnonymity: '2',
                  },
                ],
                minAnonymity: 1,
                maxAnonymity: 1,
                bucketSize: 5,
                bucketValueCount: 1,
              },
            ],
          },
        },
      },
    ],
    MOCK_MESSAGE: {
      attributes: {
        DlpJobName: jobName,
      },
      ack: sinon.stub(),
      nack: sinon.stub(),
    },
  }),
  L_DIVERSITY_ANALYSIS: (
    projectId,
    tableProjectId,
    datasetId,
    tableId,
    topicId,
    sensitiveAttribute,
    quasiIds,
    jobName
  ) => ({
    REQUEST_CREATE_DLP_JOB: {
      parent: `projects/${projectId}/locations/global`,
      riskJob: {
        privacyMetric: {
          lDiversityConfig: {
            quasiIds: quasiIds,
            sensitiveAttribute: {
              name: sensitiveAttribute,
            },
          },
        },
        sourceTable: {
          projectId: tableProjectId,
          datasetId: datasetId,
          tableId: tableId,
        },
        actions: [
          {
            pubSub: {
              topic: `projects/${projectId}/topics/${topicId}`,
            },
          },
        ],
      },
    },
    RESPONSE_GET_DLP_JOB_SUCCESS: [
      {
        name: jobName,
        state: 'DONE',
        riskDetails: {
          lDiversityResult: {
            sensitiveValueFrequencyHistogramBuckets: [
              {
                bucketValues: [
                  {
                    quasiIdsValues: [
                      {
                        stringValue: '20',
                        type: 'stringValue',
                      },
                    ],
                    topSensitiveValues: [
                      {
                        value: {
                          stringValue: '19',
                          type: 'stringValue',
                        },
                        count: 1,
                      },
                    ],
                    equivalenceClassSize: 1,
                    numDistinctSensitiveValues: 1,
                  },
                ],
                sensitiveValueFrequencyLowerBound: 1,
                sensitiveValueFrequencyUpperBound: 1,
                bucketSize: 1,
                bucketValueCount: 1,
              },
            ],
          },
        },
      },
    ],
    MOCK_MESSAGE: {
      attributes: {
        DlpJobName: jobName,
      },
      ack: sinon.stub(),
      nack: sinon.stub(),
    },
  }),
  CATEGORICAL_STATS: (
    projectId,
    tableProjectId,
    datasetId,
    tableId,
    columnName,
    topicId,
    jobName
  ) => ({
    REQUEST_CREATE_DLP_JOB: {
      parent: `projects/${projectId}/locations/global`,
      riskJob: {
        privacyMetric: {
          categoricalStatsConfig: {
            field: {
              name: columnName,
            },
          },
        },
        sourceTable: {
          projectId: tableProjectId,
          datasetId: datasetId,
          tableId: tableId,
        },
        actions: [
          {
            pubSub: {
              topic: `projects/${projectId}/topics/${topicId}`,
            },
          },
        ],
      },
    },
    RESPONSE_GET_DLP_JOB_SUCCESS: [
      {
        name: jobName,
        state: 'DONE',
        riskDetails: {
          categoricalStatsResult: {
            valueFrequencyHistogramBuckets: [
              {
                bucketValues: [
                  {
                    value: {
                      stringValue: 'John',
                      type: 'stringValue',
                    },
                    count: 2,
                  },
                ],
                valueFrequencyLowerBound: 2,
                valueFrequencyUpperBound: 2,
                bucketSize: 2,
                bucketValueCount: 1,
              },
              {
                bucketValues: [
                  {
                    value: {
                      stringValue: 'test',
                      type: 'stringValue',
                    },
                    count: 1,
                  },
                ],
                valueFrequencyLowerBound: 1,
                valueFrequencyUpperBound: 1,
                bucketSize: 1,
                bucketValueCount: 1,
              },
            ],
          },
        },
      },
    ],
    MOCK_MESSAGE: {
      attributes: {
        DlpJobName: jobName,
      },
      ack: sinon.stub(),
      nack: sinon.stub(),
    },
  }),
  CREATE_STORED_INFOTYPE: (
    projectId,
    infoTypeId,
    outputPath,
    dataProjectId,
    datasetId,
    tableId,
    fieldName
  ) => ({
    REQUEST_CREATE_DLP_JOB: {
      parent: `projects/${projectId}/locations/global`,
      config: {
        displayName: 'GitHub usernames',
        description: 'Dictionary of GitHub usernames used in commits',
        largeCustomDictionary: {
          outputPath: {
            path: outputPath,
          },
          bigQueryField: {
            table: {
              datasetId: datasetId,
              projectId: dataProjectId,
              tableId: tableId,
            },
            field: {
              name: fieldName,
            },
          },
        },
      },
      storedInfoTypeId: infoTypeId,
    },
  }),
  UPDATE_STORED_INFOTYPE: (projectId, infoTypeId, outputPath, fileSetUrl) => ({
    REQUEST_UPDATE_STORED_INFOTYPE: {
      name: `projects/${projectId}/storedInfoTypes/${infoTypeId}`,
      config: {
        largeCustomDictionary: {
          outputPath: {
            path: outputPath,
          },
          cloudStorageFileSet: {
            url: fileSetUrl,
          },
        },
      },
      updateMask: {
        paths: ['large_custom_dictionary.cloud_storage_file_set.url'],
      },
    },
  }),
  INSPECT_GCS_FILE: (
    projectId,
    bucketName,
    fileName,
    topicId,
    minLikelihood,
    maxFindings,
    infoTypes,
    customInfoTypes,
    jobName
  ) => ({
    REQUEST_CREATE_DLP_JOB: {
      parent: `projects/${projectId}/locations/global`,
      inspectJob: {
        inspectConfig: {
          infoTypes: infoTypes,
          customInfoTypes: customInfoTypes,
          minLikelihood: minLikelihood,
          limits: {
            maxFindingsPerRequest: maxFindings,
          },
        },
        storageConfig: {
          cloudStorageOptions: {
            fileSet: {url: `gs://${bucketName}/${fileName}`},
          },
        },
        actions: [
          {
            pubSub: {
              topic: `projects/${projectId}/topics/${topicId}`,
            },
          },
        ],
      },
    },
    RESPONSE_GET_DLP_JOB: [
      {
        name: jobName,
        inspectDetails: {
          result: {
            infoTypeStats: [
              {
                count: 1,
                infoType: {
                  name: 'PERSON_NAME',
                },
              },
            ],
          },
        },
      },
    ],
    MOCK_MESSAGE: {
      attributes: {
        DlpJobName: jobName,
      },
      ack: sinon.stub(),
      nack: sinon.stub(),
    },
  }),
  INSPECT_BIG_QUERY: (
    projectId,
    dataProjectId,
    datasetId,
    tableId,
    topicId,
    minLikelihood,
    maxFindings,
    infoTypes,
    customInfoTypes,
    jobName
  ) => ({
    REQUEST_CREATE_DLP_JOB: {
      parent: `projects/${projectId}/locations/global`,
      inspectJob: {
        inspectConfig: {
          infoTypes: infoTypes,
          customInfoTypes: customInfoTypes,
          minLikelihood: minLikelihood,
          limits: {
            maxFindingsPerRequest: maxFindings,
          },
        },
        storageConfig: {
          bigQueryOptions: {
            tableReference: {
              projectId: dataProjectId,
              datasetId: datasetId,
              tableId: tableId,
            },
          },
        },
        actions: [
          {
            pubSub: {
              topic: `projects/${projectId}/topics/${topicId}`,
            },
          },
        ],
      },
    },
    RESPONSE_GET_DLP_JOB: [
      {
        name: jobName,
        inspectDetails: {
          result: {
            infoTypeStats: [
              {
                count: 1,
                infoType: {
                  name: 'PERSON_NAME',
                },
              },
            ],
          },
        },
      },
    ],
    MOCK_MESSAGE: {
      attributes: {
        DlpJobName: jobName,
      },
      ack: sinon.stub(),
      nack: sinon.stub(),
    },
  }),
  INSPECT_DATASTORE: (
    projectId,
    dataProjectId,
    namespaceId,
    kind,
    topicId,
    minLikelihood,
    maxFindings,
    infoTypes,
    customInfoTypes,
    jobName
  ) => ({
    REQUEST_CREATE_DLP_JOB: {
      parent: `projects/${projectId}/locations/global`,
      inspectJob: {
        inspectConfig: {
          infoTypes: infoTypes,
          customInfoTypes: customInfoTypes,
          minLikelihood: minLikelihood,
          limits: {
            maxFindingsPerRequest: maxFindings,
          },
        },
        storageConfig: {
          datastoreOptions: {
            partitionId: {
              projectId: dataProjectId,
              namespaceId: namespaceId,
            },
            kind: {
              name: kind,
            },
          },
        },
        actions: [
          {
            pubSub: {
              topic: `projects/${projectId}/topics/${topicId}`,
            },
          },
        ],
      },
    },
    RESPONSE_GET_DLP_JOB: [
      {
        name: jobName,
        inspectDetails: {
          result: {
            infoTypeStats: [
              {
                count: 1,
                infoType: {
                  name: 'PERSON_NAME',
                },
              },
            ],
          },
        },
      },
    ],
    MOCK_MESSAGE: {
      attributes: {
        DlpJobName: jobName,
      },
      ack: sinon.stub(),
      nack: sinon.stub(),
    },
  }),
};

module.exports = {MOCK_DATA};

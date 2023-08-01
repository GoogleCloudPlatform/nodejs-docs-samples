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
};

module.exports = {MOCK_DATA};

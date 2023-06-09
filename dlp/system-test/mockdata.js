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
  DEIDENTIFY_TABLE_WITH_FPE: (
    projectId,
    alphabet,
    keyName,
    wrappedKey
  ) => ({
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
          headers: [{name: 'Employee ID'}, {name: 'Date'}, {name: 'Compensation'}],
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
                {stringValue: '11111'},
                {stringValue: '2016'},
                {stringValue: '$20'},
              ],
            },
            {
              values: [
                {stringValue: '11111'},
                {stringValue: '2016'},
                {stringValue: '$15'},
              ],
            },
          ],
        },
      },
    },
    RESPONSE_DEIDENTIFY_CONTENT: [{item: {
      table: {}
    }}],
  }),
};

module.exports = {MOCK_DATA};

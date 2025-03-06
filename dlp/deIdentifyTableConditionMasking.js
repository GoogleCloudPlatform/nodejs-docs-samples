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

// sample-metadata:
//  title: De-identify data using conditional logic with character masking
//  description: Transform findings when specific conditions are met in a table with character masking.
//  usage: node deIdentifyTableConditionMasking.js my-project
function main(projectId) {
  // [START dlp_deidentify_table_condition_masking]
  // Imports the Google Cloud Data Loss Prevention library
  import {DLP} from '@google-cloud/dlp';

  // Initialize google DLP Client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const projectId = 'my-project';

  // Construct the tabular data
  const tablularData = {
    headers: [{name: 'AGE'}, {name: 'PATIENT'}, {name: 'HAPPINESS SCORE'}],
    rows: [
      {
        values: [
          {integerValue: 101},
          {stringValue: 'Charles Dickens'},
          {integerValue: 95},
        ],
      },
      {
        values: [
          {integerValue: 22},
          {stringValue: 'Jane Austen'},
          {integerValue: 21},
        ],
      },
      {
        values: [
          {integerValue: 55},
          {stringValue: 'Mark Twain'},
          {integerValue: 75},
        ],
      },
    ],
  };

  async function deIdentifyTableConditionalCharMasking() {
    // Column that needs to be transformed
    const fieldIds = [{name: 'HAPPINESS SCORE'}];

    // Construct PrimitiveTransformation configuration
    const primitiveTransformation = {
      characterMaskConfig: {
        maskingCharacter: '*',
      },
    };

    // Construct condition
    const condition = {
      expressions: {
        conditions: {
          conditions: [
            {
              field: {name: 'AGE'},
              operator: 'GREATER_THAN',
              value: {integerValue: 89},
            },
          ],
        },
      },
    };

    // Construct RecordTransformations configurations
    const recordTransformations = {
      fieldTransformations: [
        {
          primitiveTransformation,
          fields: fieldIds,
          condition,
        },
      ],
    };

    // Combine configurations into a request for the service.
    const request = {
      parent: `projects/${projectId}/locations/global`,
      item: {
        table: tablularData,
      },
      deidentifyConfig: {
        recordTransformations,
      },
    };
    // Send the request and receive response from the service
    const [response] = await dlp.deidentifyContent(request);

    // Print the results
    console.log(
      `Table after de-identification: ${JSON.stringify(response.item.table)}`
    );
  }

  deIdentifyTableConditionalCharMasking();
  // [END dlp_deidentify_table_condition_masking]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));

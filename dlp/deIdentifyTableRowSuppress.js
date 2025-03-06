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
//  title: De-identify table data with row suppression.
//  description: De-identify table data using conditional logic to suppress row data.
//  usage: node deIdentifyTableRowSuppress.js my-project
function main(projectId) {
  // [START dlp_deidentify_table_row_suppress]
  // Imports the Google Cloud Data Loss Prevention library
  import DLP from '@google-cloud/dlp';

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
  async function deIdentifyTableRowSuppress() {
    // Specify when the content should be de-identified.
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

    // Apply the condition to record suppression.
    const recordTransformations = {
      recordSuppressions: [
        {
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

    // Send the request and receive response from the service.
    const [response] = await dlp.deidentifyContent(request);

    // Print the results.
    console.log(
      `Table after de-identification: ${JSON.stringify(response.item.table)}`
    );
  }

  deIdentifyTableRowSuppress();
  // [END dlp_deidentify_table_row_suppress]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));

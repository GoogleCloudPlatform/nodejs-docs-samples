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
//  title: De-identify data using table bucketing
//  description: Transforms specified field using table bucketing.
//  usage: node deIdentifyTableBucketing.js my-project

function main(projectId) {
  // [START dlp_deidentify_table_bucketing]
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
  async function deIdentifyTableBucketing() {
    // Specify field to be de-identified.
    const targetColumn = {name: 'HAPPINESS SCORE'};

    // Specify how the content should be de-identified.
    const bucketingConfig = {
      bucketSize: 10,
      lowerBound: {
        integerValue: 0,
      },
      upperBound: {
        integerValue: 100,
      },
    };

    const primitiveTransformation = {
      fixedSizeBucketingConfig: bucketingConfig,
    };

    // Combine configurations into a request for the service.
    const request = {
      parent: `projects/${projectId}/locations/global`,
      item: {
        table: tablularData,
      },
      deidentifyConfig: {
        recordTransformations: {
          fieldTransformations: [
            {
              fields: [targetColumn],
              primitiveTransformation,
            },
          ],
        },
      },
    };
    // Send the request and receive response from the service
    const [response] = await dlp.deidentifyContent(request);

    // Print the results.
    console.log(
      `Table after de-identification: ${JSON.stringify(response.item.table)}`
    );
  }

  deIdentifyTableBucketing();
  // [END dlp_deidentify_table_bucketing]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));

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
//  title: Deidentifying the table using bucketing transformations.
//  description: Uses the Data Loss Prevention API to De-identifying the table using bucketing transformations.
//  usage: node deIdentifyTableWithBucketingConfig.js my-project
function main(projectId) {
  // [START dlp_deidentify_table_primitive_bucketing]
  // Imports the Google Cloud client library
  const DLP = require('@google-cloud/dlp');
  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const projectId = 'your-project-id';

  // Construct the tabular data
  const tablularData = {
    headers: [{name: 'AGE'}, {name: 'PATIENT'}, {name: 'HAPPINESS SCORE'}],
    rows: [
      {
        values: [
          {stringValue: '101'},
          {stringValue: 'Charles Dickens'},
          {integerValue: 95},
        ],
      },
      {
        values: [
          {stringValue: '22'},
          {stringValue: 'Jane Austen'},
          {integerValue: 21},
        ],
      },
      {
        values: [
          {stringValue: '55'},
          {stringValue: 'Mark Twain'},
          {integerValue: 75},
        ],
      },
    ],
  };

  async function deIdentifyTableBucketing() {
    // Construct bucket confiugrations
    const buckets = [
      {
        min: {integerValue: 0},
        max: {integerValue: 25},
        replacementValue: {stringValue: 'Low'},
      },
      {
        min: {integerValue: 25},
        max: {integerValue: 75},
        replacementValue: {stringValue: 'Medium'},
      },
      {
        min: {integerValue: 75},
        max: {integerValue: 100},
        replacementValue: {stringValue: 'High'},
      },
    ];

    const bucketingConfig = {
      buckets: buckets,
    };

    // The list of fields to be transformed.
    const fieldIds = [{name: 'HAPPINESS SCORE'}];

    // Associate fields with bucketing configuration.
    const fieldTransformations = [
      {
        primitiveTransformation: {bucketingConfig: bucketingConfig},
        fields: fieldIds,
      },
    ];

    // Specify de-identify configuration using transformation object.
    const deidentifyConfig = {
      recordTransformations: {
        fieldTransformations: fieldTransformations,
      },
    };

    // Combine configurations into a request for the service.
    const request = {
      parent: `projects/${projectId}/locations/global`,
      deidentifyConfig: deidentifyConfig,
      item: {
        table: tablularData,
      },
    };
    // Send the request and receive response from the service.
    const [response] = await dlp.deidentifyContent(request);

    // Print the results.
    console.log(
      `Table after de-identification: ${JSON.stringify(
        response.item.table,
        null,
        2
      )}`
    );
  }
  deIdentifyTableBucketing();
  // [END dlp_deidentify_table_primitive_bucketing]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));

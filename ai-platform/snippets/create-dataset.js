/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

async function main(
  datasetDisplayName,
  metadataSchemaUri,
  project,
  location = 'us-central1'
) {
  // [START aiplatform_create_dataset_sample]
  /**
   * TODO(developer): Uncomment these variables before running the sample.\
   * (Not necessary if passing values as arguments)
   */

  // const datasetDisplayName = 'YOUR_DATASET_DISPLAY_NAME';
  // const metadataSchemaUri = 'YOUR_METADATA_SCHEMA_URI';
  // const project = 'YOUR_PROJECT_ID';
  // const location = 'YOUR_PROJECT_LOCATION';

  // Imports the Google Cloud Dataset Service Client library
  const {DatasetServiceClient} = require('@google-cloud/aiplatform');

  // Specifies the location of the api endpoint
  const clientOptions = {
    apiEndpoint: 'us-central1-aiplatform.googleapis.com',
  };

  // Instantiates a client
  const datasetServiceClient = new DatasetServiceClient(clientOptions);

  async function createDataset() {
    // Configure the parent resource
    const parent = `projects/${project}/locations/${location}`;
    // Configure the dataset resource
    const dataset = {
      displayName: datasetDisplayName,
      metadataSchemaUri: metadataSchemaUri,
    };
    const request = {
      parent,
      dataset,
    };

    // Create Dataset Request
    const [response] = await datasetServiceClient.createDataset(request);
    console.log(`Long running operation : ${response.name}`);

    // Wait for operation to complete
    const [createDatasetResponse] = await response.promise();

    console.log('Create dataset response');
    console.log(`\tName : ${createDatasetResponse.name}`);
    console.log(`\tDisplay name : ${createDatasetResponse.displayName}`);
    console.log(
      `\tMetadata schema uri : ${createDatasetResponse.metadataSchemaUri}`
    );
    console.log(
      `\tMetadata : ${JSON.stringify(createDatasetResponse.metadata)}`
    );
    console.log(`\tCreate time : ${createDatasetResponse.createTime}`);
    console.log(`\tUpdate time : ${createDatasetResponse.updateTime}`);
    console.log(`\tLabels : ${JSON.stringify(createDatasetResponse.labels)}`);
  }
  createDataset();
  // [END aiplatform_create_dataset_sample]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));

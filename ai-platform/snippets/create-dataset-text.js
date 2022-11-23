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

async function main(datasetDisplayName, project, location = 'us-central1') {
  // [START aiplatform_create_dataset_text_sample]
  /**
   * TODO(developer): Uncomment these variables before running the sample.\
   * (Not necessary if passing values as arguments)
   */

  // const datasetDisplayName = "YOUR_DATASTE_DISPLAY_NAME";
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

  async function createDatasetText() {
    // Configure the parent resource
    const parent = `projects/${project}/locations/${location}`;
    // Configure the dataset resource
    const dataset = {
      displayName: datasetDisplayName,
      metadataSchemaUri:
        'gs://google-cloud-aiplatform/schema/dataset/metadata/text_1.0.0.yaml',
    };
    const request = {
      parent,
      dataset,
    };

    // Create Dataset Request
    const [response] = await datasetServiceClient.createDataset(request);
    console.log(`Long running operation: ${response.name}`);

    // Wait for operation to complete
    await response.promise();
    const result = response.result;

    console.log('Create dataset text response');
    console.log(`Name : ${result.name}`);
    console.log(`Display name : ${result.displayName}`);
    console.log(`Metadata schema uri : ${result.metadataSchemaUri}`);
    console.log(`Metadata : ${JSON.stringify(result.metadata)}`);
    console.log(`Labels : ${JSON.stringify(result.labels)}`);
  }
  createDatasetText();
  // [END aiplatform_create_dataset_text_sample]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));

// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

function main(
  projectId = 'YOUR_PROJECT_ID',
  location = 'us-central1',
  displayName = 'YOUR_DISPLAY_NAME'
) {
  // [START automl_video_classification_create_dataset_beta]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const location = 'us-central1';
  // const displayName = 'YOUR_DISPLAY_NAME';

  // Imports the Google Cloud AutoML library
  const {AutoMlClient} = require('@google-cloud/automl').v1beta1;

  // Instantiates a client
  const client = new AutoMlClient();

  async function createDataset() {
    // Construct request
    const request = {
      parent: client.locationPath(projectId, location),
      dataset: {
        displayName: displayName,
        videoClassificationDatasetMetadata: {},
      },
    };

    // Create dataset
    const [response] = await client.createDataset(request);

    console.log(`Dataset name: ${response.name}`);
    console.log(`
      Dataset id: ${
        response.name
          .split('/')
          [response.name.split('/').length - 1].split('\n')[0]
      }`);
  }

  createDataset();
  // [END automl_video_classification_create_dataset_beta]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));

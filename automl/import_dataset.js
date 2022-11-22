// Copyright 2019 Google LLC
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

function main(
  projectId = 'YOUR_PROJECT_ID',
  location = 'us-central1',
  datasetId = 'YOUR_DISPLAY_ID',
  path = 'gs://BUCKET_ID/path_to_training_data.csv'
) {
  // [START automl_import_dataset]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const location = 'us-central1';
  // const datasetId = 'YOUR_DISPLAY_ID';
  // const path = 'gs://BUCKET_ID/path_to_training_data.csv';

  // Imports the Google Cloud AutoML library
  const {AutoMlClient} = require('@google-cloud/automl').v1;

  // Instantiates a client
  const client = new AutoMlClient();

  async function importDataset() {
    // Construct request
    const request = {
      name: client.datasetPath(projectId, location, datasetId),
      inputConfig: {
        gcsSource: {
          inputUris: path.split(','),
        },
      },
    };

    // Import dataset
    console.log('Proccessing import');
    const [operation] = await client.importData(request);

    // Wait for operation to complete.
    const [response] = await operation.promise();
    console.log(`Dataset imported: ${response}`);
  }

  importDataset();
  // [END automl_import_dataset]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));

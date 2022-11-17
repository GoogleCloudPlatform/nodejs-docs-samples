// Copyright 2020 Google LLC
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
  datasetId = 'YOUR_DATASET_ID'
) {
  // [START automl_delete_dataset_beta]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const location = 'us-central1';
  // const datasetId = 'YOUR_DATASET_ID';

  // Imports the Google Cloud AutoML library
  const {AutoMlClient} = require(`@google-cloud/automl`).v1beta1;

  // Instantiates a client
  const client = new AutoMlClient();

  async function deleteDataset() {
    // Construct request
    const request = {
      name: client.datasetPath(projectId, location, datasetId),
    };

    const [operation] = await client.deleteDataset(request);

    // Wait for operation to complete.
    const [response] = await operation.promise();
    console.log(`Dataset deleted: ${response}`);
  }

  deleteDataset();
  // [END automl_delete_dataset_beta]
}

main(...process.argv.slice(2));

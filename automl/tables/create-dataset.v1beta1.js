// Copyright 2019 Google LLC
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
async function main(
  projectId = 'YOUR_PROJECT_ID',
  computeRegion = 'YOUR_REGION_NAME',
  datasetName = 'YOUR_DATASET_NAME'
) {
  // [START automl_tables_create_dataset]
  const automl = require('@google-cloud/automl');
  const util = require('util');
  const client = new automl.v1beta1.AutoMlClient();

  /**
   * Demonstrates using the AutoML client to create a dataset
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = '[PROJECT_ID]' e.g., "my-gcloud-project";
  // const computeRegion = '[REGION_NAME]' e.g., "us-central1";
  // const datasetName = '[DATASET_NAME]' e.g., “myDataset”;

  // A resource that represents Google Cloud Platform location.
  const projectLocation = client.locationPath(projectId, computeRegion);

  // Set dataset name and metadata.
  const myDataset = {
    displayName: datasetName,
    tablesDatasetMetadata: {},
  };

  // Create a dataset with the dataset metadata in the region.
  client
    .createDataset({parent: projectLocation, dataset: myDataset})
    .then(responses => {
      const dataset = responses[0];
      // Display the dataset information.
      console.log(`Dataset name: ${dataset.name}`);
      console.log(`Dataset Id: ${dataset.name.split('/').pop(-1)}`);
      console.log(`Dataset display name: ${dataset.displayName}`);
      console.log(`Dataset example count: ${dataset.exampleCount}`);
      console.log(
        `Tables dataset metadata: ${util.inspect(
          dataset.tablesDatasetMetadata,
          false,
          null
        )}`
      );
    })
    .catch(err => {
      console.error(err);
    });
  // [END automl_tables_create_dataset]
}
main(...process.argv.slice(2)).catch(console.error());

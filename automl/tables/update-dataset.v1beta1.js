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
  datasetId = 'YOUR_DATASET_ID',
  displayName = 'DISPLAY_NAME'
) {
  // [START automl_tables_update_dataset]
  const automl = require('@google-cloud/automl');

  const client = new automl.v1beta1.AutoMlClient();

  /**
   * Demonstrates using the AutoML client to update a dataset by ID.
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = '[PROJECT_ID]' e.g., "my-gcloud-project";
  // const computeRegion = '[REGION_NAME]' e.g., "us-central1";
  // const datasetId = '[DATASET_ID]' e.g., "TBL2246891593778855936";
  // const displayName = '[DISPLAY_NAME]' e.g., "myUpdateDataset";

  // Get the full path of the dataset.
  const datasetFullId = client.datasetPath(projectId, computeRegion, datasetId);

  // Update the dataset display name.
  const dataset = {
    name: datasetFullId,
    displayName: displayName,
  };

  // Add the update mask to particular field.
  const fieldMask = 'displayName';
  const updateMask = {path: fieldMask};

  // Update the information about a given dataset.
  client
    .updateDataset({dataset: dataset, updatemask: updateMask})
    .then(responses => {
      const dataset = responses[0];

      // Display the dataset information.
      console.log(`Dataset name: ${dataset.name}`);
      console.log(`Dataset Id: ${dataset.name.split('/').pop(-1)}`);
      console.log(`Updated dataset display name: ${dataset.displayName}`);
      console.log(`Dataset example count: ${dataset.exampleCount}`);
    })
    .catch(err => {
      console.error(err);
    });
  // [END automl_tables_update_dataset]
}
main(...process.argv.slice(2)).catch(console.error());

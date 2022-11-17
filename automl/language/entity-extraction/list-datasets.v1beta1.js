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
  filter = 'YOUR_FILTER_EXPRESSION'
) {
  // [START automl_language_entity_list_datasets]
  const automl = require('@google-cloud/automl');
  const util = require('util');
  const client = new automl.v1beta1.AutoMlClient();

  /**
   * Demonstrates using the AutoML client to list all datasets.
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = '[PROJECT_ID]' e.g., "my-gcloud-project";
  // const computeRegion = '[REGION_NAME]' e.g., "us-central1";
  // const filter_ = '[FILTER_EXPRESSIONS]'
  // e.g., "textExtractionDatasetMetadata:*";

  // A resource that represents Google Cloud Platform location.
  const projectLocation = client.locationPath(projectId, computeRegion);

  // List all the datasets available in the region by applying filter.
  client
    .listDatasets({parent: projectLocation, filter: filter})
    .then(responses => {
      const dataset = responses[0];

      // Display the dataset information.
      console.log(`List of datasets:`);
      for (let i = 0; i < dataset.length; i++) {
        console.log(`\nDataset name: ${dataset[i].name}`);
        console.log(`Dataset Id: ${dataset[i].name.split(`/`).pop(-1)}`);
        console.log(`Dataset display name: ${dataset[i].displayName}`);
        console.log(`Dataset example count: ${dataset[i].exampleCount}`);
        console.log(
          `Text extraction dataset metadata: ${util.inspect(
            dataset[i].textExtractionDatasetMetadata,
            false,
            null
          )}`
        );
      }
    })
    .catch(err => {
      console.error(err);
    });
  // [END automl_language_entity_list_datasets]
}
main(...process.argv.slice(2)).catch(console.error());

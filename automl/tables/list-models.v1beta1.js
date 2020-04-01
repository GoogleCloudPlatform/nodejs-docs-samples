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
  filter = 'FILTER_EXPRESSION'
) {
  // [START automl_tables_list_models]
  const automl = require('@google-cloud/automl');
  const client = new automl.v1beta1.AutoMlClient();

  /**
   * Demonstrates using the AutoML client to list all models.
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = '[PROJECT_ID]' e.g., "my-gcloud-project";
  // const computeRegion = '[REGION_NAME]' e.g., "us-central1";
  // const filter_ = '[FILTER_EXPRESSIONS]' e.g., "tablesModelMetadata:*";

  // A resource that represents Google Cloud Platform location.
  const projectLocation = client.locationPath(projectId, computeRegion);

  // List all the models available in the region by applying filter.
  client
    .listModels({parent: projectLocation, filter: filter})
    .then(responses => {
      const model = responses[0];

      // Display the model information.
      console.log('List of models:');
      for (let i = 0; i < model.length; i++) {
        console.log(`\nModel name: ${model[i].name}`);
        console.log(`Model Id: ${model[i].name.split('/').pop(-1)}`);
        console.log(`Model display name: ${model[i].displayName}`);
        console.log(`Dataset Id: ${model[i].datasetId}`);
        console.log('Tables model metadata:');
        console.log(
          `\tTraining budget: ${model[i].tablesModelMetadata.trainBudgetMilliNodeHours}`
        );
        console.log(
          `\tTraining cost: ${model[i].tablesModelMetadata.trainCostMilliNodeHours}`
        );
        console.log(`Model deployment state: ${model[i].deploymentState}`);
      }
    })
    .catch(err => {
      console.error(err);
    });
  // [END automl_tables_list_models]
}
main(...process.argv.slice(2)).catch(console.error());

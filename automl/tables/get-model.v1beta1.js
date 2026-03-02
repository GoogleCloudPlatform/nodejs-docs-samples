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
  modelId = 'MODEL_ID'
) {
  // [START automl_tables_get_model]
  const automl = require('@google-cloud/automl');
  const client = new automl.v1beta1.AutoMlClient();

  /**
   * Demonstrates using the AutoML client to get model details.
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = '[PROJECT_ID]' e.g., "my-gcloud-project";
  // const computeRegion = '[REGION_NAME]' e.g., "us-central1";
  // const modelId = '[MODEL_ID]' e.g., "TBL4704590352927948800";

  // Get the full path of the model.
  const modelFullId = client.modelPath(projectId, computeRegion, modelId);

  // Get complete detail of the model.
  client
    .getModel({name: modelFullId})
    .then(responses => {
      const model = responses[0];

      // Display the model information.
      console.log(`Model name: ${model.name}`);
      console.log(`Model Id: ${model.name.split('/').pop(-1)}`);
      console.log(`Model display name: ${model.displayName}`);
      console.log(`Dataset Id: ${model.datasetId}`);
      console.log('Tables model metadata: ');
      console.log(
        `\tTraining budget: ${model.tablesModelMetadata.trainBudgetMilliNodeHours}`
      );
      console.log(
        `\tTraining cost: ${model.tablesModelMetadata.trainCostMilliNodeHours}`
      );
      console.log(`Model deployment state: ${model.deploymentState}`);
    })
    .catch(err => {
      console.error(err);
    });
  // [END automl_tables_get_model]
}
main(...process.argv.slice(2)).catch(console.error());

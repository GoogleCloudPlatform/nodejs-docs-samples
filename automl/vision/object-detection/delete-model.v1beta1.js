/**
 * Copyright 2019, Google LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

`use strict`;
function main(
  projectId = 'YOUR_PROJECT_ID',
  computeRegion = 'YOUR_REGION_NAME',
  modelId = 'YOUR_MODEL_ID'
) {
  // [START automl_vision_object_detection_delete_model]
  /**
   * Demonstrates using the AutoML client to delete a model.
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = '[PROJECT_ID]' e.g., "my-gcloud-project";
  // const computeRegion = '[REGION_NAME]' e.g., "us-central1";
  // const modelId = '[MODEL_ID]' e.g., "IOD1187015161160925184";

  //Imports the Google Cloud Automl library
  const {AutoMlClient} = require('@google-cloud/automl').v1beta1;

  // Instantiates a client
  const automlClient = new AutoMlClient();
  async function deleteModel() {
    // Get the full path of the model.
    const modelFullId = automlClient.modelPath(
      projectId,
      computeRegion,
      modelId
    );

    // Delete a model.
    const [operation] = await automlClient.deleteModel({name: modelFullId});

    const [response] = await operation.promise();
    const operationDetails = response[2];

    // Get the Model delete details.
    console.log('Model delete details:');
    console.log(`  Operation details:`);
    console.log(`   Name: ${operationDetails.name}`);
    console.log(`   Done: ${operationDetails.done}`);
  }
  deleteModel();
  // [END automl_vision_object_detection_delete_model]
}
main(...process.argv.slice(2));

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
  datasetId = 'YOUR_DATASET_ID',
  modelName = 'MODEL_NAME'
) {
  // [START automl_vision_object_detection_create_model]
  /**
   * Demonstrates using the AutoML client to create a model.
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = '[PROJECT_ID]' e.g., "my-gcloud-project";
  // const computeRegion = '[REGION_NAME]' e.g., "us-central1";
  // const datasetId = '[DATASET_ID]' e.g., "IOD34216801856389120";
  // const modelName = '[MODEL_NAME]' e.g., "myModel";
  //Imports the Google Cloud Automl library
  const {AutoMlClient} = require('@google-cloud/automl').v1beta1;

  // Instantiates a client
  const automlClient = new AutoMlClient();
  async function createModel() {
    // A resource that represents Google Cloud Platform location.
    const projectLocation = automlClient.locationPath(projectId, computeRegion);

    // Set datasetId, model name and model metadata for the dataset.
    const myModel = {
      displayName: modelName,
      datasetId: datasetId,
      imageObjectDetectionModelMetadata: {},
    };

    // Create a model with the model metadata in the region.
    const [response] = await automlClient.createModel({
      parent: projectLocation,
      model: myModel,
    });

    const initialApiResponse = response[1];
    console.log(`Training operation name: ${initialApiResponse.name}`);
    console.log(`Training started...`);
  }
  createModel();
  // [END automl_vision_object_detection_create_model]
}
main(...process.argv.slice(2));

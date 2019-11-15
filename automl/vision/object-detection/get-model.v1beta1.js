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
function main(
  projectId = 'YOUR_PROJECT_ID',
  computeRegion = 'YOUR_REGION_NAME',
  modelId = 'MODEL_ID'
) {
  // [START automl_vision_object_detection_get_model]
  /**
   * Demonstrates using the AutoML client to get model details.
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = '[PROJECT_ID]' e.g., "my-gcloud-project";
  // const computeRegion = '[REGION_NAME]' e.g., "us-central1";
  // const modelId = '[MODEL_ID]' e.g., "IOD1187015161160925184";

  //Imports the Google Cloud Automl library
  const {AutoMlClient} = require('@google-cloud/automl').v1beta1;

  // Instantiates a client
  const automlClient = new AutoMlClient();

  async function getModel() {
    // Get the full path of the model.
    const modelFullId = automlClient.modelPath(
      projectId,
      computeRegion,
      modelId
    );

    // Get complete detail of the model.
    const [response] = await automlClient.getModel({name: modelFullId});

    // Display the model information.
    console.log(`Model name: ${response.name}`);
    console.log(`Model Id: ${response.name.split(`/`).pop(-1)}`);
    console.log(`Model display name: ${response.displayName}`);
    console.log(`Dataset Id: ${response.datasetId}`);

    if (response.modelMetadata === `translationModelMetadata`) {
      console.log(`Translation model metadata:`);
      console.log(
        `\tBase model: ${response.translationModelMetadata.baseModel}`
      );
      console.log(
        `\tSource language code: ${response.translationModelMetadata.sourceLanguageCode}`
      );
      console.log(
        `\tTarget language code: ${response.translationModelMetadata.targetLanguageCode}`
      );
    } else if (response.modelMetadata === `textClassificationModelMetadata`) {
      console.log(
        `Text classification model metadata: , ${response.textClassificationModelMetadata}`
      );
    } else if (response.modelMetadata === `imageClassificationModelMetadata`) {
      console.log(`Image classification model metadata:`);
      console.log(
        `\tBase model Id: ${response.imageClassificationModelMetadata.baseModelId}`
      );
      console.log(
        `\tTrain budget: ${response.imageClassificationModelMetadata.trainBudget}`
      );
      console.log(
        `\tTrain cost: ${response.imageClassificationModelMetadata.trainCost}`
      );
      console.log(
        `\tStop reason: ${response.imageClassificationModelMetadata.stopReason}`
      );
    } else if (response.modelMetadata === `imageObjectDetectionModelMetadata`) {
      console.log(`Image Object Detection Model metadata:`);
      console.log(
        `\tModel Type: ${response.imageObjectDetectionModelMetadata.modelType}`
      );
    }
    console.log(`Model deployment state: ${response.deploymentState}`);
  }
  getModel();
  // [END automl_vision_object_detection_get_model]
}
main(...process.argv.slice(2));

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
  filter = 'FILTER_EXPRESSION'
) {
  // [START automl_vision_object_detection_list_models]
  /**
   * Demonstrates using the AutoML client to list all models.
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = '[PROJECT_ID]' e.g., "my-gcloud-project";
  // const computeRegion = '[REGION_NAME]' e.g., "us-central1";
  // const filter_ = '[FILTER_EXPRESSIONS]'
  // e.g., "imageObjectDetectionModelMetadata:*";

  //Imports the Google Cloud Automl library
  const {AutoMlClient} = require('@google-cloud/automl').v1beta1;

  // Instantiates a client
  const automlClient = new AutoMlClient();
  async function listModels() {
    // A resource that represents Google Cloud Platform location.
    const projectLocation = automlClient.locationPath(projectId, computeRegion);

    // List all the models available in the region by applying filter.
    const [response] = await automlClient.listModels({
      parent: projectLocation,
      filter: filter,
    });
    console.log(`List of models:`);
    for (const model of response) {
      console.log(`\nModel name: ${model.name}`);
      console.log(`Model Id: ${model.name.split(`/`).pop(-1)}`);
      console.log(`Model display name: ${model.displayName}`);
      console.log(`Dataset Id: ${model.datasetId}`);

      if (model.modelMetadata === `translationModelMetadata`) {
        console.log(`Translation model metadata:`);
        console.log(`Base model: ${model.translationModelMetadata.baseModel}`);
        console.log(
          `Source language code: ${model.translationModelMetadata.sourceLanguageCode}`
        );
        console.log(
          `Target language code: ${model.translationModelMetadata.targetLanguageCode}`
        );
      } else if (model.modelMetadata === `textClassificationModelMetadata`) {
        console.log(
          `Text classification model metadata: , ${model.textClassificationModelMetadata}`
        );
      } else if (model.modelMetadata === `imageClassificationModelMetadata`) {
        console.log(`Image classification model metadata:`);
        console.log(
          `Base model Id: ${model.imageClassificationModelMetadata.baseModelId}`
        );
        console.log(
          `Train budget: ${model.imageClassificationModelMetadata.trainBudget}`
        );
        console.log(
          `Train cost: ${model.imageClassificationModelMetadata.trainCost}`
        );
        console.log(
          `Stop reason: ${model.imageClassificationModelMetadata.stopReason}`
        );
      } else if (model.modelMetadata === `imageObjectDetectionModelMetadata`) {
        console.log(`Image Object Detection Model metadata:`);
        console.log(
          `Model Type: ${model.imageObjectDetectionModelMetadata.modelType}`
        );
      }

      console.log(`Model deployment state: ${model.deploymentState}`);
    }
  }
  listModels();
  // [END automl_vision_object_detection_list_models]
}
main(...process.argv.slice(2));

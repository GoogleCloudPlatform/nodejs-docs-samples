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
  modelId = 'MODEL_ID',
  modelEvaluationId = 'MODEL_EVALUATION_ID'
) {
  // [START automl_vision_object_detection_get_model_evaluation]
  /**
   * Demonstrates using the AutoML client to get model evaluations.
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = '[PROJECT_ID]' e.g., "my-gcloud-project";
  // const computeRegion = '[REGION_NAME]' e.g., "us-central1";
  // const modelId = '[MODEL_ID]' e.g., "IOD2122286140026257408";
  // const modelEvaluationId = '[MODEL_EVALUATION_ID]'
  // e.g., "3806191078210741236";

  //Imports the Google Cloud Automl library
  const {AutoMlClient} = require('@google-cloud/automl').v1beta1;

  // Instantiates a client
  const automlClient = new AutoMlClient();

  const math = require('mathjs');

  async function getModelEvaluations() {
    // Get the full path of the model evaluation.
    const modelEvaluationFullId = automlClient.modelEvaluationPath(
      projectId,
      computeRegion,
      modelId,
      modelEvaluationId
    );

    // Get complete detail of the model evaluation.
    const [response] = await automlClient.getModelEvaluation({
      name: modelEvaluationFullId,
    });

    const detectMetrics = response.imageObjectDetectionEvaluationMetrics;
    const boundingBoxMetricsEntries = detectMetrics.boundingBoxMetricsEntries;

    // Display the model evaluations information.
    console.log(`\nModel evaluation name:  ${response.name}`);
    console.log(
      `Model evaluation Id:  ${response.name
        .split(`/`)
        .slice(-1)
        .pop()}`
    );
    console.log(
      `Model evaluation annotation spec Id:  ${response.annotationSpecId}`
    );
    console.log(`Model evaluation display name:  ${response.displayName}`);
    console.log(
      `Model evaluation example count:  ${response.evaluatedExampleCount}`
    );
    console.log(`Image object detection evaluation metrics:`);
    console.log(
      ` Evaluated bounding box count:  ${detectMetrics.evaluatedBoundingBoxCount}`
    );
    console.log(
      ` Bounding box mean average precision:  ${math.round(
        detectMetrics.boundingBoxMeanAveragePrecision,
        6
      )}`
    );

    for (const boundingBoxMetricsEntry of boundingBoxMetricsEntries) {
      console.log(`\tBounding box metrics entries:`);
      console.log(
        `   Iou threshold:  ${math.round(
          boundingBoxMetricsEntry.iouThreshold,
          2
        )}`
      );
      console.log(
        `   Mean average precision:  ${math.round(
          boundingBoxMetricsEntry.meanAveragePrecision,
          6
        )}`
      );
      console.log(`   Confidence metrics entries:`);
      const confidenceMetricsEntries =
        boundingBoxMetricsEntry.confidenceMetricsEntries;

      for (const confidenceMetricsEntry of confidenceMetricsEntries) {
        console.log(
          `     Model confidence threshold:  ${math.round(
            confidenceMetricsEntry.confidenceThreshold * 100,
            6
          )}`
        );
        console.log(
          `     Model recall:  ${math.round(
            confidenceMetricsEntry.recall * 100,
            2
          )} %`
        );
        console.log(
          `\t\t\tModel precision:  ${math.round(
            confidenceMetricsEntry.precision * 100,
            2
          )} %`
        );
        console.log(
          `     Model f1 score:  ${math.round(
            confidenceMetricsEntry.f1Score * 100,
            2
          )} % \n`
        );
      }
    }
  }
  getModelEvaluations();
  // [END automl_vision_object_detection_get_model_evaluation]
}
main(...process.argv.slice(2));

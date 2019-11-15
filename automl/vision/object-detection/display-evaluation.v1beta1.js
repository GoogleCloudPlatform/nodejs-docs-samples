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
  filter = 'FILTER_EXPRESSION'
) {
  // [START automl_vision_object_detection_display_evaluation]
  /**
   * Demonstrates using the AutoML client to display model evaluation.
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = '[PROJECT_ID]' e.g., "my-gcloud-project";
  // const computeRegion = '[REGION_NAME]' e.g., "us-central1";
  // const modelId = '[MODEL_ID]' e.g., "IOD2122286140026257408";
  // const filter = '[FILTER_EXPRESSIONS]'
  // e.g., "imageObjectDetectionModelMetadata:*";

  const math = require('mathjs');
  //Imports the Google Cloud Automl library
  const {AutoMlClient} = require('@google-cloud/automl').v1beta1;

  // Instantiates a client
  const automlClient = new AutoMlClient();

  // Get the full path of the model.
  const modelFullId = automlClient.modelPath(projectId, computeRegion, modelId);

  // List all the model evaluations in the model by applying filter.
  automlClient
    .listModelEvaluations({parent: modelFullId, filter: filter})
    .then(respond => {
      const response = respond[0];
      // Iterate through the results.
      let modelEvaluationId = ``;
      for (const element of response) {
        // There is evaluation for each class in a model and for overall model.
        // Get only the evaluation of overall model.
        if (!element.annotationSpecId) {
          modelEvaluationId = element.name.split(`/`).pop(-1);
        }
      }
      console.log(`Model Evaluation ID: ${modelEvaluationId}`);

      // Resource name for the model evaluation.
      const modelEvaluationFullId = automlClient.modelEvaluationPath(
        projectId,
        computeRegion,
        modelId,
        modelEvaluationId
      );

      // Get a model evaluation.
      automlClient
        .getModelEvaluation({name: modelEvaluationFullId})
        .then(responses => {
          const modelEvaluation = responses[0];
          const classMetrics =
            modelEvaluation.imageObjectDetectionEvaluationMetrics;
          const boundingBoxMetricsEntries =
            classMetrics.boundingBoxMetricsEntries;

          for (const boundingBoxMetricsEntry of boundingBoxMetricsEntries) {
            const confidenceMetricsEntries =
              boundingBoxMetricsEntry.confidenceMetricsEntries;
            // Showing model score based on threshold of 0.5
            for (const confidenceMetricsEntry of confidenceMetricsEntries) {
              if (confidenceMetricsEntry.confidenceThreshold === 0.5) {
                console.log(
                  `Precision and recall are based on a score ` +
                    `threshold of 0.5`
                );
                console.log(
                  `Model precision: ${math.round(
                    confidenceMetricsEntry.precision * 100,
                    2
                  )} %`
                );
                console.log(
                  `Model recall: ${math.round(
                    confidenceMetricsEntry.recall * 100,
                    2
                  )} %`
                );
                console.log(
                  `Model f1 score: ${math.round(
                    confidenceMetricsEntry.f1Score * 100,
                    2
                  )} %`
                );
              }
            }
          }
        })
        .catch(err => {
          console.error(err);
        });
    })
    .catch(err => {
      console.error(err);
    });
  // [END automl_vision_object_detection_display_evaluation]
}
main(...process.argv.slice(2));

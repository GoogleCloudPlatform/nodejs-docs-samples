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
async function main(
  projectId = 'YOUR_PROJECT_ID',
  computeRegion = 'YOUR_REGION_NAME',
  modelId = 'MODEL_ID',
  filter = 'FILTER_EXPRESSION'
) {
  // [START automl_video_intelligence_classification_display_evaluation]
  const automl = require(`@google-cloud/automl`);
  const math = require(`mathjs`);
  const client = new automl.v1beta1.AutoMlClient();

  /**
   * Demonstrates using the AutoML client to display model evaluation.
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = '[PROJECT_ID]' e.g., "my-gcloud-project";
  // const computeRegion = '[REGION_NAME]' e.g., "us-central1";
  // const modelId = '[MODEL_ID]' e.g., "VCN7209576908164431872";
  // const filter_ = '[FILTER_EXPRESSIONS]'
  // e.g., "videoClassificationModelMetadata:*";

  // Get the full path of the model.
  const modelFullId = client.modelPath(projectId, computeRegion, modelId);

  // List all the model evaluations in the model by applying filter.
  client
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
      const modelEvaluationFullId = client.modelEvaluationPath(
        projectId,
        computeRegion,
        modelId,
        modelEvaluationId
      );

      // Get a model evaluation.
      client
        .getModelEvaluation({name: modelEvaluationFullId})
        .then(responses => {
          const modelEvaluation = responses[0];
          const classMetrics = modelEvaluation.classificationEvaluationMetrics;
          const confidenceMetricsEntries = classMetrics.confidenceMetricsEntry;

          // Showing model score based on threshold of 0.5
          for (const confidenceMetricsEntry of confidenceMetricsEntries) {
            if (confidenceMetricsEntry.confidenceThreshold === 0.5) {
              console.log(
                `Precision and recall are based on a ` +
                  `score threshold of 0.5`
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
              console.log(
                `Model precision@1: ${math.round(
                  confidenceMetricsEntry.precisionAt1 * 100,
                  2
                )} %`
              );
              console.log(
                `Model recall@1: ${math.round(
                  confidenceMetricsEntry.recallAt1 * 100,
                  2
                )} %`
              );
              console.log(
                `Model f1 score@1: ${math.round(
                  confidenceMetricsEntry.f1ScoreAt1 * 100,
                  2
                )} %`
              );
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
  // [END automl_video_intelligence_classification_display_evaluation]
}
main(...process.argv.slice(2)).catch(console.error());

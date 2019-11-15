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
  modelId = 'MODEL_ID',
  filter = 'FILTER_EXPRESSION'
) {
  // [START automl_natural_language_sentiment_display_evaluation]
  const automl = require('@google-cloud/automl');
  const math = require('mathjs');
  const util = require('util');
  const client = new automl.v1beta1.AutoMlClient();

  /**
   * Demonstrates using the AutoML client to display model evaluation.
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = '[PROJECT_ID]' e.g., "my-gcloud-project";
  // const computeRegion = '[REGION_NAME]' e.g., "us-central1";
  // const modelId = '[MODEL_ID]'  e.g., "TEN5200971474357190656";
  // const filter_ = '[FILTER_EXPRESSIONS]'
  // e.g., "textSentimentModelMetadata:*";

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
      console.log(`Model Evaluation ID:`, modelEvaluationId);

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

          const sentimentMetrics =
            modelEvaluation.textSentimentEvaluationMetrics;
          const confusionMatrix = sentimentMetrics.confusionMatrix;

          console.log(
            `Model precision: ${math.round(
              sentimentMetrics.precision * 100,
              2
            )} %`
          );
          console.log(
            `Model recall: ${math.round(sentimentMetrics.recall * 100, 2)} %`
          );
          console.log(
            `Model f1 score: ${math.round(sentimentMetrics.f1Score * 100, 2)} %`
          );
          console.log(
            `Model mean absolute error: ${math.round(
              sentimentMetrics.meanAbsoluteError * 100,
              2
            )} %`
          );
          console.log(
            `Model mean squared error: ${math.round(
              sentimentMetrics.meanSquaredError * 100,
              2
            )} %`
          );
          console.log(
            `Model linear kappa: ${math.round(
              sentimentMetrics.linearKappa * 100,
              2
            )} %`
          );
          console.log(
            `Model quadratic kappa: ${math.round(
              sentimentMetrics.quadraticKappa * 100,
              2
            )} %`
          );

          console.log(`Model confusion matrix:`);
          const annotationSpecIdList = confusionMatrix.annotationSpecId;

          for (const annotationSpecId of annotationSpecIdList) {
            console.log(`\tAnnotation spec Id: ${annotationSpecId}`);
          }
          const rowList = confusionMatrix.row;

          for (const row of rowList) {
            console.log(`\tRow:`);
            const exampleCountList = row.exampleCount;

            for (const exampleCount of exampleCountList) {
              console.log(
                `\t\tExample count: ${util.inspect(exampleCount, false, null)}`
              );
            }
          }
          console.log(
            `Annotation spec Id: ${sentimentMetrics.annotationSpecId}`
          );
        })
        .catch(err => {
          console.error(err);
        });
    })
    .catch(err => {
      console.error(err);
    });
  // [END automl_natural_language_sentiment_display_evaluation]
}
main(...process.argv.slice(2)).catch(console.error());

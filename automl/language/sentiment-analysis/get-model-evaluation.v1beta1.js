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
  modelEvaluationId = 'MODEL_EVALUATION_ID'
) {
  // [START automl_natural_language_sentiment_get_model_evaluation]
  const automl = require(`@google-cloud/automl`);
  const math = require(`mathjs`);
  const util = require(`util`);
  const client = new automl.v1beta1.AutoMlClient();

  /**
   * Demonstrates using the AutoML client to get model evaluations.
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = '[PROJECT_ID]' e.g., "my-gcloud-project";
  // const computeRegion = '[REGION_NAME]' e.g., "us-central1";
  // const modelId = '[MODEL_ID]' e.g., "TEN5200971474357190656";
  // const modelEvaluationId = '[MODEL_EVALUATION_ID]'
  // e.g., "3806191078210741236";

  // Get the full path of the model evaluation.
  const modelEvaluationFullId = client.modelEvaluationPath(
    projectId,
    computeRegion,
    modelId,
    modelEvaluationId
  );

  // Get complete detail of the model evaluation.
  client
    .getModelEvaluation({name: modelEvaluationFullId})
    .then(responses => {
      const response = responses[0];

      const sentimentMetrics = response.textSentimentEvaluationMetrics;
      const confusionMatrix = sentimentMetrics.confusionMatrix;

      // Display the model evaluations information.
      console.log(`\nModel evaluation name: ${response.name}`);
      console.log(
        `Model evaluation Id: ${response.name
          .split(`/`)
          .slice(-1)
          .pop()}`
      );
      console.log(
        `Model evaluation annotation spec Id: ${response.annotationSpecId}`
      );
      console.log(`Model evaluation display name: ${response.displayName}`);
      console.log(
        `Model evaluation example count: ${response.evaluatedExampleCount}`
      );
      console.log(`Text sentiment evaluation metrics:`);
      console.log(
        `\tModel precision: ${math.round(
          sentimentMetrics.precision * 100,
          2
        )} %`
      );
      console.log(
        `\tModel recall: ${math.round(sentimentMetrics.recall * 100, 2)} %`
      );
      console.log(
        `\tModel f1 score: ${math.round(sentimentMetrics.f1Score * 100, 2)} %`
      );

      if (!response.annotationSpecId) {
        console.log(
          `\tModel mean absolute error: ${math.round(
            sentimentMetrics.meanAbsoluteError * 100,
            2
          )} %`
        );
        console.log(
          `\tModel mean squared error: ${math.round(
            sentimentMetrics.meanSquaredError * 100,
            2
          )} %`
        );
        console.log(
          `\tModel linear kappa: ${math.round(
            sentimentMetrics.linearKappa * 100,
            2
          )} %`
        );
        console.log(
          `\tModel quadratic kappa: ${math.round(
            sentimentMetrics.quadraticKappa * 100,
            2
          )} %`
        );

        console.log(`\tModel confusion matrix:`);
        const annotationSpecIdList = confusionMatrix.annotationSpecId;

        for (const annotationSpecId of annotationSpecIdList) {
          console.log(`\t\tAnnotation spec Id: ${annotationSpecId}`);
        }
        const rowList = confusionMatrix.row;

        for (const row of rowList) {
          console.log(`\t\tRow:`);
          const exampleCountList = row.exampleCount;

          for (const exampleCount of exampleCountList) {
            console.log(
              `\t\t\tExample count: ${util.inspect(exampleCount, false, null)}`
            );
          }
        }
        console.log(
          `\tAnnotation spec Id: ${sentimentMetrics.annotationSpecId}`
        );
      }
    })
    .catch(err => {
      console.error(err);
    });
  // [END automl_natural_language_sentiment_get_model_evaluation]
}
main(...process.argv.slice(2)).catch(console.error());

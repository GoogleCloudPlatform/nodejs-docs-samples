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
  modelId = 'YOUR_MODEL_ID',
  filter = 'YOUR_FILTER_EXPRESSION'
) {
  // [START automl_natural_language_entity_list_model_evaluations]
  const automl = require(`@google-cloud/automl`);
  const math = require(`mathjs`);
  const client = new automl.v1beta1.AutoMlClient();

  /**
   * Demonstrates using the AutoML client to list model evaluations.
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = '[PROJECT_ID]' e.g., "my-gcloud-project";
  // const computeRegion = '[REGION_NAME]' e.g., "us-central1";
  // const modelId = '[MODEL_ID]' e.g., "TEN5200971474357190656";
  // const filter_ = '[FILTER_EXPRESSIONS]'
  // e.g., "textExtractionModelMetadata:*";

  // Get the full path of the model.
  const modelFullId = client.modelPath(projectId, computeRegion, modelId);

  // List all the model evaluations in the model by applying filter.
  client
    .listModelEvaluations({parent: modelFullId, filter: filter})
    .then(responses => {
      const element = responses[0];
      console.log(`List of model evaluations:`);
      for (let i = 0; i < element.length; i++) {
        const extractMetrics = element[i].textExtractionEvaluationMetrics;
        const confidenceMetricsEntries =
          extractMetrics.confidenceMetricsEntries;

        // Display the model evaluations information.
        console.log(`\nModel evaluation name: ${element[i].name}`);
        console.log(
          `Model evaluation Id: ${element[i].name
            .split(`/`)
            .slice(-1)
            .pop()}`
        );
        console.log(
          `Model evaluation annotation spec Id: ${element[i].annotationSpecId}`
        );
        console.log(`Model evaluation display name: ${element[i].displayName}`);
        console.log(
          `Model evaluation example count: ${element[i].evaluatedExampleCount}`
        );
        console.log(`Text extraction evaluation metrics:`);
        console.log(`\tModel AuPrc: ${math.round(extractMetrics.auPrc, 2)}`);
        console.log(`\tConfidence metrics entries:`);

        for (const confidenceMetricsEntry of confidenceMetricsEntries) {
          console.log(
            `\t\tModel confidence threshold: ${math.round(
              confidenceMetricsEntry.confidenceThreshold,
              2
            )}`
          );
          console.log(
            `\t\tModel recall: ${math.round(
              confidenceMetricsEntry.recall * 100,
              2
            )} %`
          );
          console.log(
            `\t\tModel precision: ${math.round(
              confidenceMetricsEntry.precision * 100,
              2
            )} %`
          );
          console.log(
            `\t\tModel f1 score: ${math.round(
              confidenceMetricsEntry.f1Score * 100,
              2
            )} % \n`
          );
        }
      }
    })
    .catch(err => {
      console.error(err);
    });
  // [END automl_natural_language_entity_list_model_evaluations]
}
main(...process.argv.slice(2)).catch(console.error());

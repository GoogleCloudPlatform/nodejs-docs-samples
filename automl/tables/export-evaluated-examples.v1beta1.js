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
  bigQueryOutputUri = 'BIGQUERY_DIRECTORY'
) {
  // [START automl_tables_export_evaluated_examples]
  const automl = require(`@google-cloud/automl`);
  const client = new automl.v1beta1.AutoMlClient();

  /**
   * Demonstrates using the AutoML client to export evaluated examples.
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = '[PROJECT_ID]' e.g., "my-gcloud-project";
  // const computeRegion = '[REGION_NAME]' e.g., "us-central1";
  // const modelId = '[MODEL_ID]' e.g., "TBL4704590352927948800";
  // const outputUri = '[BIGQUERY_DIRECTORY]' e.g., “bq://<project_id>”,
  // `BigQuery URI for the export directory`;

  // Get the full path of the model.
  const modelFullId = client.modelPath(projectId, computeRegion, modelId);

  // Set the output URI.
  const outputConfig = {
    bigqueryDestination: {
      outputUri: bigQueryOutputUri,
    },
  };

  // Export the examples on which the model was evaluated to the
  // bigQuery output URI.
  client
    .exportEvaluatedExamples({name: modelFullId, outputConfig: outputConfig})
    .then(responses => {
      const initialApiResponse = responses[1];
      console.log(`Operation name: ${initialApiResponse.name}`);
    })
    .catch(err => {
      console.error(err);
    });
  // [END automl_tables_export_evaluated_examples]
}
main(...process.argv.slice(2)).catch(console.error());

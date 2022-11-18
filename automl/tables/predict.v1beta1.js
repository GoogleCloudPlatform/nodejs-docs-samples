// Copyright 2019 Google LLC
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
  projectId = 'YOUR_GCP_PROJECT_ID',
  computeRegion = 'REGION',
  modelId = 'YOUR_MODEL_ID',
  inputs = '[{"numberValue": 1}, {"stringValue": "value"}]'
) {
  inputs = JSON.parse(inputs);

  // [START automl_tables_predict]

  /**
   * Demonstrates using the AutoML client to request prediction from
   * automl tables using csv.
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = '[PROJECT_ID]' e.g., "my-gcloud-project";
  // const computeRegion = '[REGION_NAME]' e.g., "us-central1";
  // const modelId = '[MODEL_ID]' e.g., "TBL000000000000";
  // const inputs = [{ numberValue: 1 }, { stringValue: 'value' }, { stringValue: 'value2' } ...]

  const automl = require('@google-cloud/automl');

  // Create client for prediction service.
  const automlClient = new automl.v1beta1.PredictionServiceClient();

  // Get the full path of the model.
  const modelFullId = automlClient.modelPath(projectId, computeRegion, modelId);

  async function predict() {
    // Set the payload by giving the row values.
    const payload = {
      row: {
        values: inputs,
      },
    };

    // Params is additional domain-specific parameters.
    // Currently there is no additional parameters supported.
    const [response] = await automlClient.predict({
      name: modelFullId,
      payload: payload,
      params: {feature_importance: true},
    });
    console.log('Prediction results:');

    for (const result of response.payload) {
      console.log(`Predicted class name: ${result.displayName}`);
      console.log(`Predicted class score: ${result.tables.score}`);

      // Get features of top importance
      const featureList = result.tables.tablesModelColumnInfo.map(
        columnInfo => {
          return {
            importance: columnInfo.featureImportance,
            displayName: columnInfo.columnDisplayName,
          };
        }
      );
      // Sort features by their importance, highest importance first
      featureList.sort((a, b) => {
        return b.importance - a.importance;
      });

      // Print top 10 important features
      console.log('Features of top importance');
      console.log(featureList.slice(0, 10));
    }
  }
  predict();
  // [END automl_tables_predict]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

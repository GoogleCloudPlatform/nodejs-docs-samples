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
  filePath = 'FILE_PATH'
) {
  // [START automl_tables_predict]
  const automl = require('@google-cloud/automl');
  const fs = require('fs');
  const csv = require('csv');

  // Create client for prediction service.
  const client = new automl.v1beta1.PredictionServiceClient();

  /**
   * Demonstrates using the AutoML client to request prediction from
   * automl tables using csv.
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = '[PROJECT_ID]' e.g., "my-gcloud-project";
  // const computeRegion = '[REGION_NAME]' e.g., "us-central1";
  // const modelId = '[MODEL_ID]' e.g., "TBL4704590352927948800";
  // const filePath = '[FILE_PATH]'
  // e.g., "<resource>/<csv file>", `local csv file path`;

  // Get the full path of the model.
  const modelFullId = client.modelPath(projectId, computeRegion, modelId);

  // Read the csv file content for prediction.
  const stream = fs
    .createReadStream(filePath)
    .pipe(csv.parse())
    .on(`data`, function(data) {
      const values = [];

      for (const val of data) {
        values.push({stringValue: val});
      }

      // Set the payload by giving the row values.
      const payload = {
        row: {
          values: values,
        },
      };

      // Params is additional domain-specific parameters.
      // Currently there is no additional parameters supported.
      client
        .predict({
          name: modelFullId,
          payload: payload,
          params: {feature_importance: true},
        })
        .then(responses => {
          console.log(responses);
          console.log(`Prediction results:`);

          for (const result of responses[0].payload) {
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
            featureList.sort(function(a, b) {
              return b.importance - a.importance;
            });

            // Print top 10 important features
            console.log('Features of top importance');
            console.log(featureList.slice(0, 10));
          }
        })
        .catch(err => {
          console.error(err);
        });
    });
  stream.read();
  // [END automl_tables_predict]
}
main(...process.argv.slice(2)).catch(console.error());

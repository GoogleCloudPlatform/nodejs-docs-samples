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
  datasetId = 'YOUR_DATASET_ID',
  tableId = 'TABLE_ID',
  columnId = 'COLUMN_ID',
  modelName = 'MODEL_NAME',
  trainBudget = 'TRAIN_BUDGET'
) {
  // [START automl_tables_create_model]
  const automl = require('@google-cloud/automl');
  const client = new automl.v1beta1.AutoMlClient();

  /**
   * Demonstrates using the AutoML client to create a model.
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = '[PROJECT_ID]' e.g., "my-gcloud-project";
  // const computeRegion = '[REGION_NAME]' e.g., "us-central1";
  // const datasetId = '[DATASET_ID]' e.g., "TBL2246891593778855936";
  // const tableId = '[TABLE_ID]' e.g., "1991013247762825216";
  // const columnId = '[COLUMN_ID]' e.g., "773141392279994368";
  // const modelName = '[MODEL_NAME]' e.g., "testModel";
  // const trainBudget = '[TRAIN_BUDGET]' e.g., "1000",
  // `Train budget in milli node hours`;

  // A resource that represents Google Cloud Platform location.
  const projectLocation = client.locationPath(projectId, computeRegion);

  // Get the full path of the column.
  const columnSpecId = client.columnSpecPath(
    projectId,
    computeRegion,
    datasetId,
    tableId,
    columnId
  );

  // Set target column to train the model.
  const targetColumnSpec = {name: columnSpecId};

  // Set tables model metadata.
  const tablesModelMetadata = {
    targetColumnSpec: targetColumnSpec,
    trainBudgetMilliNodeHours: trainBudget,
  };

  // Set datasetId, model name and model metadata for the dataset.
  const myModel = {
    datasetId: datasetId,
    displayName: modelName,
    tablesModelMetadata: tablesModelMetadata,
  };

  // Create a model with the model metadata in the region.
  client
    .createModel({parent: projectLocation, model: myModel})
    .then(responses => {
      const initialApiResponse = responses[1];
      console.log(`Training operation name: ${initialApiResponse.name}`);
      console.log('Training started...');
    })
    .catch(err => {
      console.error(err);
    });
  // [END automl_tables_create_model]
}
main(...process.argv.slice(2)).catch(console.error());

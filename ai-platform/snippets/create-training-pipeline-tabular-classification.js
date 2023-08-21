/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

async function main(
  datasetId,
  modelDisplayName,
  trainingPipelineDisplayName,
  targetColumn,
  project,
  location = 'us-central1'
) {
  // [START aiplatform_create_training_pipeline_tabular_classification_sample]
  /**
   * TODO(developer): Uncomment these variables before running the sample.\
   * (Not necessary if passing values as arguments)
   */

  // const datasetId = 'YOUR_DATASET_ID';
  // const modelDisplayName = 'YOUR_MODEL_DISPLAY_NAME';
  // const trainingPipelineDisplayName = 'YOUR_TRAINING_PIPELINE_DISPLAY_NAME';
  // const targetColumn = 'YOUR_TARGET_COLUMN';
  // const project = 'YOUR_PROJECT_ID';
  // const location = 'YOUR_PROJECT_LOCATION';
  const aiplatform = require('@google-cloud/aiplatform');
  const {definition} =
    aiplatform.protos.google.cloud.aiplatform.v1.schema.trainingjob;

  // Imports the Google Cloud Pipeline Service Client library
  const {PipelineServiceClient} = aiplatform.v1;
  // Specifies the location of the api endpoint
  const clientOptions = {
    apiEndpoint: 'us-central1-aiplatform.googleapis.com',
  };

  // Instantiates a client
  const pipelineServiceClient = new PipelineServiceClient(clientOptions);

  async function createTrainingPipelineTablesClassification() {
    // Configure the parent resource
    const parent = `projects/${project}/locations/${location}`;

    const transformations = [
      {auto: {column_name: 'sepal_width'}},
      {auto: {column_name: 'sepal_length'}},
      {auto: {column_name: 'petal_length'}},
      {auto: {column_name: 'petal_width'}},
    ];
    const trainingTaskInputsObj = new definition.AutoMlTablesInputs({
      targetColumn: targetColumn,
      predictionType: 'classification',
      transformations: transformations,
      trainBudgetMilliNodeHours: 8000,
      disableEarlyStopping: false,
      optimizationObjective: 'minimize-log-loss',
    });
    const trainingTaskInputs = trainingTaskInputsObj.toValue();

    const modelToUpload = {displayName: modelDisplayName};
    const inputDataConfig = {
      datasetId: datasetId,
      fractionSplit: {
        trainingFraction: 0.8,
        validationFraction: 0.1,
        testFraction: 0.1,
      },
    };
    const trainingPipeline = {
      displayName: trainingPipelineDisplayName,
      trainingTaskDefinition:
        'gs://google-cloud-aiplatform/schema/trainingjob/definition/automl_tables_1.0.0.yaml',
      trainingTaskInputs,
      inputDataConfig,
      modelToUpload,
    };
    const request = {
      parent,
      trainingPipeline,
    };

    // Create training pipeline request
    const [response] =
      await pipelineServiceClient.createTrainingPipeline(request);

    console.log('Create training pipeline tabular classification response');
    console.log(`Name : ${response.name}`);
    console.log('Raw response:');
    console.log(JSON.stringify(response, null, 2));
  }
  createTrainingPipelineTablesClassification();
  // [END aiplatform_create_training_pipeline_tabular_classification_sample]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));

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
  project,
  location = 'us-central1'
) {
  // [START aiplatform_create_training_pipeline_text_entity_extraction_sample]
  /**
   * TODO(developer): Uncomment these variables before running the sample.\
   * (Not necessary if passing values as arguments)
   */

  // const datasetId = 'YOUR_DATASET_ID';
  // const modelDisplayName = 'YOUR_MODEL_DISPLAY_NAME';
  // const trainingPipelineDisplayName = 'YOUR_TRAINING_PIPELINE_DISPLAY_NAME';
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

  async function createTrainingPipelineTextEntityExtraction() {
    // Configure the parent resource
    const parent = `projects/${project}/locations/${location}`;

    const trainingTaskInputObj = new definition.AutoMlTextExtractionInputs({});
    const trainingTaskInputs = trainingTaskInputObj.toValue();

    const modelToUpload = {displayName: modelDisplayName};
    const inputDataConfig = {datasetId: datasetId};
    const trainingPipeline = {
      displayName: trainingPipelineDisplayName,
      trainingTaskDefinition:
        'gs://google-cloud-aiplatform/schema/trainingjob/definition/automl_text_extraction_1.0.0.yaml',
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

    console.log('Create training pipeline text entity extraction response :');
    console.log(`Name : ${response.name}`);
    console.log('Raw response:');
    console.log(JSON.stringify(response, null, 2));
  }
  createTrainingPipelineTextEntityExtraction();
  // [END aiplatform_create_training_pipeline_text_entity_extraction_sample]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));

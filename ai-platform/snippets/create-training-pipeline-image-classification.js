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

function main(
  datasetId,
  modelDisplayName,
  trainingPipelineDisplayName,
  project,
  location = 'us-central1'
) {
  // [START aiplatform_create_training_pipeline_image_classification_sample]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   * (Not necessary if passing values as arguments)
   */
  /*
  const datasetId = 'YOUR DATASET';
  const modelDisplayName = 'NEW MODEL NAME;
  const trainingPipelineDisplayName = 'NAME FOR TRAINING PIPELINE';
  const project = 'YOUR PROJECT ID';
  const location = 'us-central1';
    */
  // Imports the Google Cloud Pipeline Service Client library
  const aiplatform = require('@google-cloud/aiplatform');

  const {definition} =
    aiplatform.protos.google.cloud.aiplatform.v1.schema.trainingjob;
  const ModelType = definition.AutoMlImageClassificationInputs.ModelType;

  // Specifies the location of the api endpoint
  const clientOptions = {
    apiEndpoint: 'us-central1-aiplatform.googleapis.com',
  };

  // Instantiates a client
  const {PipelineServiceClient} = aiplatform.v1;
  const pipelineServiceClient = new PipelineServiceClient(clientOptions);

  async function createTrainingPipelineImageClassification() {
    // Configure the parent resource
    const parent = `projects/${project}/locations/${location}`;

    // Values should match the input expected by your model.
    const trainingTaskInputsMessage =
      new definition.AutoMlImageClassificationInputs({
        multiLabel: true,
        modelType: ModelType.CLOUD,
        budgetMilliNodeHours: 8000,
        disableEarlyStopping: false,
      });

    const trainingTaskInputs = trainingTaskInputsMessage.toValue();

    const trainingTaskDefinition =
      'gs://google-cloud-aiplatform/schema/trainingjob/definition/automl_image_classification_1.0.0.yaml';

    const modelToUpload = {displayName: modelDisplayName};
    const inputDataConfig = {datasetId};
    const trainingPipeline = {
      displayName: trainingPipelineDisplayName,
      trainingTaskDefinition,
      trainingTaskInputs,
      inputDataConfig,
      modelToUpload,
    };
    const request = {parent, trainingPipeline};

    // Create training pipeline request
    const [response] =
      await pipelineServiceClient.createTrainingPipeline(request);

    console.log('Create training pipeline image classification response');
    console.log(`Name : ${response.name}`);
    console.log('Raw response:');
    console.log(JSON.stringify(response, null, 2));
  }

  createTrainingPipelineImageClassification();
  // [END aiplatform_create_training_pipeline_image_classification_sample]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));

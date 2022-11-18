/*
 * Copyright 2021 Google LLC
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

async function main(trainingPipelineId, project, location = 'us-central1') {
  // [START aiplatform_get_training_pipeline_sample]
  /**
   * TODO(developer): Uncomment these variables before running the sample.\
   * (Not necessary if passing values as arguments)
   */

  // const trainingPipelineId = 'YOUR_MODEL_ID';
  // const project = 'YOUR_PROJECT_ID';
  // const location = 'YOUR_PROJECT_LOCATION';

  // Imports the Google Cloud Model Service Client library
  const {PipelineServiceClient} = require('@google-cloud/aiplatform');

  // Specifies the location of the api endpoint
  const clientOptions = {
    apiEndpoint: 'us-central1-aiplatform.googleapis.com',
  };

  // Instantiates a client
  const pipelineServiceClient = new PipelineServiceClient(clientOptions);

  async function getTrainingPipeline() {
    // Configure the parent resource
    const name = pipelineServiceClient.trainingPipelinePath(
      project,
      location,
      trainingPipelineId
    );
    const request = {
      name,
    };
    // Get and print out a list of all the endpoints for this resource
    const [response] = await pipelineServiceClient.getTrainingPipeline(request);

    console.log('Get training pipeline response');
    console.log(`\tTraining pipeline name: ${response.displayName}`);
    console.log(`\tTraining pipeline state: ${response.state}`);
  }
  getTrainingPipeline();
  // [END aiplatform_get_training_pipeline_sample]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));

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

function main(
  displayName,
  containerImageUri,
  project,
  location = 'us-central1'
) {
  // [START aiplatform_create_hyperparameter_tuning_job_sample]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   * (Not necessary if passing values as arguments)
   */
  /*
  const displayName = 'YOUR HYPERPARAMETER TUNING JOB;
  const containerImageUri = 'TUNING JOB CONTAINER URI;
  const project = 'YOUR PROJECT ID';
  const location = 'us-central1';
    */
  // Imports the Google Cloud Pipeline Service Client library
  const {JobServiceClient} = require('@google-cloud/aiplatform');

  // Specifies the location of the api endpoint
  const clientOptions = {
    apiEndpoint: 'us-central1-aiplatform.googleapis.com',
  };

  // Instantiates a client
  const jobServiceClient = new JobServiceClient(clientOptions);

  async function createHyperParameterTuningJob() {
    // Configure the parent resource
    const parent = `projects/${project}/locations/${location}`;

    // Create the hyperparameter tuning job configuration
    const hyperparameterTuningJob = {
      displayName,
      maxTrialCount: 2,
      parallelTrialCount: 1,
      maxFailedTrialCount: 1,
      studySpec: {
        metrics: [
          {
            metricId: 'accuracy',
            goal: 'MAXIMIZE',
          },
        ],
        parameters: [
          {
            parameterId: 'lr',
            doubleValueSpec: {
              minValue: 0.001,
              maxValue: 0.1,
            },
          },
        ],
      },
      trialJobSpec: {
        workerPoolSpecs: [
          {
            machineSpec: {
              machineType: 'n1-standard-4',
              acceleratorType: 'NVIDIA_TESLA_T4',
              acceleratorCount: 1,
            },
            replicaCount: 1,
            containerSpec: {
              imageUri: containerImageUri,
              command: [],
              args: [],
            },
          },
        ],
      },
    };

    const [response] = await jobServiceClient.createHyperparameterTuningJob({
      parent,
      hyperparameterTuningJob,
    });

    console.log('Create hyperparameter tuning job response:');
    console.log(`\tDisplay name: ${response.displayName}`);
    console.log(`\tTuning job resource name: ${response.name}`);
    console.log(`\tJob status: ${response.state}`);
  }

  createHyperParameterTuningJob();
  // [END aiplatform_create_hyperparameter_tuning_job_sample]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));

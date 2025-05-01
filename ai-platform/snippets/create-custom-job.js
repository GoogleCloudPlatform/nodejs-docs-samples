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
  customJobDisplayName,
  containerImageUri,
  project,
  location = 'us-central1'
) {
  // [START aiplatform_create_custom_job_sample]
  /**
   * TODO(developer): Uncomment these variables before running the sample.\
   * (Not necessary if passing values as arguments)
   */

  // const customJobDisplayName = 'YOUR_CUSTOM_JOB_DISPLAY_NAME';
  // const containerImageUri = 'YOUR_CONTAINER_IMAGE_URI';
  // const project = 'YOUR_PROJECT_ID';
  // const location = 'YOUR_PROJECT_LOCATION';

  // Imports the Google Cloud Job Service Client library
  const {JobServiceClient} = require('@google-cloud/aiplatform');

  // Specifies the location of the api endpoint
  const clientOptions = {
    apiEndpoint: 'us-central1-aiplatform.googleapis.com',
  };

  // Instantiates a client
  const jobServiceClient = new JobServiceClient(clientOptions);

  async function createCustomJob() {
    // Configure the parent resource
    const parent = `projects/${project}/locations/${location}`;
    const customJob = {
      displayName: customJobDisplayName,
      jobSpec: {
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
    const request = {parent, customJob};

    // Create custom job request
    const [response] = await jobServiceClient.createCustomJob(request);

    console.log('Create custom job response:\n', JSON.stringify(response));
  }
  createCustomJob();
  // [END aiplatform_create_custom_job_sample]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));

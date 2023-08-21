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

async function main(tuningJobId, project, location = 'us-central1') {
  // [START aiplatform_get_hyperparameter_tuning_job_sample]
  /**
   * TODO(developer): Uncomment these variables before running the sample.\
   * (Not necessary if passing values as arguments)
   */

  // const tuningJobId = 'YOUR_TUNING_JOB_ID';
  // const project = 'YOUR_PROJECT_ID';
  // const location = 'YOUR_PROJECT_LOCATION';

  // Imports the Google Cloud Model Service Client library
  const {JobServiceClient} = require('@google-cloud/aiplatform');

  // Specifies the location of the api endpoint
  const clientOptions = {
    apiEndpoint: 'us-central1-aiplatform.googleapis.com',
  };

  // Instantiates a client
  const jobServiceClient = new JobServiceClient(clientOptions);

  async function getHyperparameterTuningJob() {
    // Configure the parent resource
    const name = jobServiceClient.hyperparameterTuningJobPath(
      project,
      location,
      tuningJobId
    );
    const request = {
      name,
    };
    // Get and print out a list of all the endpoints for this resource
    const [response] =
      await jobServiceClient.getHyperparameterTuningJob(request);

    console.log('Get hyperparameter tuning job response');
    console.log(`\tDisplay name: ${response.displayName}`);
    console.log(`\tTuning job resource name: ${response.name}`);
    console.log(`\tJob status: ${response.state}`);
  }
  getHyperparameterTuningJob();
  // [END aiplatform_get_hyperparameter_tuning_job_sample]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));

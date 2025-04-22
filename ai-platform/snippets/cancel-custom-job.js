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

async function main(customJobId, project, location = 'us-central1') {
  // [START aiplatform_cancel_custom_job_sample]
  /**
   * TODO(developer): Uncomment these variables before running the sample.\
   */

  // const customJobId = 'YOUR_CUSTOM_JOB_ID';
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

  async function cancelCustomJob() {
    // Configure the name resource
    const name = jobServiceClient.customJobPath(project, location, customJobId);
    const request = {
      name,
    };

    // Cancel custom job request
    const [response] = await jobServiceClient.cancelCustomJob(request);

    console.log('Cancel custom job response:\n', response);
  }
  cancelCustomJob();
  // [END aiplatform_cancel_custom_job_sample]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));

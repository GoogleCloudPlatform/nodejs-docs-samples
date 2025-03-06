// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// sample-metadata:
//  title: Create an inspection job
//  description: Create an inspection job
//  usage: node createJob.js my-project bucket-url
function main(projectId, cloudFileUrl) {
  // [START dlp_create_job]
  // Imports the Google Cloud Data Loss Prevention library
  import DLP from '@google-cloud/dlp';

  // Initialize google DLP Client
  const dlp = new DLP.DlpServiceClient();

  async function jobsCreate() {
    // Construct cloud storage configuration
    const cloudStorageConfig = {
      cloudStorageOptions: {
        fileSet: {
          url: cloudFileUrl,
        },
      },
      timespanConfig: {
        enableAutoPopulationOfTimespanConfig: true,
      },
    };

    // Construct inspect job configuration
    const inspectJob = {
      storageConfig: cloudStorageConfig,
    };

    // Construct inspect configuration
    const inspectConfig = {
      infoTypes: [
        {name: 'EMAIL_ADDRESS'},
        {name: 'PERSON_NAME'},
        {name: 'LOCATION'},
        {name: 'PHONE_NUMBER'},
      ],
      includeQuote: true,
      minLikelihood: DLP.protos.google.privacy.dlp.v2.Likelihood.LIKELY,
      excludeInfoTypes: false,
    };

    // Combine configurations into a request for the service.
    const request = {
      parent: `projects/${projectId}/locations/global`,
      inspectJob: inspectJob,
      inspectConfig: inspectConfig,
    };

    // Send the request and receive response from the service
    const [response] = await dlp.createDlpJob(request);
    // Print the results
    console.log(`Job created successfully: ${response.name}`);
  }

  jobsCreate();
  // [END dlp_create_job]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));

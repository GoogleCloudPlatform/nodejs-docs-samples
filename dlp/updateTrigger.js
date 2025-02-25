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
//  title: Update job trigger with suitable configuration and mask.
//  description: Uses the Data Loss Prevention API to update job trigger with suitable configuration and mask.
//  usage: node updateTrigger.js projectId, jobTriggerName
function main(projectId, jobTriggerName) {
  // [START dlp_update_trigger]
  // Imports the Google Cloud Data Loss Prevention library
  import DLP from '@google-cloud/dlp';

  // Instantiates a client
  const dlpClient = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const projectId = 'my-project';

  // The job trigger ID to run the API call under
  // const jobTriggerName = 'your-job-trigger-name';

  async function updateTrigger() {
    // Construct inspect configuration to match PERSON_NAME infotype
    const inspectConfig = {
      infoTypes: [{name: 'PERSON_NAME'}],
      minLikelihood: 'LIKELY',
    };

    // Configure the job trigger we want to update.
    const jobTrigger = {inspectJob: {inspectConfig}};

    const updateMask = {
      paths: [
        'inspect_job.inspect_config.info_types',
        'inspect_job.inspect_config.min_likelihood',
      ],
    };

    // Combine configurations into a request for the service.
    const request = {
      name: `projects/${projectId}/jobTriggers/${jobTriggerName}`,
      jobTrigger,
      updateMask,
    };

    // Send the request and receive response from the service
    const [updatedJobTrigger] = await dlpClient.updateJobTrigger(request);

    // Print the results
    console.log(`Updated Trigger: ${JSON.stringify(updatedJobTrigger)}`);
  }
  updateTrigger(projectId, jobTriggerName);
  // [END dlp_update_trigger]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));

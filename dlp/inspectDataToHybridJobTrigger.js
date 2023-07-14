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
//  title: Send data to the hybrid job trigger.
//  description: Demonstrate an example of a hybridInspect request sent to Cloud DLP for processing by a hybrid job trigger.
//  usage: node inspectDataToHybridJobTrigger.js my-project string jobTriggerId

function main(projectId, string, jobTriggerId) {
  // [START dlp_inspect_send_data_to_hybrid_job_trigger]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlpClient = new DLP.DlpServiceClient();

  // The project ID to run the API call under.
  // const projectId = "your-project-id";

  // The string to de-identify
  // const string = 'My email is test@example.org';

  // Job Trigger ID
  // const jobTriggerId = 'your-job-trigger-id';

  async function inspectDataToHybridJobTrigger() {
    // Contains metadata to associate with the content.
    const container = {
      full_path: '10.0.0.2:logs1:app1',
      relative_path: 'app1',
      root_path: '10.0.0.2:logs1',
      type: 'logging_sys',
      version: '1.2',
    };

    const labels = {env: 'prod', 'appointment-bookings-comments': ''};

    // Build the hybrid content item.
    const hybridContentItem = {
      item: {value: string},
      findingDetails: {
        containerDetails: container,
        labels,
      },
    };

    // Activate the job trigger.
    try {
      await dlpClient.activateJobTrigger({
        name: `projects/${projectId}/jobTriggers/${jobTriggerId}`,
      });
    } catch (err) {
      // Ignore error related to job trigger already active
      if (err.code !== 3) {
        console.log(err.message);
        return;
      }
    }

    // Build the hybrid inspect request.
    const request = {
      name: `projects/${projectId}/jobTriggers/${jobTriggerId}`,
      hybridItem: hybridContentItem,
    };

    // Send the hybrid inspect request.
    const [response] = await dlpClient.hybridInspectJobTrigger(request);

    // Print the results
    console.log(response);
  }
  inspectDataToHybridJobTrigger();
  // [END dlp_inspect_send_data_to_hybrid_job_trigger]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));

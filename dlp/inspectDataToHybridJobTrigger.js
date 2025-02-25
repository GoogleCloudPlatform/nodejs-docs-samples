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

async function main(projectId, string, jobTriggerId) {
  // [START dlp_inspect_send_data_to_hybrid_job_trigger]
  // Imports the Google Cloud Data Loss Prevention library
  import DLP from '@google-cloud/dlp';

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
    let jobName;
    const fullTriggerName = `projects/${projectId}/jobTriggers/${jobTriggerId}`;
    // Activate the job trigger.
    try {
      const response = await dlpClient.activateJobTrigger({
        name: fullTriggerName,
      });
      jobName = response[0].name;
    } catch (err) {
      console.log(err);
      if (err.code === 3) {
        const response = await dlpClient.listDlpJobs({
          parent: fullTriggerName,
          filter: `trigger_name=${fullTriggerName}`,
        });
        jobName = response[0][0].name;
      }
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
    await dlpClient.hybridInspectJobTrigger(request);
    // Waiting for a maximum of 15 minutes for the job to get complete.
    let job;
    let numOfAttempts = 30;
    while (numOfAttempts > 0) {
      // Fetch DLP Job status
      [job] = await dlpClient.getDlpJob({name: jobName});

      if (job.state === 'FAILED') {
        console.log('Job Failed, Please check the configuration.');
        return;
      }
      // Check if the job has completed.
      if (job.inspectDetails.result.processedBytes > 0) {
        break;
      }
      // Sleep for a short duration before checking the job status again.
      await new Promise(resolve => {
        setTimeout(() => resolve(), 30000);
      });
      numOfAttempts -= 1;
    }
    // Finish the job once the inspection is complete.
    await dlpClient.finishDlpJob({name: jobName});

    // Print out the results.
    const infoTypeStats = job.inspectDetails.result.infoTypeStats;
    if (infoTypeStats.length > 0) {
      infoTypeStats.forEach(infoTypeStat => {
        console.log(
          `  Found ${infoTypeStat.count} instance(s) of infoType ${infoTypeStat.infoType.name}.`
        );
      });
    } else {
      console.log('No findings.');
    }
  }
  await inspectDataToHybridJobTrigger();
  // [END dlp_inspect_send_data_to_hybrid_job_trigger]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

// TODO(developer): Please uncomment below line before running sample
// main(...process.argv.slice(2));

module.exports = main;

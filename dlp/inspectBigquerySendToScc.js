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
//  title: Create a Dlp Job with Big Query Data and send its findings to Scc
//  description: Uses the Data Loss Prevention API to Create a Dlp Job with Big Query Data and send its findings to Scc
//  usage: node inspectBigquerySendToScc.js my-project dataProjectId datasetId tableId
async function main(projectId, dataProjectId, datasetId, tableId) {
  // [START dlp_inspect_bigquery_send_to_scc]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under.
  // const projectId = "your-project-id";

  // The project ID the table is stored under
  // This may or (for public datasets) may not equal the calling project ID
  // const dataProjectId = 'my-project';

  // The ID of the dataset to inspect, e.g. 'my_dataset'
  // const datasetId = 'my_dataset';

  // The ID of the table to inspect, e.g. 'my_table'
  // const tableId = 'my_table';

  async function inspectBigQuerySendToScc() {
    // Specify the storage configuration object with big query table.
    const storageItem = {
      bigQueryOptions: {
        tableReference: {
          projectId: dataProjectId,
          datasetId: datasetId,
          tableId: tableId,
        },
      },
    };

    // Specify the type of info the inspection will look for.
    const infoTypes = [
      {name: 'EMAIL_ADDRESS'},
      {name: 'PERSON_NAME'},
      {name: 'LOCATION'},
      {name: 'PHONE_NUMBER'},
    ];

    // Construct inspect configuration.
    const inspectConfig = {
      infoTypes: infoTypes,
      includeQuote: true,
      minLikelihood: DLP.protos.google.privacy.dlp.v2.Likelihood.UNLIKELY,
      limits: {
        maxFindingsPerItem: 100,
      },
    };

    // Specify the action that is triggered when the job completes.
    const action = {
      publishSummaryToCscc: {
        enable: true,
      },
    };

    // Configure the inspection job we want the service to perform.
    const inspectJobConfig = {
      inspectConfig: inspectConfig,
      storageConfig: storageItem,
      actions: [action],
    };

    // Construct the job creation request to be sent by the client.
    const request = {
      parent: `projects/${projectId}/locations/global`,
      inspectJob: inspectJobConfig,
    };

    // Send the job creation request and process the response.
    const [jobsResponse] = await dlp.createDlpJob(request);
    const jobName = jobsResponse.name;

    // Waiting for a maximum of 15 minutes for the job to get complete.
    let job;
    let numOfAttempts = 30;
    while (numOfAttempts > 0) {
      // Fetch DLP Job status
      [job] = await dlp.getDlpJob({name: jobName});

      // Check if the job has completed.
      if (job.state === 'DONE') {
        break;
      }
      if (job.state === 'FAILED') {
        console.log('Job Failed, Please check the configuration.');
        return;
      }
      // Sleep for a short duration before checking the job status again.
      await new Promise(resolve => {
        setTimeout(() => resolve(), 30000);
      });
      numOfAttempts -= 1;
    }

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
  await inspectBigQuerySendToScc();
  // [END dlp_inspect_bigquery_send_to_scc]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

// TODO(developer): Please uncomment below line before running sample
// main(...process.argv.slice(2));

export default main;

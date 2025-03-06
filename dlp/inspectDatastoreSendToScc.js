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
//  title: Create a Dlp Job with Datastore Data and send its findings to Scc
//  description: Uses the Data Loss Prevention API to Create a Dlp Job with Datastore Data and send its findings to Scc
//  usage: node inspectDatastoreSendToScc.js my-project datastoreNamespace, datastoreKind
async function main(projectId, datastoreNamespace, datastoreKind) {
  // [START dlp_inspect_datastore_send_to_scc]
  // Imports the Google Cloud Data Loss Prevention library
  import DLP from '@google-cloud/dlp';

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under.
  // const projectId = "your-project-id";

  // Datastore namespace
  // const datastoreNamespace = 'datastore-namespace';

  // Datastore kind
  // const datastoreKind = 'datastore-kind';

  async function inspectDatastoreSendToScc() {
    // Specify the storage configuration object with datastore.
    const storageConfig = {
      datastoreOptions: {
        kind: {
          name: datastoreKind,
        },
        partitionId: {
          projectId: projectId,
          namespaceId: datastoreNamespace,
        },
      },
    };

    // Construct the info types to look for in the datastore.
    const infoTypes = [
      {name: 'EMAIL_ADDRESS'},
      {name: 'PERSON_NAME'},
      {name: 'LOCATION'},
      {name: 'PHONE_NUMBER'},
    ];

    // Construct the inspection configuration.
    const inspectConfig = {
      infoTypes: infoTypes,
      minLikelihood: DLP.protos.google.privacy.dlp.v2.Likelihood.UNLIKELY,
      limits: {
        maxFindingsPerItem: 100,
      },
      includeQuote: true,
    };

    // Specify the action that is triggered when the job completes
    const action = {
      publishSummaryToCscc: {enable: true},
    };

    // Configure the inspection job we want the service to perform.
    const inspectJobConfig = {
      inspectConfig: inspectConfig,
      storageConfig: storageConfig,
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
          `Found ${infoTypeStat.count} instance(s) of infoType ${infoTypeStat.infoType.name}.`
        );
      });
    } else {
      console.log('No findings.');
    }
  }
  await inspectDatastoreSendToScc();
  // [END dlp_inspect_datastore_send_to_scc]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

// TODO(developer): Please uncomment below line before running sample
// main(...process.argv.slice(2));

module.exports = main;

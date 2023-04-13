// Copyright 2020 Google LLC
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
//  title: Job Triggers
//  description: Create a Data Loss Prevention API job trigger.
//  usage: node createTrigger.js my-project triggerId displayName description bucketName autoPopulateTimespan scanPeriod infoTypes minLikelihood maxFindings

function main(
  projectId,
  triggerId,
  displayName,
  description,
  bucketName,
  autoPopulateTimespan,
  scanPeriod,
  infoTypes,
  minLikelihood,
  maxFindings
) {
  infoTypes = transformCLI(infoTypes);
  // [START dlp_create_trigger]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const projectId = 'my-project';

  // (Optional) The name of the trigger to be created.
  // const triggerId = 'my-trigger';

  // (Optional) A display name for the trigger to be created
  // const displayName = 'My Trigger';

  // (Optional) A description for the trigger to be created
  // const description = "This is a sample trigger.";

  // The name of the bucket to scan.
  // const bucketName = 'YOUR-BUCKET';

  // Limit scan to new content only.
  // const autoPopulateTimespan = true;

  // How often to wait between scans, in days (minimum = 1 day)
  // const scanPeriod = 1;

  // The infoTypes of information to match
  // const infoTypes = [{ name: 'PHONE_NUMBER' }, { name: 'EMAIL_ADDRESS' }, { name: 'CREDIT_CARD_NUMBER' }];

  // The minimum likelihood required before returning a match
  // const minLikelihood = 'LIKELIHOOD_UNSPECIFIED';

  // The maximum number of findings to report per request (0 = server maximum)
  // const maxFindings = 0;

  async function createTrigger() {
    // Get reference to the bucket to be inspected
    const storageItem = {
      cloudStorageOptions: {
        fileSet: {url: `gs://${bucketName}/*`},
      },
      timeSpanConfig: {
        enableAutoPopulationOfTimespanConfig: autoPopulateTimespan,
      },
    };

    // Construct job to be triggered
    const job = {
      inspectConfig: {
        infoTypes: infoTypes,
        minLikelihood: minLikelihood,
        limits: {
          maxFindingsPerRequest: maxFindings,
        },
      },
      storageConfig: storageItem,
    };

    // Construct trigger creation request
    const request = {
      parent: `projects/${projectId}/locations/global`,
      jobTrigger: {
        inspectJob: job,
        displayName: displayName,
        description: description,
        triggers: [
          {
            schedule: {
              recurrencePeriodDuration: {
                seconds: scanPeriod * 60 * 60 * 24, // Trigger the scan daily
              },
            },
          },
        ],
        status: 'HEALTHY',
      },
      triggerId: triggerId,
    };

    // Run trigger creation request
    const [trigger] = await dlp.createJobTrigger(request);
    console.log(`Successfully created trigger ${trigger.name}.`);
  }

  createTrigger();
  // [END dlp_create_trigger]
}

main(...process.argv.slice(2));
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

function transformCLI(infoTypes) {
  infoTypes = infoTypes
    ? infoTypes.split(',').map(type => {
        return {name: type};
      })
    : undefined;
  return infoTypes;
}

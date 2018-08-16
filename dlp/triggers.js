/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

function createTrigger(
  callingProjectId,
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
  // [START dlp_create_trigger]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const callingProjectId = process.env.GCLOUD_PROJECT;

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
    parent: dlp.projectPath(callingProjectId),
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
  dlp
    .createJobTrigger(request)
    .then(response => {
      const trigger = response[0];
      console.log(`Successfully created trigger ${trigger.name}.`);
    })
    .catch(err => {
      console.log(`Error in createTrigger: ${err.message || err}`);
    });
  // [END dlp_create_trigger]
}

function listTriggers(callingProjectId) {
  // [START dlp_list_triggers]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const callingProjectId = process.env.GCLOUD_PROJECT;

  // Construct trigger listing request
  const request = {
    parent: dlp.projectPath(callingProjectId),
  };

  // Helper function to pretty-print dates
  const formatDate = date => {
    const msSinceEpoch = parseInt(date.seconds, 10) * 1000;
    return new Date(msSinceEpoch).toLocaleString('en-US');
  };

  // Run trigger listing request
  dlp
    .listJobTriggers(request)
    .then(response => {
      const triggers = response[0];
      triggers.forEach(trigger => {
        // Log trigger details
        console.log(`Trigger ${trigger.name}:`);
        console.log(`  Created: ${formatDate(trigger.createTime)}`);
        console.log(`  Updated: ${formatDate(trigger.updateTime)}`);
        if (trigger.displayName) {
          console.log(`  Display Name: ${trigger.displayName}`);
        }
        if (trigger.description) {
          console.log(`  Description: ${trigger.description}`);
        }
        console.log(`  Status: ${trigger.status}`);
        console.log(`  Error count: ${trigger.errors.length}`);
      });
    })
    .catch(err => {
      console.log(`Error in listTriggers: ${err.message || err}`);
    });
  // [END dlp_list_trigger]
}

function deleteTrigger(triggerId) {
  // [START dlp_delete_trigger]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The name of the trigger to be deleted
  // Parent project ID is automatically extracted from this parameter
  // const triggerId = 'projects/my-project/triggers/my-trigger';

  // Construct trigger deletion request
  const request = {
    name: triggerId,
  };

  // Run trigger deletion request
  dlp
    .deleteJobTrigger(request)
    .then(() => {
      console.log(`Successfully deleted trigger ${triggerId}.`);
    })
    .catch(err => {
      console.log(`Error in deleteTrigger: ${err.message || err}`);
    });
  // [END dlp_delete_trigger]
}

const cli = require(`yargs`) // eslint-disable-line
  .demand(1)
  .command(
    `create <bucketName> <scanPeriod>`,
    `Create a Data Loss Prevention API job trigger.`,
    {
      infoTypes: {
        alias: 't',
        default: ['PHONE_NUMBER', 'EMAIL_ADDRESS', 'CREDIT_CARD_NUMBER'],
        type: 'array',
        global: true,
        coerce: infoTypes =>
          infoTypes.map(type => {
            return {name: type};
          }),
      },
      triggerId: {
        alias: 'n',
        default: '',
        type: 'string',
      },
      displayName: {
        alias: 'd',
        default: '',
        type: 'string',
      },
      description: {
        alias: 's',
        default: '',
        type: 'string',
      },
      autoPopulateTimespan: {
        default: false,
        type: 'boolean',
      },
      minLikelihood: {
        alias: 'm',
        default: 'LIKELIHOOD_UNSPECIFIED',
        type: 'string',
        choices: [
          'LIKELIHOOD_UNSPECIFIED',
          'VERY_UNLIKELY',
          'UNLIKELY',
          'POSSIBLE',
          'LIKELY',
          'VERY_LIKELY',
        ],
        global: true,
      },
      maxFindings: {
        alias: 'f',
        default: 0,
        type: 'number',
        global: true,
      },
    },
    opts =>
      createTrigger(
        opts.callingProjectId,
        opts.triggerId,
        opts.displayName,
        opts.description,
        opts.bucketName,
        opts.autoPopulateTimespan,
        opts.scanPeriod,
        opts.infoTypes,
        opts.minLikelihood,
        opts.maxFindings
      )
  )
  .command(`list`, `List Data Loss Prevention API job triggers.`, {}, opts =>
    listTriggers(opts.callingProjectId)
  )
  .command(
    `delete <triggerId>`,
    `Delete a Data Loss Prevention API job trigger.`,
    {},
    opts => deleteTrigger(opts.triggerId)
  )
  .option('c', {
    type: 'string',
    alias: 'callingProjectId',
    default: process.env.GCLOUD_PROJECT || '',
  })
  .example(`node $0 create my-bucket 1`)
  .example(`node $0 list`)
  .example(`node $0 delete projects/my-project/jobTriggers/my-trigger`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/dlp/docs.`);

if (module === require.main) {
  cli.help().strict().argv; // eslint-disable-line
}

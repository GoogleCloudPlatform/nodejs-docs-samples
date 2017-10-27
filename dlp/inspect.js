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

const fs = require('fs');
const mime = require('mime');
const Buffer = require('safe-buffer').Buffer;

function inspectString(
  string,
  minLikelihood,
  maxFindings,
  infoTypes,
  includeQuote
) {
  // [START inspect_string]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The string to inspect
  // const string = 'My name is Gary and my email is gary@example.com';

  // The minimum likelihood required before returning a match
  // const minLikelihood = 'LIKELIHOOD_UNSPECIFIED';

  // The maximum number of findings to report (0 = server maximum)
  // const maxFindings = 0;

  // The infoTypes of information to match
  // const infoTypes = [{ name: 'PHONE_NUMBER' }, { name: 'EMAIL_ADDRESS' }, { name: 'CREDIT_CARD_NUMBER' }];

  // Whether to include the matching string
  // const includeQuote = true;

  // Construct items to inspect
  const items = [{type: 'text/plain', value: string}];

  // Construct request
  const request = {
    inspectConfig: {
      infoTypes: infoTypes,
      minLikelihood: minLikelihood,
      maxFindings: maxFindings,
      includeQuote: includeQuote,
    },
    items: items,
  };

  // Run request
  dlp
    .inspectContent(request)
    .then(response => {
      const findings = response[0].results[0].findings;
      if (findings.length > 0) {
        console.log(`Findings:`);
        findings.forEach(finding => {
          if (includeQuote) {
            console.log(`\tQuote: ${finding.quote}`);
          }
          console.log(`\tInfo type: ${finding.infoType.name}`);
          console.log(`\tLikelihood: ${finding.likelihood}`);
        });
      } else {
        console.log(`No findings.`);
      }
    })
    .catch(err => {
      console.log(`Error in inspectString: ${err.message || err}`);
    });
  // [END inspect_string]
}

function inspectFile(
  filepath,
  minLikelihood,
  maxFindings,
  infoTypes,
  includeQuote
) {
  // [START inspect_file]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The path to a local file to inspect. Can be a text, JPG, or PNG file.
  // const fileName = 'path/to/image.png';

  // The minimum likelihood required before returning a match
  // const minLikelihood = 'LIKELIHOOD_UNSPECIFIED';

  // The maximum number of findings to report (0 = server maximum)
  // const maxFindings = 0;

  // The infoTypes of information to match
  // const infoTypes = [{ name: 'PHONE_NUMBER' }, { name: 'EMAIL_ADDRESS' }, { name: 'CREDIT_CARD_NUMBER' }];

  // Whether to include the matching string
  // const includeQuote = true;

  // Construct file data to inspect
  const fileItems = [
    {
      type: mime.lookup(filepath) || 'application/octet-stream',
      data: Buffer.from(fs.readFileSync(filepath)).toString('base64'),
    },
  ];

  // Construct request
  const request = {
    inspectConfig: {
      infoTypes: infoTypes,
      minLikelihood: minLikelihood,
      maxFindings: maxFindings,
      includeQuote: includeQuote,
    },
    items: fileItems,
  };

  // Run request
  dlp
    .inspectContent(request)
    .then(response => {
      const findings = response[0].results[0].findings;
      if (findings.length > 0) {
        console.log(`Findings:`);
        findings.forEach(finding => {
          if (includeQuote) {
            console.log(`\tQuote: ${finding.quote}`);
          }
          console.log(`\tInfo type: ${finding.infoType.name}`);
          console.log(`\tLikelihood: ${finding.likelihood}`);
        });
      } else {
        console.log(`No findings.`);
      }
    })
    .catch(err => {
      console.log(`Error in inspectFile: ${err.message || err}`);
    });
  // [END inspect_file]
}

function promiseInspectGCSFile(
  bucketName,
  fileName,
  minLikelihood,
  maxFindings,
  infoTypes
) {
  // [START inspect_gcs_file_promise]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The name of the bucket where the file resides.
  // const bucketName = 'YOUR-BUCKET';

  // The path to the file within the bucket to inspect.
  // Can contain wildcards, e.g. "my-image.*"
  // const fileName = 'my-image.png';

  // The minimum likelihood required before returning a match
  // const minLikelihood = 'LIKELIHOOD_UNSPECIFIED';

  // The maximum number of findings to report (0 = server maximum)
  // const maxFindings = 0;

  // The infoTypes of information to match
  // const infoTypes = [{ name: 'PHONE_NUMBER' }, { name: 'EMAIL_ADDRESS' }, { name: 'CREDIT_CARD_NUMBER' }];

  // Get reference to the file to be inspected
  const storageItems = {
    cloudStorageOptions: {
      fileSet: {url: `gs://${bucketName}/${fileName}`},
    },
  };

  // Construct REST request body for creating an inspect job
  const request = {
    inspectConfig: {
      infoTypes: infoTypes,
      minLikelihood: minLikelihood,
      maxFindings: maxFindings,
    },
    storageConfig: storageItems,
  };

  // Create a GCS File inspection job and wait for it to complete (using promises)
  dlp
    .createInspectOperation(request)
    .then(createJobResponse => {
      const operation = createJobResponse[0];

      // Start polling for job completion
      return operation.promise();
    })
    .then(completeJobResponse => {
      // When job is complete, get its results
      const jobName = completeJobResponse[0].name;
      return dlp.listInspectFindings({
        name: jobName,
      });
    })
    .then(results => {
      const findings = results[0].result.findings;
      if (findings.length > 0) {
        console.log(`Findings:`);
        findings.forEach(finding => {
          console.log(`\tInfo type: ${finding.infoType.name}`);
          console.log(`\tLikelihood: ${finding.likelihood}`);
        });
      } else {
        console.log(`No findings.`);
      }
    })
    .catch(err => {
      console.log(`Error in promiseInspectGCSFile: ${err.message || err}`);
    });
  // [END inspect_gcs_file_promise]
}

function eventInspectGCSFile(
  bucketName,
  fileName,
  minLikelihood,
  maxFindings,
  infoTypes
) {
  // [START inspect_gcs_file_event]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The name of the bucket where the file resides.
  // const bucketName = 'YOUR-BUCKET';

  // The path to the file within the bucket to inspect.
  // Can contain wildcards, e.g. "my-image.*"
  // const fileName = 'my-image.png';

  // The minimum likelihood required before returning a match
  // const minLikelihood = 'LIKELIHOOD_UNSPECIFIED';

  // The maximum number of findings to report (0 = server maximum)
  // const maxFindings = 0;

  // The infoTypes of information to match
  // const infoTypes = [{ name: 'PHONE_NUMBER' }, { name: 'EMAIL_ADDRESS' }, { name: 'CREDIT_CARD_NUMBER' }];

  // Get reference to the file to be inspected
  const storageItems = {
    cloudStorageOptions: {
      fileSet: {url: `gs://${bucketName}/${fileName}`},
    },
  };

  // Construct REST request body for creating an inspect job
  const request = {
    inspectConfig: {
      infoTypes: infoTypes,
      minLikelihood: minLikelihood,
      maxFindings: maxFindings,
    },
    storageConfig: storageItems,
  };

  // Create a GCS File inspection job, and handle its completion (using event handlers)
  // Promises are used (only) to avoid nested callbacks
  dlp
    .createInspectOperation(request)
    .then(createJobResponse => {
      const operation = createJobResponse[0];
      return new Promise((resolve, reject) => {
        operation.on('complete', completeJobResponse => {
          return resolve(completeJobResponse);
        });

        // Handle changes in job metadata (e.g. progress updates)
        operation.on('progress', metadata => {
          console.log(
            `Processed ${metadata.processedBytes} of approximately ${metadata.totalEstimatedBytes} bytes.`
          );
        });

        operation.on('error', err => {
          return reject(err);
        });
      });
    })
    .then(completeJobResponse => {
      const jobName = completeJobResponse.name;
      return dlp.listInspectFindings({
        name: jobName,
      });
    })
    .then(results => {
      const findings = results[0].result.findings;
      if (findings.length > 0) {
        console.log(`Findings:`);
        findings.forEach(finding => {
          console.log(`\tInfo type: ${finding.infoType.name}`);
          console.log(`\tLikelihood: ${finding.likelihood}`);
        });
      } else {
        console.log(`No findings.`);
      }
    })
    .catch(err => {
      console.log(`Error in eventInspectGCSFile: ${err.message || err}`);
    });
  // [END inspect_gcs_file_event]
}

function inspectDatastore(
  projectId,
  namespaceId,
  kind,
  minLikelihood,
  maxFindings,
  infoTypes
  // includeQuote
) {
  // [START inspect_datastore]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // (Optional) The project ID containing the target Datastore
  // const projectId = process.env.GCLOUD_PROJECT;

  // (Optional) The ID namespace of the Datastore document to inspect.
  // To ignore Datastore namespaces, set this to an empty string ('')
  // const namespaceId = '';

  // The kind of the Datastore entity to inspect.
  // const kind = 'Person';

  // The minimum likelihood required before returning a match
  // const minLikelihood = 'LIKELIHOOD_UNSPECIFIED';

  // The maximum number of findings to report (0 = server maximum)
  // const maxFindings = 0;

  // The infoTypes of information to match
  // const infoTypes = [{ name: 'PHONE_NUMBER' }, { name: 'EMAIL_ADDRESS' }, { name: 'CREDIT_CARD_NUMBER' }];

  // Construct items to be inspected
  const storageItems = {
    datastoreOptions: {
      partitionId: {
        projectId: projectId,
        namespaceId: namespaceId,
      },
      kind: {
        name: kind,
      },
    },
  };

  // Construct request for creating an inspect job
  const request = {
    inspectConfig: {
      infoTypes: infoTypes,
      minLikelihood: minLikelihood,
      maxFindings: maxFindings,
    },
    storageConfig: storageItems,
  };

  // Run inspect-job creation request
  dlp
    .createInspectOperation(request)
    .then(createJobResponse => {
      const operation = createJobResponse[0];

      // Start polling for job completion
      return operation.promise();
    })
    .then(completeJobResponse => {
      // When job is complete, get its results
      const jobName = completeJobResponse[0].name;
      return dlp.listInspectFindings({
        name: jobName,
      });
    })
    .then(results => {
      const findings = results[0].result.findings;
      if (findings.length > 0) {
        console.log(`Findings:`);
        findings.forEach(finding => {
          console.log(`\tInfo type: ${finding.infoType.name}`);
          console.log(`\tLikelihood: ${finding.likelihood}`);
        });
      } else {
        console.log(`No findings.`);
      }
    })
    .catch(err => {
      console.log(`Error in inspectDatastore: ${err.message || err}`);
    });
  // [END inspect_datastore]
}

function inspectBigquery(
  projectId,
  datasetId,
  tableId,
  minLikelihood,
  maxFindings,
  infoTypes
  // includeQuote
) {
  // [START inspect_bigquery]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // (Optional) The project ID to run the API call under
  // const projectId = process.env.GCLOUD_PROJECT;

  // The ID of the dataset to inspect, e.g. 'my_dataset'
  // const datasetId = 'my_dataset';

  // The ID of the table to inspect, e.g. 'my_table'
  // const tableId = 'my_table';

  // The minimum likelihood required before returning a match
  // const minLikelihood = 'LIKELIHOOD_UNSPECIFIED';

  // The maximum number of findings to report (0 = server maximum)
  // const maxFindings = 0;

  // The infoTypes of information to match
  // const infoTypes = [{ name: 'PHONE_NUMBER' }, { name: 'EMAIL_ADDRESS' }, { name: 'CREDIT_CARD_NUMBER' }];

  // Construct items to be inspected
  const storageItems = {
    bigQueryOptions: {
      tableReference: {
        projectId: projectId,
        datasetId: datasetId,
        tableId: tableId,
      },
    },
  };

  // Construct request for creating an inspect job
  const request = {
    inspectConfig: {
      infoTypes: infoTypes,
      minLikelihood: minLikelihood,
      maxFindings: maxFindings,
    },
    storageConfig: storageItems,
  };

  // Run inspect-job creation request
  dlp
    .createInspectOperation(request)
    .then(createJobResponse => {
      const operation = createJobResponse[0];

      // Start polling for job completion
      return operation.promise();
    })
    .then(completeJobResponse => {
      // When job is complete, get its results
      const jobName = completeJobResponse[0].name;
      return dlp.listInspectFindings({
        name: jobName,
      });
    })
    .then(results => {
      const findings = results[0].result.findings;
      if (findings.length > 0) {
        console.log(`Findings:`);
        findings.forEach(finding => {
          console.log(`\tInfo type: ${finding.infoType.name}`);
          console.log(`\tLikelihood: ${finding.likelihood}`);
        });
      } else {
        console.log(`No findings.`);
      }
    })
    .catch(err => {
      console.log(`Error in inspectBigquery: ${err.message || err}`);
    });
  // [END inspect_bigquery]
}

const cli = require(`yargs`) // eslint-disable-line
  .demand(1)
  .command(
    `string <string>`,
    `Inspect a string using the Data Loss Prevention API.`,
    {},
    opts =>
      inspectString(
        opts.string,
        opts.minLikelihood,
        opts.maxFindings,
        opts.infoTypes,
        opts.includeQuote
      )
  )
  .command(
    `file <filepath>`,
    `Inspects a local text, PNG, or JPEG file using the Data Loss Prevention API.`,
    {},
    opts =>
      inspectFile(
        opts.filepath,
        opts.minLikelihood,
        opts.maxFindings,
        opts.infoTypes,
        opts.includeQuote
      )
  )
  .command(
    `gcsFilePromise <bucketName> <fileName>`,
    `Inspects a text file stored on Google Cloud Storage using the Data Loss Prevention API and the promise pattern.`,
    {},
    opts =>
      promiseInspectGCSFile(
        opts.bucketName,
        opts.fileName,
        opts.minLikelihood,
        opts.maxFindings,
        opts.infoTypes
      )
  )
  .command(
    `gcsFileEvent <bucketName> <fileName>`,
    `Inspects a text file stored on Google Cloud Storage using the Data Loss Prevention API and the event-handler pattern.`,
    {},
    opts =>
      eventInspectGCSFile(
        opts.bucketName,
        opts.fileName,
        opts.minLikelihood,
        opts.maxFindings,
        opts.infoTypes
      )
  )
  .command(
    `bigquery <datasetName> <tableName>`,
    `Inspects a BigQuery table using the Data Loss Prevention API.`,
    {
      projectId: {
        type: 'string',
        alias: 'p',
        default: process.env.GCLOUD_PROJECT,
      },
    },
    opts =>
      inspectBigquery(
        opts.projectId,
        opts.datasetName,
        opts.tableName,
        opts.minLikelihood,
        opts.maxFindings,
        opts.infoTypes,
        opts.includeQuote
      )
  )
  .command(
    `datastore <kind>`,
    `Inspect a Datastore instance using the Data Loss Prevention API.`,
    {
      projectId: {
        type: 'string',
        alias: 'p',
        default: process.env.GCLOUD_PROJECT,
      },
      namespaceId: {
        type: 'string',
        alias: 'n',
        default: '',
      },
    },
    opts =>
      inspectDatastore(
        opts.projectId,
        opts.namespaceId,
        opts.kind,
        opts.minLikelihood,
        opts.maxFindings,
        opts.infoTypes,
        opts.includeQuote
      )
  )
  .option('m', {
    alias: 'minLikelihood',
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
  })
  .option('f', {
    alias: 'maxFindings',
    default: 0,
    type: 'number',
    global: true,
  })
  .option('q', {
    alias: 'includeQuote',
    default: true,
    type: 'boolean',
    global: true,
  })
  .option('t', {
    alias: 'infoTypes',
    default: ['PHONE_NUMBER', 'EMAIL_ADDRESS', 'CREDIT_CARD_NUMBER'],
    type: 'array',
    global: true,
    coerce: infoTypes =>
      infoTypes.map(type => {
        return {name: type};
      }),
  })
  .example(
    `node $0 string "My phone number is (123) 456-7890 and my email address is me@somedomain.com"`
  )
  .example(`node $0 file resources/test.txt`)
  .example(`node $0 gcsFilePromise my-bucket my-file.txt`)
  .example(`node $0 gcsFileEvent my-bucket my-file.txt`)
  .example(`node $0 bigquery my-dataset my-table`)
  .example(`node $0 datastore my-datastore-kind`)
  .wrap(120)
  .recommendCommands()
  .epilogue(
    `For more information, see https://cloud.google.com/dlp/docs. Optional flags are explained at https://cloud.google.com/dlp/docs/reference/rest/v2beta1/content/inspect#InspectConfig`
  );

if (module === require.main) {
  cli.help().strict().argv; // eslint-disable-line
}

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

function inspectString(
  callingProjectId,
  string,
  minLikelihood,
  maxFindings,
  infoTypes,
  includeQuote
) {
  // [START dlp_inspect_string]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const callingProjectId = process.env.GCLOUD_PROJECT;

  // The string to inspect
  // const string = 'My name is Gary and my email is gary@example.com';

  // The minimum likelihood required before returning a match
  // const minLikelihood = 'LIKELIHOOD_UNSPECIFIED';

  // The maximum number of findings to report per request (0 = server maximum)
  // const maxFindings = 0;

  // The infoTypes of information to match
  // const infoTypes = [{ name: 'PHONE_NUMBER' }, { name: 'EMAIL_ADDRESS' }, { name: 'CREDIT_CARD_NUMBER' }];

  // Whether to include the matching string
  // const includeQuote = true;

  // Construct item to inspect
  const item = {value: string};

  // Construct request
  const request = {
    parent: dlp.projectPath(callingProjectId),
    inspectConfig: {
      infoTypes: infoTypes,
      minLikelihood: minLikelihood,
      includeQuote: includeQuote,
      limits: {
        maxFindingsPerRequest: maxFindings,
      },
    },
    item: item,
  };

  // Run request
  dlp
    .inspectContent(request)
    .then(response => {
      const findings = response[0].result.findings;
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
  // [END dlp_inspect_string]
}

function inspectFile(
  callingProjectId,
  filepath,
  minLikelihood,
  maxFindings,
  infoTypes,
  includeQuote
) {
  // [START dlp_inspect_file]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Import other required libraries
  const fs = require('fs');
  const mime = require('mime');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const callingProjectId = process.env.GCLOUD_PROJECT;

  // The path to a local file to inspect. Can be a text, JPG, or PNG file.
  // const fileName = 'path/to/image.png';

  // The minimum likelihood required before returning a match
  // const minLikelihood = 'LIKELIHOOD_UNSPECIFIED';

  // The maximum number of findings to report per request (0 = server maximum)
  // const maxFindings = 0;

  // The infoTypes of information to match
  // const infoTypes = [{ name: 'PHONE_NUMBER' }, { name: 'EMAIL_ADDRESS' }, { name: 'CREDIT_CARD_NUMBER' }];

  // Whether to include the matching string
  // const includeQuote = true;

  // Construct file data to inspect
  const fileTypeConstant =
    ['image/jpeg', 'image/bmp', 'image/png', 'image/svg'].indexOf(
      mime.getType(filepath)
    ) + 1;
  const fileBytes = Buffer.from(fs.readFileSync(filepath)).toString('base64');
  const item = {
    byteItem: {
      type: fileTypeConstant,
      data: fileBytes,
    },
  };

  // Construct request
  const request = {
    parent: dlp.projectPath(callingProjectId),
    inspectConfig: {
      infoTypes: infoTypes,
      minLikelihood: minLikelihood,
      includeQuote: includeQuote,
      limits: {
        maxFindingsPerRequest: maxFindings,
      },
    },
    item: item,
  };

  // Run request
  dlp
    .inspectContent(request)
    .then(response => {
      const findings = response[0].result.findings;
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
  // [END dlp_inspect_file]
}

function inspectGCSFile(
  callingProjectId,
  bucketName,
  fileName,
  topicId,
  subscriptionId,
  minLikelihood,
  maxFindings,
  infoTypes
) {
  // [START dlp_inspect_gcs]
  // Import the Google Cloud client libraries
  const DLP = require('@google-cloud/dlp');
  const Pubsub = require('@google-cloud/pubsub');

  // Instantiates clients
  const dlp = new DLP.DlpServiceClient();
  const pubsub = new Pubsub();

  // The project ID to run the API call under
  // const callingProjectId = process.env.GCLOUD_PROJECT;

  // The name of the bucket where the file resides.
  // const bucketName = 'YOUR-BUCKET';

  // The path to the file within the bucket to inspect.
  // Can contain wildcards, e.g. "my-image.*"
  // const fileName = 'my-image.png';

  // The minimum likelihood required before returning a match
  // const minLikelihood = 'LIKELIHOOD_UNSPECIFIED';

  // The maximum number of findings to report per request (0 = server maximum)
  // const maxFindings = 0;

  // The infoTypes of information to match
  // const infoTypes = [{ name: 'PHONE_NUMBER' }, { name: 'EMAIL_ADDRESS' }, { name: 'CREDIT_CARD_NUMBER' }];

  // The name of the Pub/Sub topic to notify once the job completes
  // TODO(developer): create a Pub/Sub topic to use for this
  // const topicId = 'MY-PUBSUB-TOPIC'

  // The name of the Pub/Sub subscription to use when listening for job
  // completion notifications
  // TODO(developer): create a Pub/Sub subscription to use for this
  // const subscriptionId = 'MY-PUBSUB-SUBSCRIPTION'

  // Get reference to the file to be inspected
  const storageItem = {
    cloudStorageOptions: {
      fileSet: {url: `gs://${bucketName}/${fileName}`},
    },
  };

  // Construct request for creating an inspect job
  const request = {
    parent: dlp.projectPath(callingProjectId),
    inspectJob: {
      inspectConfig: {
        infoTypes: infoTypes,
        minLikelihood: minLikelihood,
        limits: {
          maxFindingsPerRequest: maxFindings,
        },
      },
      storageConfig: storageItem,
      actions: [
        {
          pubSub: {
            topic: `projects/${callingProjectId}/topics/${topicId}`,
          },
        },
      ],
    },
  };

  // Create a GCS File inspection job and wait for it to complete
  let subscription;
  pubsub
    .topic(topicId)
    .get()
    .then(topicResponse => {
      // Verify the Pub/Sub topic and listen for job notifications via an
      // existing subscription.
      return topicResponse[0].subscription(subscriptionId);
    })
    .then(subscriptionResponse => {
      subscription = subscriptionResponse;
      return dlp.createDlpJob(request);
    })
    .then(jobsResponse => {
      // Get the job's ID
      return jobsResponse[0].name;
    })
    .then(jobName => {
      // Watch the Pub/Sub topic until the DLP job finishes
      return new Promise((resolve, reject) => {
        const messageHandler = message => {
          if (message.attributes && message.attributes.DlpJobName === jobName) {
            message.ack();
            subscription.removeListener('message', messageHandler);
            subscription.removeListener('error', errorHandler);
            resolve(jobName);
          } else {
            message.nack();
          }
        };

        const errorHandler = err => {
          subscription.removeListener('message', messageHandler);
          subscription.removeListener('error', errorHandler);
          reject(err);
        };

        subscription.on('message', messageHandler);
        subscription.on('error', errorHandler);
      });
    })
    .then(jobName => {
      // Wait for DLP job to fully complete
      return new Promise(resolve => setTimeout(resolve(jobName), 500));
    })
    .then(jobName => dlp.getDlpJob({name: jobName}))
    .then(wrappedJob => {
      const job = wrappedJob[0];
      console.log(`Job ${job.name} status: ${job.state}`);

      const infoTypeStats = job.inspectDetails.result.infoTypeStats;
      if (infoTypeStats.length > 0) {
        infoTypeStats.forEach(infoTypeStat => {
          console.log(
            `  Found ${infoTypeStat.count} instance(s) of infoType ${
              infoTypeStat.infoType.name
            }.`
          );
        });
      } else {
        console.log(`No findings.`);
      }
    })
    .catch(err => {
      console.log(`Error in inspectGCSFile: ${err.message || err}`);
    });
  // [END dlp_inspect_gcs]
}

function inspectDatastore(
  callingProjectId,
  dataProjectId,
  namespaceId,
  kind,
  topicId,
  subscriptionId,
  minLikelihood,
  maxFindings,
  infoTypes
) {
  // [START dlp_inspect_datastore]
  // Import the Google Cloud client libraries
  const DLP = require('@google-cloud/dlp');
  const Pubsub = require('@google-cloud/pubsub');

  // Instantiates clients
  const dlp = new DLP.DlpServiceClient();
  const pubsub = new Pubsub();

  // The project ID to run the API call under
  // const callingProjectId = process.env.GCLOUD_PROJECT;

  // The project ID the target Datastore is stored under
  // This may or may not equal the calling project ID
  // const dataProjectId = process.env.GCLOUD_PROJECT;

  // (Optional) The ID namespace of the Datastore document to inspect.
  // To ignore Datastore namespaces, set this to an empty string ('')
  // const namespaceId = '';

  // The kind of the Datastore entity to inspect.
  // const kind = 'Person';

  // The minimum likelihood required before returning a match
  // const minLikelihood = 'LIKELIHOOD_UNSPECIFIED';

  // The maximum number of findings to report per request (0 = server maximum)
  // const maxFindings = 0;

  // The infoTypes of information to match
  // const infoTypes = [{ name: 'PHONE_NUMBER' }, { name: 'EMAIL_ADDRESS' }, { name: 'CREDIT_CARD_NUMBER' }];

  // The name of the Pub/Sub topic to notify once the job completes
  // TODO(developer): create a Pub/Sub topic to use for this
  // const topicId = 'MY-PUBSUB-TOPIC'

  // The name of the Pub/Sub subscription to use when listening for job
  // completion notifications
  // TODO(developer): create a Pub/Sub subscription to use for this
  // const subscriptionId = 'MY-PUBSUB-SUBSCRIPTION'

  // Construct items to be inspected
  const storageItems = {
    datastoreOptions: {
      partitionId: {
        projectId: dataProjectId,
        namespaceId: namespaceId,
      },
      kind: {
        name: kind,
      },
    },
  };

  // Construct request for creating an inspect job
  const request = {
    parent: dlp.projectPath(callingProjectId),
    inspectJob: {
      inspectConfig: {
        infoTypes: infoTypes,
        minLikelihood: minLikelihood,
        limits: {
          maxFindingsPerRequest: maxFindings,
        },
      },
      storageConfig: storageItems,
      actions: [
        {
          pubSub: {
            topic: `projects/${callingProjectId}/topics/${topicId}`,
          },
        },
      ],
    },
  };

  // Run inspect-job creation request
  let subscription;
  pubsub
    .topic(topicId)
    .get()
    .then(topicResponse => {
      // Verify the Pub/Sub topic and listen for job notifications via an
      // existing subscription.
      return topicResponse[0].subscription(subscriptionId);
    })
    .then(subscriptionResponse => {
      subscription = subscriptionResponse;
      return dlp.createDlpJob(request);
    })
    .then(jobsResponse => {
      // Get the job's ID
      return jobsResponse[0].name;
    })
    .then(jobName => {
      // Watch the Pub/Sub topic until the DLP job finishes
      return new Promise((resolve, reject) => {
        const messageHandler = message => {
          if (message.attributes && message.attributes.DlpJobName === jobName) {
            message.ack();
            subscription.removeListener('message', messageHandler);
            subscription.removeListener('error', errorHandler);
            resolve(jobName);
          } else {
            message.nack();
          }
        };

        const errorHandler = err => {
          subscription.removeListener('message', messageHandler);
          subscription.removeListener('error', errorHandler);
          reject(err);
        };

        subscription.on('message', messageHandler);
        subscription.on('error', errorHandler);
      });
    })
    .then(jobName => {
      // Wait for DLP job to fully complete
      return new Promise(resolve => setTimeout(resolve(jobName), 500));
    })
    .then(jobName => dlp.getDlpJob({name: jobName}))
    .then(wrappedJob => {
      const job = wrappedJob[0];
      console.log(`Job ${job.name} status: ${job.state}`);

      const infoTypeStats = job.inspectDetails.result.infoTypeStats;
      if (infoTypeStats.length > 0) {
        infoTypeStats.forEach(infoTypeStat => {
          console.log(
            `  Found ${infoTypeStat.count} instance(s) of infoType ${
              infoTypeStat.infoType.name
            }.`
          );
        });
      } else {
        console.log(`No findings.`);
      }
    })
    .catch(err => {
      console.log(`Error in inspectDatastore: ${err.message || err}`);
    });
  // [END dlp_inspect_datastore]
}

function inspectBigquery(
  callingProjectId,
  dataProjectId,
  datasetId,
  tableId,
  topicId,
  subscriptionId,
  minLikelihood,
  maxFindings,
  infoTypes
) {
  // [START dlp_inspect_bigquery]
  // Import the Google Cloud client libraries
  const DLP = require('@google-cloud/dlp');
  const Pubsub = require('@google-cloud/pubsub');

  // Instantiates clients
  const dlp = new DLP.DlpServiceClient();
  const pubsub = new Pubsub();

  // The project ID to run the API call under
  // const callingProjectId = process.env.GCLOUD_PROJECT;

  // The project ID the table is stored under
  // This may or (for public datasets) may not equal the calling project ID
  // const dataProjectId = process.env.GCLOUD_PROJECT;

  // The ID of the dataset to inspect, e.g. 'my_dataset'
  // const datasetId = 'my_dataset';

  // The ID of the table to inspect, e.g. 'my_table'
  // const tableId = 'my_table';

  // The minimum likelihood required before returning a match
  // const minLikelihood = 'LIKELIHOOD_UNSPECIFIED';

  // The maximum number of findings to report per request (0 = server maximum)
  // const maxFindings = 0;

  // The infoTypes of information to match
  // const infoTypes = [{ name: 'PHONE_NUMBER' }, { name: 'EMAIL_ADDRESS' }, { name: 'CREDIT_CARD_NUMBER' }];

  // The name of the Pub/Sub topic to notify once the job completes
  // TODO(developer): create a Pub/Sub topic to use for this
  // const topicId = 'MY-PUBSUB-TOPIC'

  // The name of the Pub/Sub subscription to use when listening for job
  // completion notifications
  // TODO(developer): create a Pub/Sub subscription to use for this
  // const subscriptionId = 'MY-PUBSUB-SUBSCRIPTION'

  // Construct item to be inspected
  const storageItem = {
    bigQueryOptions: {
      tableReference: {
        projectId: dataProjectId,
        datasetId: datasetId,
        tableId: tableId,
      },
    },
  };

  // Construct request for creating an inspect job
  const request = {
    parent: dlp.projectPath(callingProjectId),
    inspectJob: {
      inspectConfig: {
        infoTypes: infoTypes,
        minLikelihood: minLikelihood,
        limits: {
          maxFindingsPerRequest: maxFindings,
        },
      },
      storageConfig: storageItem,
      actions: [
        {
          pubSub: {
            topic: `projects/${callingProjectId}/topics/${topicId}`,
          },
        },
      ],
    },
  };

  // Run inspect-job creation request
  let subscription;
  pubsub
    .topic(topicId)
    .get()
    .then(topicResponse => {
      // Verify the Pub/Sub topic and listen for job notifications via an
      // existing subscription.
      return topicResponse[0].subscription(subscriptionId);
    })
    .then(subscriptionResponse => {
      subscription = subscriptionResponse;
      return dlp.createDlpJob(request);
    })
    .then(jobsResponse => {
      // Get the job's ID
      return jobsResponse[0].name;
    })
    .then(jobName => {
      // Watch the Pub/Sub topic until the DLP job finishes
      return new Promise((resolve, reject) => {
        const messageHandler = message => {
          if (message.attributes && message.attributes.DlpJobName === jobName) {
            message.ack();
            subscription.removeListener('message', messageHandler);
            subscription.removeListener('error', errorHandler);
            resolve(jobName);
          } else {
            message.nack();
          }
        };

        const errorHandler = err => {
          console.error(err);
          subscription.removeListener('message', messageHandler);
          subscription.removeListener('error', errorHandler);
          reject(err);
        };

        subscription.on('message', messageHandler);
        subscription.on('error', errorHandler);
      });
    })
    .then(jobName => {
      // Wait for DLP job to fully complete
      return new Promise(resolve => setTimeout(resolve(jobName), 500));
    })
    .then(jobName => dlp.getDlpJob({name: jobName}))
    .then(wrappedJob => {
      const job = wrappedJob[0];
      console.log(`Job ${job.name} state: ${job.state}`);

      const infoTypeStats = job.inspectDetails.result.infoTypeStats;
      if (infoTypeStats.length > 0) {
        infoTypeStats.forEach(infoTypeStat => {
          console.log(
            `  Found ${infoTypeStat.count} instance(s) of infoType ${
              infoTypeStat.infoType.name
            }.`
          );
        });
      } else {
        console.log(`No findings.`);
      }
    })
    .catch(err => {
      console.log(`Error in inspectBigquery: ${err.message || err}`);
    });
  // [END dlp_inspect_bigquery]
}

const cli = require(`yargs`) // eslint-disable-line
  .demand(1)
  .command(
    `string <string>`,
    `Inspect a string using the Data Loss Prevention API.`,
    {},
    opts =>
      inspectString(
        opts.callingProjectId,
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
        opts.callingProjectId,
        opts.filepath,
        opts.minLikelihood,
        opts.maxFindings,
        opts.infoTypes,
        opts.includeQuote
      )
  )
  .command(
    `gcsFile <bucketName> <fileName> <topicId> <subscriptionId>`,
    `Inspects a text file stored on Google Cloud Storage with the Data Loss Prevention API, using Pub/Sub for job notifications.`,
    {},
    opts =>
      inspectGCSFile(
        opts.callingProjectId,
        opts.bucketName,
        opts.fileName,
        opts.topicId,
        opts.subscriptionId,
        opts.minLikelihood,
        opts.maxFindings,
        opts.infoTypes
      )
  )
  .command(
    `bigquery <datasetName> <tableName> <topicId> <subscriptionId>`,
    `Inspects a BigQuery table using the Data Loss Prevention API using Pub/Sub for job notifications.`,
    {},
    opts => {
      inspectBigquery(
        opts.callingProjectId,
        opts.dataProjectId,
        opts.datasetName,
        opts.tableName,
        opts.topicId,
        opts.subscriptionId,
        opts.minLikelihood,
        opts.maxFindings,
        opts.infoTypes
      );
    }
  )
  .command(
    `datastore <kind> <topicId> <subscriptionId>`,
    `Inspect a Datastore instance using the Data Loss Prevention API using Pub/Sub for job notifications.`,
    {
      namespaceId: {
        type: 'string',
        alias: 'n',
        default: '',
      },
    },
    opts =>
      inspectDatastore(
        opts.callingProjectId,
        opts.dataProjectId,
        opts.namespaceId,
        opts.kind,
        opts.topicId,
        opts.subscriptionId,
        opts.minLikelihood,
        opts.maxFindings,
        opts.infoTypes
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
  .option('c', {
    type: 'string',
    alias: 'callingProjectId',
    default: process.env.GCLOUD_PROJECT || '',
  })
  .option('p', {
    type: 'string',
    alias: 'dataProjectId',
    default: process.env.GCLOUD_PROJECT || '',
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
  .option('n', {
    alias: 'notificationTopic',
    type: 'string',
    global: true,
  })
  .example(`node $0 string "My email address is me@somedomain.com"`)
  .example(`node $0 file resources/test.txt`)
  .example(`node $0 gcsFile my-bucket my-file.txt my-topic my-subscription`)
  .example(`node $0 bigquery my-dataset my-table my-topic my-subscription`)
  .example(`node $0 datastore my-datastore-kind my-topic my-subscription`)
  .wrap(120)
  .recommendCommands()
  .epilogue(
    `For more information, see https://cloud.google.com/dlp/docs. Optional flags are explained at https://cloud.google.com/dlp/docs/reference/rest/v2/InspectConfig`
  );

if (module === require.main) {
  cli.help().strict().argv; // eslint-disable-line
}

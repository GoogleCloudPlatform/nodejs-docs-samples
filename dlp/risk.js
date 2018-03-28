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

function numericalRiskAnalysis(
  callingProjectId,
  tableProjectId,
  datasetId,
  tableId,
  columnName,
  topicId,
  subscriptionId
) {
  // [START dlp_numerical_stats]
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
  // const tableProjectId = process.env.GCLOUD_PROJECT;

  // The ID of the dataset to inspect, e.g. 'my_dataset'
  // const datasetId = 'my_dataset';

  // The ID of the table to inspect, e.g. 'my_table'
  // const tableId = 'my_table';

  // The name of the column to compute risk metrics for, e.g. 'age'
  // Note that this column must be a numeric data type
  // const columnName = 'firstName';

  // The name of the Pub/Sub topic to notify once the job completes
  // TODO(developer): create a Pub/Sub topic to use for this
  // const topicId = 'MY-PUBSUB-TOPIC'

  // The name of the Pub/Sub subscription to use when listening for job
  // completion notifications
  // TODO(developer): create a Pub/Sub subscription to use for this
  // const subscriptionId = 'MY-PUBSUB-SUBSCRIPTION'

  const sourceTable = {
    projectId: tableProjectId,
    datasetId: datasetId,
    tableId: tableId,
  };

  // Construct request for creating a risk analysis job
  const request = {
    parent: dlp.projectPath(callingProjectId),
    riskJob: {
      privacyMetric: {
        numericalStatsConfig: {
          field: {
            name: columnName,
          },
        },
      },
      sourceTable: sourceTable,
      actions: [
        {
          pubSub: {
            topic: `projects/${callingProjectId}/topics/${topicId}`,
          },
        },
      ],
    },
  };

  // Create helper function for unpacking values
  const getValue = obj => obj[Object.keys(obj)[0]];

  // Run risk analysis job
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
      const results = job.riskDetails.numericalStatsResult;

      console.log(
        `Value Range: [${getValue(results.minValue)}, ${getValue(
          results.maxValue
        )}]`
      );

      // Print unique quantile values
      let tempValue = null;
      results.quantileValues.forEach((result, percent) => {
        const value = getValue(result);

        // Only print new values
        if (
          tempValue !== value &&
          !(tempValue && tempValue.equals && tempValue.equals(value))
        ) {
          console.log(`Value at ${percent}% quantile: ${value}`);
          tempValue = value;
        }
      });
    })
    .catch(err => {
      console.log(`Error in numericalRiskAnalysis: ${err.message || err}`);
    });
  // [END dlp_numerical_stats]
}

function categoricalRiskAnalysis(
  callingProjectId,
  tableProjectId,
  datasetId,
  tableId,
  columnName,
  topicId,
  subscriptionId
) {
  // [START dlp_categorical_stats]
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
  // const tableProjectId = process.env.GCLOUD_PROJECT;

  // The ID of the dataset to inspect, e.g. 'my_dataset'
  // const datasetId = 'my_dataset';

  // The ID of the table to inspect, e.g. 'my_table'
  // const tableId = 'my_table';

  // The name of the Pub/Sub topic to notify once the job completes
  // TODO(developer): create a Pub/Sub topic to use for this
  // const topicId = 'MY-PUBSUB-TOPIC'

  // The name of the Pub/Sub subscription to use when listening for job
  // completion notifications
  // TODO(developer): create a Pub/Sub subscription to use for this
  // const subscriptionId = 'MY-PUBSUB-SUBSCRIPTION'

  // The name of the column to compute risk metrics for, e.g. 'firstName'
  // const columnName = 'firstName';

  const sourceTable = {
    projectId: tableProjectId,
    datasetId: datasetId,
    tableId: tableId,
  };

  // Construct request for creating a risk analysis job
  const request = {
    parent: dlp.projectPath(callingProjectId),
    riskJob: {
      privacyMetric: {
        categoricalStatsConfig: {
          field: {
            name: columnName,
          },
        },
      },
      sourceTable: sourceTable,
      actions: [
        {
          pubSub: {
            topic: `projects/${callingProjectId}/topics/${topicId}`,
          },
        },
      ],
    },
  };

  // Create helper function for unpacking values
  const getValue = obj => obj[Object.keys(obj)[0]];

  // Run risk analysis job
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
      const histogramBuckets =
        job.riskDetails.categoricalStatsResult.valueFrequencyHistogramBuckets;
      histogramBuckets.forEach((histogramBucket, histogramBucketIdx) => {
        console.log(`Bucket ${histogramBucketIdx}:`);

        // Print bucket stats
        console.log(
          `  Most common value occurs ${
            histogramBucket.valueFrequencyUpperBound
          } time(s)`
        );
        console.log(
          `  Least common value occurs ${
            histogramBucket.valueFrequencyLowerBound
          } time(s)`
        );

        // Print bucket values
        console.log(`${histogramBucket.bucketSize} unique values total.`);
        histogramBucket.bucketValues.forEach(valueBucket => {
          console.log(
            `  Value ${getValue(valueBucket.value)} occurs ${
              valueBucket.count
            } time(s).`
          );
        });
      });
    })
    .catch(err => {
      console.log(`Error in categoricalRiskAnalysis: ${err.message || err}`);
    });
  // [END dlp_categorical_stats]
}

function kAnonymityAnalysis(
  callingProjectId,
  tableProjectId,
  datasetId,
  tableId,
  topicId,
  subscriptionId,
  quasiIds
) {
  // [START dlp_k_anonymity]
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
  // const tableProjectId = process.env.GCLOUD_PROJECT;

  // The ID of the dataset to inspect, e.g. 'my_dataset'
  // const datasetId = 'my_dataset';

  // The ID of the table to inspect, e.g. 'my_table'
  // const tableId = 'my_table';

  // The name of the Pub/Sub topic to notify once the job completes
  // TODO(developer): create a Pub/Sub topic to use for this
  // const topicId = 'MY-PUBSUB-TOPIC'

  // The name of the Pub/Sub subscription to use when listening for job
  // completion notifications
  // TODO(developer): create a Pub/Sub subscription to use for this
  // const subscriptionId = 'MY-PUBSUB-SUBSCRIPTION'

  // A set of columns that form a composite key ('quasi-identifiers')
  // const quasiIds = [{ name: 'age' }, { name: 'city' }];

  const sourceTable = {
    projectId: tableProjectId,
    datasetId: datasetId,
    tableId: tableId,
  };

  // Construct request for creating a risk analysis job
  const request = {
    parent: dlp.projectPath(callingProjectId),
    riskJob: {
      privacyMetric: {
        kAnonymityConfig: {
          quasiIds: quasiIds,
        },
      },
      sourceTable: sourceTable,
      actions: [
        {
          pubSub: {
            topic: `projects/${callingProjectId}/topics/${topicId}`,
          },
        },
      ],
    },
  };

  // Create helper function for unpacking values
  const getValue = obj => obj[Object.keys(obj)[0]];

  // Run risk analysis job
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
      const histogramBuckets =
        job.riskDetails.kAnonymityResult.equivalenceClassHistogramBuckets;

      histogramBuckets.forEach((histogramBucket, histogramBucketIdx) => {
        console.log(`Bucket ${histogramBucketIdx}:`);
        console.log(
          `  Bucket size range: [${
            histogramBucket.equivalenceClassSizeLowerBound
          }, ${histogramBucket.equivalenceClassSizeUpperBound}]`
        );

        histogramBucket.bucketValues.forEach(valueBucket => {
          const quasiIdValues = valueBucket.quasiIdsValues
            .map(getValue)
            .join(', ');
          console.log(`  Quasi-ID values: {${quasiIdValues}}`);
          console.log(`  Class size: ${valueBucket.equivalenceClassSize}`);
        });
      });
    })
    .catch(err => {
      console.log(`Error in kAnonymityAnalysis: ${err.message || err}`);
    });
  // [END dlp_k_anonymity]
}

function lDiversityAnalysis(
  callingProjectId,
  tableProjectId,
  datasetId,
  tableId,
  topicId,
  subscriptionId,
  sensitiveAttribute,
  quasiIds
) {
  // [START dlp_l_diversity]
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
  // const tableProjectId = process.env.GCLOUD_PROJECT;

  // The ID of the dataset to inspect, e.g. 'my_dataset'
  // const datasetId = 'my_dataset';

  // The ID of the table to inspect, e.g. 'my_table'
  // const tableId = 'my_table';

  // The name of the Pub/Sub topic to notify once the job completes
  // TODO(developer): create a Pub/Sub topic to use for this
  // const topicId = 'MY-PUBSUB-TOPIC'

  // The name of the Pub/Sub subscription to use when listening for job
  // completion notifications
  // TODO(developer): create a Pub/Sub subscription to use for this
  // const subscriptionId = 'MY-PUBSUB-SUBSCRIPTION'

  // The column to measure l-diversity relative to, e.g. 'firstName'
  // const sensitiveAttribute = 'name';

  // A set of columns that form a composite key ('quasi-identifiers')
  // const quasiIds = [{ name: 'age' }, { name: 'city' }];

  const sourceTable = {
    projectId: tableProjectId,
    datasetId: datasetId,
    tableId: tableId,
  };

  // Construct request for creating a risk analysis job
  const request = {
    parent: dlp.projectPath(callingProjectId),
    riskJob: {
      privacyMetric: {
        lDiversityConfig: {
          quasiIds: quasiIds,
          sensitiveAttribute: {
            name: sensitiveAttribute,
          },
        },
      },
      sourceTable: sourceTable,
      actions: [
        {
          pubSub: {
            topic: `projects/${callingProjectId}/topics/${topicId}`,
          },
        },
      ],
    },
  };

  // Create helper function for unpacking values
  const getValue = obj => obj[Object.keys(obj)[0]];

  // Run risk analysis job
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
      const histogramBuckets =
        job.riskDetails.lDiversityResult
          .sensitiveValueFrequencyHistogramBuckets;

      histogramBuckets.forEach((histogramBucket, histogramBucketIdx) => {
        console.log(`Bucket ${histogramBucketIdx}:`);

        console.log(
          `Bucket size range: [${
            histogramBucket.sensitiveValueFrequencyLowerBound
          }, ${histogramBucket.sensitiveValueFrequencyUpperBound}]`
        );
        histogramBucket.bucketValues.forEach(valueBucket => {
          const quasiIdValues = valueBucket.quasiIdsValues
            .map(getValue)
            .join(', ');
          console.log(`  Quasi-ID values: {${quasiIdValues}}`);
          console.log(`  Class size: ${valueBucket.equivalenceClassSize}`);
          valueBucket.topSensitiveValues.forEach(valueObj => {
            console.log(
              `    Sensitive value ${getValue(valueObj.value)} occurs ${
                valueObj.count
              } time(s).`
            );
          });
        });
      });
    })
    .catch(err => {
      console.log(`Error in lDiversityAnalysis: ${err.message || err}`);
    });
  // [END dlp_l_diversity]
}

function kMapEstimationAnalysis(
  callingProjectId,
  tableProjectId,
  datasetId,
  tableId,
  topicId,
  subscriptionId,
  regionCode,
  quasiIds
) {
  // [START dlp_k_map]
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
  // const tableProjectId = process.env.GCLOUD_PROJECT;

  // The ID of the dataset to inspect, e.g. 'my_dataset'
  // const datasetId = 'my_dataset';

  // The ID of the table to inspect, e.g. 'my_table'
  // const tableId = 'my_table';

  // The name of the Pub/Sub topic to notify once the job completes
  // TODO(developer): create a Pub/Sub topic to use for this
  // const topicId = 'MY-PUBSUB-TOPIC'

  // The name of the Pub/Sub subscription to use when listening for job
  // completion notifications
  // TODO(developer): create a Pub/Sub subscription to use for this
  // const subscriptionId = 'MY-PUBSUB-SUBSCRIPTION'

  // The ISO 3166-1 region code that the data is representative of
  // Can be omitted if using a region-specific infoType (such as US_ZIP_5)
  // const regionCode = 'USA';

  // A set of columns that form a composite key ('quasi-identifiers'), and
  // optionally their reidentification distributions
  // const quasiIds = [{ field: { name: 'age' }, infoType: { name: 'AGE' }}];

  const sourceTable = {
    projectId: tableProjectId,
    datasetId: datasetId,
    tableId: tableId,
  };

  // Construct request for creating a risk analysis job
  const request = {
    parent: dlp.projectPath(process.env.GCLOUD_PROJECT),
    riskJob: {
      privacyMetric: {
        kMapEstimationConfig: {
          quasiIds: quasiIds,
          regionCode: regionCode,
        },
      },
      sourceTable: sourceTable,
      actions: [
        {
          pubSub: {
            topic: `projects/${callingProjectId}/topics/${topicId}`,
          },
        },
      ],
    },
  };

  // Create helper function for unpacking values
  const getValue = obj => obj[Object.keys(obj)[0]];

  // Run risk analysis job
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
      const histogramBuckets =
        job.riskDetails.kMapEstimationResult.kMapEstimationHistogram;

      histogramBuckets.forEach((histogramBucket, histogramBucketIdx) => {
        console.log(`Bucket ${histogramBucketIdx}:`);
        console.log(
          `  Anonymity range: [${histogramBucket.minAnonymity}, ${
            histogramBucket.maxAnonymity
          }]`
        );
        console.log(`  Size: ${histogramBucket.bucketSize}`);
        histogramBucket.bucketValues.forEach(valueBucket => {
          const values = valueBucket.quasiIdsValues.map(value =>
            getValue(value)
          );
          console.log(`    Values: ${values.join(' ')}`);
          console.log(
            `    Estimated k-map anonymity: ${valueBucket.estimatedAnonymity}`
          );
        });
      });
    })
    .catch(err => {
      console.log(`Error in kMapEstimationAnalysis: ${err.message || err}`);
    });

  // [END dlp_k_map]
}

const cli = require(`yargs`) // eslint-disable-line
  .demand(1)
  .command(
    `numerical <datasetId> <tableId> <columnName> <topicId> <subscriptionId>`,
    `Computes risk metrics of a column of numbers in a Google BigQuery table.`,
    {},
    opts =>
      numericalRiskAnalysis(
        opts.callingProjectId,
        opts.tableProjectId,
        opts.datasetId,
        opts.tableId,
        opts.columnName,
        opts.topicId,
        opts.subscriptionId
      )
  )
  .command(
    `categorical <datasetId> <tableId> <columnName> <topicId> <subscriptionId>`,
    `Computes risk metrics of a column of data in a Google BigQuery table.`,
    {},
    opts =>
      categoricalRiskAnalysis(
        opts.callingProjectId,
        opts.tableProjectId,
        opts.datasetId,
        opts.tableId,
        opts.columnName,
        opts.topicId,
        opts.subscriptionId
      )
  )
  .command(
    `kAnonymity <datasetId> <tableId> <topicId> <subscriptionId> [quasiIdColumnNames..]`,
    `Computes the k-anonymity of a column set in a Google BigQuery table.`,
    {},
    opts =>
      kAnonymityAnalysis(
        opts.callingProjectId,
        opts.tableProjectId,
        opts.datasetId,
        opts.tableId,
        opts.topicId,
        opts.subscriptionId,
        opts.quasiIdColumnNames.map(f => {
          return {name: f};
        })
      )
  )
  .command(
    `lDiversity <datasetId> <tableId> <sensitiveAttribute> <topicId> <subscriptionId> [quasiIdColumnNames..]`,
    `Computes the l-diversity of a column set in a Google BigQuery table.`,
    {},
    opts =>
      lDiversityAnalysis(
        opts.callingProjectId,
        opts.tableProjectId,
        opts.datasetId,
        opts.tableId,
        opts.topicId,
        opts.subscriptionId,
        opts.sensitiveAttribute,
        opts.quasiIdColumnNames.map(f => {
          return {name: f};
        })
      )
  )
  .command(
    `kMap <datasetId> <tableId> <topicId> <subscriptionId> [quasiIdColumnNames..]`,
    `Computes the k-map risk estimation of a column set in a Google BigQuery table.`,
    {
      infoTypes: {
        alias: 't',
        type: 'array',
        global: true,
        default: [],
      },
      regionCode: {
        alias: 'r',
        type: 'string',
        global: true,
        default: 'US',
      },
    },
    opts => {
      // Validate infoType count (required for CLI parsing, not the API itself)
      if (opts.infoTypes.length !== opts.quasiIdColumnNames.length) {
        console.error(
          'Number of infoTypes and number of quasi-identifiers must be equal!'
        );
      } else {
        return kMapEstimationAnalysis(
          opts.callingProjectId,
          opts.tableProjectId,
          opts.datasetId,
          opts.tableId,
          opts.topicId,
          opts.subscriptionId,
          opts.regionCode,
          opts.quasiIdColumnNames.map((name, idx) => {
            return {
              field: {
                name: name,
              },
              infoType: {
                name: opts.infoTypes[idx],
              },
            };
          })
        );
      }
    }
  )
  .option('c', {
    type: 'string',
    alias: 'callingProjectId',
    default: process.env.GCLOUD_PROJECT || '',
    global: true,
  })
  .option('p', {
    type: 'string',
    alias: 'tableProjectId',
    default: process.env.GCLOUD_PROJECT || '',
    global: true,
  })
  .example(
    `node $0 numerical nhtsa_traffic_fatalities accident_2015 state_number my-topic my-subscription -p bigquery-public-data`
  )
  .example(
    `node $0 categorical nhtsa_traffic_fatalities accident_2015 state_name my-topic my-subscription -p bigquery-public-data`
  )
  .example(
    `node $0 kAnonymity nhtsa_traffic_fatalities accident_2015 my-topic my-subscription state_number county -p bigquery-public-data`
  )
  .example(
    `node $0 lDiversity nhtsa_traffic_fatalities accident_2015 my-topic my-subscription city state_number county -p bigquery-public-data`
  )
  .example(
    `node risk kMap san_francisco bikeshare_trips my-topic my-subscription zip_code -t US_ZIP_5 -p bigquery-public-data`
  )
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/dlp/docs.`);

if (module === require.main) {
  cli.help().strict().argv; // eslint-disable-line
}

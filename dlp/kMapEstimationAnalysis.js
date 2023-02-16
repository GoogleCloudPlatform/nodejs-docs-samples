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

// sample-metadata:
//  title: kMap Estimation Analysis
//  description: Computes the k-map risk estimation of a column set in a Google BigQuery table.
//  usage: node kMapEstimationAnalysis.js my-project tableProjectId datasetId tableId topicId subscriptionId regionCode quasiIds

function main(
  projectId,
  tableProjectId,
  datasetId,
  tableId,
  topicId,
  subscriptionId,
  regionCode,
  quasiIds,
  infoTypes
) {
  quasiIds = transformCLI(quasiIds, infoTypes);

  // [START dlp_k_map]
  // Import the Google Cloud client libraries
  const DLP = require('@google-cloud/dlp');
  const {PubSub} = require('@google-cloud/pubsub');

  // Instantiates clients
  const dlp = new DLP.DlpServiceClient();
  const pubsub = new PubSub();

  // The project ID to run the API call under
  // const projectId = 'my-project';

  // The project ID the table is stored under
  // This may or (for public datasets) may not equal the calling project ID
  // const tableProjectId = 'my-project';

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
  async function kMapEstimationAnalysis() {
    const sourceTable = {
      projectId: tableProjectId,
      datasetId: datasetId,
      tableId: tableId,
    };

    // Construct request for creating a risk analysis job
    const request = {
      parent: `projects/${projectId}/locations/global`,
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
              topic: `projects/${projectId}/topics/${topicId}`,
            },
          },
        ],
      },
    };
    // Create helper function for unpacking values
    const getValue = obj => obj[Object.keys(obj)[0]];

    // Run risk analysis job
    const [topicResponse] = await pubsub.topic(topicId).get();
    const subscription = await topicResponse.subscription(subscriptionId);
    const [jobsResponse] = await dlp.createDlpJob(request);
    const jobName = jobsResponse.name;

    // Watch the Pub/Sub topic until the DLP job finishes
    await new Promise((resolve, reject) => {
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
    setTimeout(() => {
      console.log(' Waiting for DLP job to fully complete');
    }, 500);
    const [job] = await dlp.getDlpJob({name: jobName});

    const histogramBuckets =
      job.riskDetails.kMapEstimationResult.kMapEstimationHistogram;

    histogramBuckets.forEach((histogramBucket, histogramBucketIdx) => {
      console.log(`Bucket ${histogramBucketIdx}:`);
      console.log(
        `  Anonymity range: [${histogramBucket.minAnonymity}, ${histogramBucket.maxAnonymity}]`
      );
      console.log(`  Size: ${histogramBucket.bucketSize}`);
      histogramBucket.bucketValues.forEach(valueBucket => {
        const values = valueBucket.quasiIdsValues.map(value => getValue(value));
        console.log(`    Values: ${values.join(' ')}`);
        console.log(
          `    Estimated k-map anonymity: ${valueBucket.estimatedAnonymity}`
        );
      });
    });
  }

  kMapEstimationAnalysis();
  // [END dlp_k_map]
}
main(...process.argv.slice(2));
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

function transformCLI(quasiIds, infoTypes) {
  infoTypes = infoTypes ? infoTypes.split(',') : null;

  quasiIds = quasiIds
    ? quasiIds.split(',').map((name, index) => {
        return {
          field: {
            name: name,
          },
          infoType: {
            name: infoTypes[index],
          },
        };
      })
    : undefined;

  return quasiIds;
}

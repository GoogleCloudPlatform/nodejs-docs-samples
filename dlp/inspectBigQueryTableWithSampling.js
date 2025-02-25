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

// sample-metadata:
//  title: Inspect Bigquery with sampling
//  description: Inspects a BigQuery table using the Data Loss Prevention API  to scan a 1000-row subset of a BigQuery table.
//  usage: node inspectBigQueryTableWithSampling.js my-project dataProjectId datasetId tableId topicId subscriptionId
async function main(
  projectId,
  dataProjectId,
  datasetId,
  tableId,
  topicId,
  subscriptionId
) {
  // [START dlp_inspect_bigquery_with_sampling]
  // Import the Google Cloud client libraries
  import DLP from '@google-cloud/dlp';
  import {PubSub} from '@google-cloud/pubsub';

  // Instantiates clients
  const dlp = new DLP.DlpServiceClient();
  const pubsub = new PubSub();

  // The project ID to run the API call under
  // const projectId = 'my-project';

  // The project ID the table is stored under
  // This may or (for public datasets) may not equal the calling project ID
  // const dataProjectId = 'my-project';

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

  // DLP Job max time (in milliseconds)
  const DLP_JOB_WAIT_TIME = 15 * 1000 * 60;

  async function inspectBigqueryWithSampling() {
    // Specify the type of info the inspection will look for.
    // See https://cloud.google.com/dlp/docs/infotypes-reference for complete list of info types
    const infoTypes = [{name: 'PERSON_NAME'}];

    // Specify the BigQuery options required for inspection.
    const storageItem = {
      bigQueryOptions: {
        tableReference: {
          projectId: dataProjectId,
          datasetId: datasetId,
          tableId: tableId,
        },
        rowsLimit: 1000,
        sampleMethod:
          DLP.protos.google.privacy.dlp.v2.BigQueryOptions.SampleMethod
            .RANDOM_START,
        includedFields: [{name: 'name'}],
      },
    };

    // Specify the action that is triggered when the job completes.
    const actions = [
      {
        pubSub: {
          topic: `projects/${projectId}/topics/${topicId}`,
        },
      },
    ];

    // Construct request for creating an inspect job
    const request = {
      parent: `projects/${projectId}/locations/global`,
      inspectJob: {
        inspectConfig: {
          infoTypes: infoTypes,
          includeQuote: true,
        },
        storageConfig: storageItem,
        actions: actions,
      },
    };
    // Use the client to send the request.
    const [topicResponse] = await pubsub.topic(topicId).get();

    // Verify the Pub/Sub topic and listen for job notifications via an
    // existing subscription.
    const subscription = await topicResponse.subscription(subscriptionId);

    const [jobsResponse] = await dlp.createDlpJob(request);
    const jobName = jobsResponse.name;

    // Watch the Pub/Sub topic until the DLP job finishes
    await new Promise((resolve, reject) => {
      // Set up the timeout
      const timer = setTimeout(() => {
        reject(new Error('Timeout'));
      }, DLP_JOB_WAIT_TIME);

      const messageHandler = message => {
        if (message.attributes && message.attributes.DlpJobName === jobName) {
          message.ack();
          subscription.removeListener('message', messageHandler);
          subscription.removeListener('error', errorHandler);
          clearTimeout(timer);
          resolve(jobName);
        } else {
          message.nack();
        }
      };

      const errorHandler = err => {
        subscription.removeListener('message', messageHandler);
        subscription.removeListener('error', errorHandler);
        clearTimeout(timer);
        reject(err);
      };

      subscription.on('message', messageHandler);
      subscription.on('error', errorHandler);
    });
    const [job] = await dlp.getDlpJob({name: jobName});
    console.log(`Job ${job.name} status: ${job.state}`);

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

  await inspectBigqueryWithSampling();
  // [END dlp_inspect_bigquery_with_sampling]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

// TODO(developer): Please uncomment below line before running sample
// main(...process.argv.slice(2));

module.exports = main;

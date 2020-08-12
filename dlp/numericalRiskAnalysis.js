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
//  title: Numerical Risk Analysis
//  description: Computes risk metrics of a column of numbers in a Google BigQuery table.
//  usage: node numericalRiskAnalysis.js my-project tableProjectId datasetId tableId columnName topicId subscriptionId

function main(
  projectId,
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

  async function numericalRiskAnalysis() {
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
  }

  numericalRiskAnalysis();
  // [END dlp_numerical_stats]
}

main(...process.argv.slice(2));
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

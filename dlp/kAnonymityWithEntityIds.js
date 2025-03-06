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
//  title: Create a Dlp Job to visualize the k-anonymity re-identification risk analysis metric
//  description: Uses the Data Loss Prevention API to visualize the k-anonymity re-identification risk analysis metric.
//  usage: node kAnonymityWithEntityIds.js projectId, datasetId, sourceTableId, outputTableId
async function main(projectId, datasetId, sourceTableId, outputTableId) {
  // [START dlp_k_anonymity_with_entity_id]
  // Imports the Google Cloud Data Loss Prevention library
  import DLP from '@google-cloud/dlp';

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under.
  // const projectId = "your-project-id";

  // The ID of the dataset to inspect, e.g. 'my_dataset'
  // const datasetId = 'my_dataset';

  // The ID of the table to inspect, e.g. 'my_table'
  // const sourceTableId = 'my_source_table';

  // The ID of the table where outputs are stored
  // const outputTableId = 'my_output_table';

  async function kAnonymityWithEntityIds() {
    // Specify the BigQuery table to analyze.
    const sourceTable = {
      projectId: projectId,
      datasetId: datasetId,
      tableId: sourceTableId,
    };

    // Specify the unique identifier in the source table for the k-anonymity analysis.
    const uniqueIdField = {name: 'Name'};

    // These values represent the column names of quasi-identifiers to analyze
    const quasiIds = [{name: 'Age'}, {name: 'Mystery'}];

    // Configure the privacy metric to compute for re-identification risk analysis.
    const privacyMetric = {
      kAnonymityConfig: {
        entityId: {
          field: uniqueIdField,
        },
        quasiIds: quasiIds,
      },
    };
    // Create action to publish job status notifications to BigQuery table.
    const action = [
      {
        saveFindings: {
          outputConfig: {
            table: {
              projectId: projectId,
              datasetId: datasetId,
              tableId: outputTableId,
            },
          },
        },
      },
    ];

    // Configure the risk analysis job to perform.
    const riskAnalysisJob = {
      sourceTable: sourceTable,
      privacyMetric: privacyMetric,
      actions: action,
    };
    // Combine configurations into a request for the service.
    const createDlpJobRequest = {
      parent: `projects/${projectId}/locations/global`,
      riskJob: riskAnalysisJob,
    };

    // Send the request and receive response from the service
    const [createdDlpJob] = await dlp.createDlpJob(createDlpJobRequest);
    const jobName = createdDlpJob.name;

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

    // Create helper function for unpacking values
    const getValue = obj => obj[Object.keys(obj)[0]];

    // Print out the results.
    const histogramBuckets =
      job.riskDetails.kAnonymityResult.equivalenceClassHistogramBuckets;

    histogramBuckets.forEach((histogramBucket, histogramBucketIdx) => {
      console.log(`Bucket ${histogramBucketIdx}:`);
      console.log(
        `  Bucket size range: [${histogramBucket.equivalenceClassSizeLowerBound}, ${histogramBucket.equivalenceClassSizeUpperBound}]`
      );

      histogramBucket.bucketValues.forEach(valueBucket => {
        const quasiIdValues = valueBucket.quasiIdsValues
          .map(getValue)
          .join(', ');
        console.log(`  Quasi-ID values: {${quasiIdValues}}`);
        console.log(`  Class size: ${valueBucket.equivalenceClassSize}`);
      });
    });
  }
  await kAnonymityWithEntityIds();
  // [END dlp_k_anonymity_with_entity_id]
}
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

// TODO(developer): Please uncomment below line before running sample
// main(...process.argv.slice(2));

module.exports = main;

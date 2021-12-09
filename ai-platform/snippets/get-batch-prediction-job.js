/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

async function main(batchPredictionJobId, project, location = 'us-central1') {
  // [START aiplatform_get_batch_prediction_job_sample]
  /**
   * TODO(developer): Uncomment these variables before running the sample.\
   * (Not necessary if passing values as arguments)
   */

  // const batchPredictionJobId = 'YOUR_BATCH_PREDICTION_JOB_ID';
  // const project = 'YOUR_PROJECT_ID';
  // const location = 'YOUR_PROJECT_LOCATION';

  // Imports the Google Cloud Job Service Client library
  const {JobServiceClient} = require('@google-cloud/aiplatform');

  // Specifies the location of the api endpoint
  const clientOptions = {
    apiEndpoint: 'us-central1-aiplatform.googleapis.com',
  };

  // Instantiates a client
  const jobServiceClient = new JobServiceClient(clientOptions);

  async function getBatchPredictionJob() {
    // Configure the parent resource
    const name = `projects/${project}/locations/${location}/batchPredictionJobs/${batchPredictionJobId}`;
    const request = {
      name,
    };

    // Get batch prediction request
    const [response] = await jobServiceClient.getBatchPredictionJob(request);

    console.log('Get batch prediction job response');
    console.log(`\tName : ${response.name}`);
    console.log(`\tDisplayName : ${response.displayName}`);
    console.log(`\tModel : ${response.model}`);
    console.log(`\tModel parameters : ${response.modelParameters}`);
    console.log(`\tGenerate explanation : ${response.generateExplanation}`);
    console.log(`\tState : ${response.state}`);
    console.log(`\tCreate Time : ${JSON.stringify(response.createTime)}`);
    console.log(`\tStart Time : ${JSON.stringify(response.startTime)}`);
    console.log(`\tEnd Time : ${JSON.stringify(response.endTime)}`);
    console.log(`\tUpdate Time : ${JSON.stringify(response.updateTime)}`);
    console.log(`\tLabels : ${JSON.stringify(response.labels)}`);

    const inputConfig = response.inputConfig;
    console.log('\tInput config');
    console.log(`\t\tInstances format : ${inputConfig.instancesFormat}`);

    const gcsSource = inputConfig.gcsSource;
    console.log('\t\tGcs source');
    console.log(`\t\t\tUris : ${gcsSource.uris}`);

    const bigquerySource = inputConfig.bigquerySource;
    console.log('\t\tBigQuery Source');
    if (!bigquerySource) {
      console.log('\t\t\tInput Uri : {}');
    } else {
      console.log(`\t\t\tInput Uri : ${bigquerySource.inputUri}`);
    }

    const outputConfig = response.outputConfig;
    console.log('\t\tOutput config');
    console.log(`\t\tPredictions format : ${outputConfig.predictionsFormat}`);

    const gcsDestination = outputConfig.gcsDestination;
    console.log('\t\tGcs Destination');
    console.log(`\t\t\tOutput uri prefix : ${gcsDestination.outputUriPrefix}`);

    const bigqueryDestination = outputConfig.bigqueryDestination;
    if (!bigqueryDestination) {
      console.log('\t\tBigquery Destination');
      console.log('\t\t\tOutput uri : {}');
    } else {
      console.log('\t\tBigquery Destination');
      console.log(`\t\t\tOutput uri : ${bigqueryDestination.outputUri}`);
    }

    const outputInfo = response.outputInfo;
    if (!outputInfo) {
      console.log('\tOutput info');
      console.log('\t\tGcs output directory : {}');
      console.log('\t\tBigquery_output_dataset : {}');
    } else {
      console.log('\tOutput info');
      console.log(
        `\t\tGcs output directory : ${outputInfo.gcsOutputDirectory}`
      );
      console.log(`\t\tBigquery_output_dataset : 
            ${outputInfo.bigqueryOutputDataset}`);
    }

    const error = response.error;
    console.log('\tError');
    console.log(`\t\tCode : ${error.code}`);
    console.log(`\t\tMessage : ${error.message}`);

    const details = error.details;
    console.log(`\t\tDetails : ${details}`);

    const partialFailures = response.partialFailures;
    console.log('\tPartial failure');
    console.log(partialFailures);

    const resourcesConsumed = response.resourcesConsumed;
    console.log('\tResource consumed');
    if (!resourcesConsumed) {
      console.log('\t\tReplica Hours: {}');
    } else {
      console.log(`\t\tReplica Hours: ${resourcesConsumed.replicaHours}`);
    }

    const completionStats = response.completionStats;
    console.log('\tCompletion status');
    if (!completionStats) {
      console.log('\t\tSuccessful count: {}');
      console.log('\t\tFailed count: {}');
      console.log('\t\tIncomplete count: {}');
    } else {
      console.log(`\t\tSuccessful count: ${completionStats.successfulCount}`);
      console.log(`\t\tFailed count: ${completionStats.failedCount}`);
      console.log(`\t\tIncomplete count: ${completionStats.incompleteCount}`);
    }
  }
  getBatchPredictionJob();
  // [END aiplatform_get_batch_prediction_job_sample]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));

/*
 * Copyright 2024 Google LLC
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

async function main() {
  // [START batch_create_using_secret_manager]
  // Imports the Batch library
  const batchLib = require('@google-cloud/batch');
  const batch = batchLib.protos.google.cloud.batch.v1;

  // Instantiates a client
  const batchClient = new batchLib.v1.BatchServiceClient();

  /**
   * TODO(developer): Update these variables before running the sample.
   */
  // Project ID or project number of the Google Cloud project you want to use.
  const projectId = await batchClient.getProjectId();
  // Name of the region you want to use to run the job. Regions that are
  // available for Batch are listed on: https://cloud.google.com/batch/docs/get-started#locations
  const region = 'europe-central2';
  // The name of the job that will be created.
  // It needs to be unique for each project and region pair.
  const jobName = 'batch-job-secret-manager';
  // The name of the secret variable.
  // This variable name is specified in this job's runnables
  // and is accessible to all of the runnables that are in the same environment.
  const secretVariableName = 'secretVariableName';
  // The name of an existing Secret Manager secret.
  const secretName = 'secretName';
  // The version of the specified secret that contains the data you want to pass to the job.
  // This can be the version number or latest.
  const version = 'version';

  // Define what will be done as part of the job.
  const runnable = new batch.Runnable({
    script: new batch.Runnable.Script({
      commands: ['-c', `echo This is the secret: ${secretVariableName}`],
    }),
  });

  // Construct the resource path to the secret's version.
  const secretValue = `projects/${projectId}/secrets/${secretName}/versions/${version}`;

  // Set the secret as an environment variable.
  const environment = new batch.Environment();
  environment.secretVariables[secretVariableName] = secretValue;

  const task = new batch.TaskSpec({
    runnables: [runnable],
    environment,
    maxRetryCount: 2,
    maxRunDuration: {seconds: 3600},
  });

  // Tasks are grouped inside a job using TaskGroups.
  const group = new batch.TaskGroup({
    taskCount: 3,
    taskSpec: task,
  });

  const job = new batch.Job({
    name: jobName,
    taskGroups: [group],
    labels: {env: 'testing', type: 'script'},
    // We use Cloud Logging as it's an option available out of the box
    logsPolicy: new batch.LogsPolicy({
      destination: batch.LogsPolicy.Destination.CLOUD_LOGGING,
    }),
  });

  // The job's parent is the project and region in which the job will run
  const parent = `projects/${projectId}/locations/${region}`;

  async function callCreateUsingSecretManager() {
    // Construct request
    const request = {
      parent,
      jobId: jobName,
      job,
    };

    // Run request
    const [response] = await batchClient.createJob(request);
    console.log(JSON.stringify(response));
  }

  await callCreateUsingSecretManager();
  // [END batch_create_using_secret_manager]
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});

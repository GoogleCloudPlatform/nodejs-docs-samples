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
  // [START batch_custom_events]
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
  const jobName = 'batch-custom-events-job';
  // Name of the runnable, which must be unique
  // within the job. For example: script 1, barrier 1, and script 2.
  const displayName1 = 'script 1';
  const displayName2 = 'barrier 1';
  const displayName3 = 'script 2';

  // Create runnables with custom scripts
  const runnable1 = new batch.Runnable({
    displayName: displayName1,
    script: new batch.Runnable.Script({
      commands: [
        '-c',
        'echo Hello world from script 1 for task ${BATCH_TASK_INDEX}.',
      ],
    }),
  });

  const runnable2 = new batch.Runnable({
    displayName: displayName2,
    barrier: new batch.Runnable.Barrier(),
  });

  const runnable3 = new batch.Runnable({
    displayName: displayName3,
    script: new batch.Runnable.Script({
      // Replace DESCRIPTION with a description
      // for the custom status event—for example, halfway done.
      commands: [
        'sleep 30; echo \'{"batch/custom/event": "DESCRIPTION"}\'; sleep 30',
      ],
    }),
  });

  const task = new batch.TaskSpec({
    runnables: [runnable1, runnable2, runnable3],
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

  async function callCreateBatchCustomEvents() {
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

  await callCreateBatchCustomEvents();
  // [END batch_custom_events]
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});

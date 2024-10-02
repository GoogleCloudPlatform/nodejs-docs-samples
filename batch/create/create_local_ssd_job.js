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
  // [START batch_create_local_ssd_job]
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
  const jobName = 'batch-local-ssd-job';
  // The name of a local SSD created for this job.
  const localSsdName = 'ssd-name';
  // The machine type, which can be predefined or custom, of the job's VMs.
  // The allowed number of local SSDs depends on the machine type
  // for your job's VMs are listed on: https://cloud.google.com/compute/docs/disks#localssds
  const machineType = 'c3d-standard-8-lssd';
  // The size of all the local SSDs in GB. Each local SSD is 375 GB,
  // so this value must be a multiple of 375 GB.
  // For example, for 2 local SSDs, set this value to 750 GB.
  const ssdSize = 375;

  // Define what will be done as part of the job.
  const runnable = new batch.Runnable({
    script: new batch.Runnable.Script({
      commands: [
        '-c',
        'echo Hello world! This is task ${BATCH_TASK_INDEX}. This job has a total of ${BATCH_TASK_COUNT} tasks.',
      ],
    }),
  });

  const task = new batch.TaskSpec({
    runnables: [runnable],
    maxRetryCount: 2,
    maxRunDuration: {seconds: 3600},
  });

  // Tasks are grouped inside a job using TaskGroups.
  const group = new batch.TaskGroup({
    taskCount: 3,
    taskSpec: task,
  });

  // Policies are used to define on what kind of virtual machines the tasks will run on.
  const instancePolicy = new batch.AllocationPolicy.InstancePolicy({
    machineType,
    disks: [
      new batch.AllocationPolicy.AttachedDisk({
        deviceName: localSsdName,
        // For example, local SSD uses type "local-ssd".
        // Persistent disks and boot disks use "pd-balanced", "pd-extreme", "pd-ssd"
        // or "pd-standard".
        newDisk: new batch.AllocationPolicy.AttachedDisk({
          type: 'local-ssd',
          sizeGb: ssdSize,
        }),
      }),
    ],
  });

  const allocationPolicy = new batch.AllocationPolicy.InstancePolicyOrTemplate({
    instances: [{policy: instancePolicy}],
  });

  const job = new batch.Job({
    name: jobName,
    taskGroups: [group],
    labels: {env: 'testing', type: 'script'},
    allocationPolicy,
    // We use Cloud Logging as it's an option available out of the box
    logsPolicy: new batch.LogsPolicy({
      destination: batch.LogsPolicy.Destination.CLOUD_LOGGING,
    }),
  });
  // The job's parent is the project and region in which the job will run
  const parent = `projects/${projectId}/locations/${region}`;

  async function callCreateBatchGPUJob() {
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

  await callCreateBatchGPUJob();
  // [END batch_create_local_ssd_job]
}

main().catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});

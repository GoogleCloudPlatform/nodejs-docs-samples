/*
 * Copyright 2021 Google LLC
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

// [START batch_create_gpu_job]
// Imports the Batch library
const batchLib = require('@google-cloud/batch');
const batch = batchLib.protos.google.cloud.batch.v1;

// Instantiates a client
const batchClient = new batchLib.v1.BatchServiceClient();

/**
 * TODO(developer): Update these variables before running the sample.
 */
// Project ID or project number of the Google Cloud project you want to use.
const PROJECT_ID = 'project-id';
// Name of the region you want to use to run the job. Regions that are
// available for Batch are listed on: https://cloud.google.com/batch/docs/get-started#locations
const REGION = 'europe-central2';
// The name of the job that will be created.
// It needs to be unique for each project and region pair.
const JOB_NAME = 'batch-gpu-job';
// The GPU type. You can view a list of the available GPU types
// by using the `gcloud compute accelerator-types list` command.
const GPU_TYPE = 'nvidia-l4';
// The number of GPUs of the specified type.
const GPU_COUNT = 1;
// Optional. When set to true, Batch fetches the drivers required for the GPU type
// that you specify in the policy field from a third-party location,
// and Batch installs them on your behalf. If you set this field to false (default),
// you need to install GPU drivers manually to use any GPUs for this job.
const INSTALL_GPU_DRIVERS = false;
// Accelerator-optimized machine types are available to Batch jobs. See the list
// of available types on: https://cloud.google.com/compute/docs/accelerator-optimized-machines
const MACHINE_TYPE = 'g2-standard-4';

async function main() {
  await callCreateBatchGPUJob(
    PROJECT_ID,
    REGION,
    JOB_NAME,
    GPU_TYPE,
    GPU_COUNT,
    INSTALL_GPU_DRIVERS,
    MACHINE_TYPE
  );
}

async function callCreateBatchGPUJob(
  projectId,
  region,
  jobName,
  gpuType,
  gpuCount,
  installGpuDrivers,
  machineType
) {
  // Define what will be done as part of the job.
  const runnable = new batch.Runnable({
    script: new batch.Runnable.Script({
      commands: ['-c', 'echo Hello world! This is task ${BATCH_TASK_INDEX}.'],
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
  // In this case, we tell the system to use "g2-standard-4" machine type.
  // Read more about machine types here: https://cloud.google.com/compute/docs/machine-types
  const instancePolicy = new batch.AllocationPolicy.InstancePolicy({
    machineType,
    // Accelerator describes Compute Engine accelerators to be attached to the VM
    accelerators: [
      new batch.AllocationPolicy.Accelerator({
        type: gpuType,
        count: gpuCount,
        installGpuDrivers,
      }),
    ],
  });

  const allocationPolicy = new batch.AllocationPolicy.InstancePolicyOrTemplate({
    instances: [{installGpuDrivers, policy: instancePolicy}],
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
// [END batch_create_gpu_job]

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main();

module.exports = {
  callCreateBatchGPUJob,
};

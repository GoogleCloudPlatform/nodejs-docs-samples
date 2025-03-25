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
  // [START batch_create_custom_network]
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
  const jobName = 'example-job';
  // The name of a VPC network in the current project or a Shared VPC network that is hosted by
  // or shared with the current project.
  const network = 'global/networks/test-network';
  // The name of a subnetwork that is part of the VPC network and is located
  // in the same region as the VMs for the job.
  const subnetwork = `regions/${region}/subnetworks/subnet`;

  // Define what will be done as part of the job.
  const runnable = new batch.Runnable({
    script: new batch.Runnable.Script({
      commands: ['-c', 'echo Hello world! This is task ${BATCH_TASK_INDEX}.'],
    }),
  });

  // Specify what resources are requested by each task.
  const computeResource = new batch.ComputeResource({
    // In milliseconds per cpu-second. This means the task requires 50% of a single CPUs.
    cpuMilli: 500,
    // In MiB.
    memoryMib: 16,
  });

  const task = new batch.TaskSpec({
    runnables: [runnable],
    computeResource,
    maxRetryCount: 2,
    maxRunDuration: {seconds: 3600},
  });

  // Tasks are grouped inside a job using TaskGroups.
  const group = new batch.TaskGroup({
    taskCount: 3,
    taskSpec: task,
  });

  // Specify VPC network and a subnet for Allocation Policy
  const networkPolicy = new batch.AllocationPolicy.NetworkPolicy({
    networkInterfaces: [
      new batch.AllocationPolicy.NetworkInterface({
        // Set the network name
        network,
        // Set the subnetwork name
        subnetwork,
        // Blocks external access for all VMs
        noExternalIpAddress: true,
      }),
    ],
  });

  // Policies are used to define on what kind of virtual machines the tasks will run on.
  // In this case, we tell the system to use "e2-standard-4" machine type.
  // Read more about machine types here: https://cloud.google.com/compute/docs/machine-types
  const instancePolicy = new batch.AllocationPolicy.InstancePolicy({
    machineType: 'e2-standard-4',
  });

  const allocationPolicy = new batch.AllocationPolicy.InstancePolicyOrTemplate({
    policy: instancePolicy,
    network: networkPolicy,
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

  async function callCreateBatchCustomNetwork() {
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

  await callCreateBatchCustomNetwork();
  // [END batch_create_custom_network]
}

main().catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});

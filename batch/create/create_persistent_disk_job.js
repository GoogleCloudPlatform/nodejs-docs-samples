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
  // [START batch_create_persistent_disk_job]
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
  // The name of the job that will be created.
  // It needs to be unique for each project and region pair.
  const jobName = 'batch-create-persistent-disk-job';
  // Name of the region you want to use to run the job. Regions that are
  // available for Batch are listed on: https://cloud.google.com/batch/docs/get-started#locations
  const region = 'europe-central2';
  // The name of an existing persistent disk.
  const existingPersistentDiskName = 'existing-persistent-disk-name';
  // The name of the new persistent disk.
  const newPersistentDiskName = 'new-persistent-disk-name';
  // The size of the new persistent disk in GB.
  // The allowed sizes depend on the type of persistent disk,
  // but the minimum is often 10 GB (10) and the maximum is often 64 TB (64000).
  const diskSize = 10;
  // The location of an existing persistent disk. For more info :
  // https://cloud.google.com/batch/docs/create-run-job-storage#gcloud
  const location = 'regions/us-central1';
  // The disk type of the new persistent disk, either pd-standard,
  // pd-balanced, pd-ssd, or pd-extreme. For Batch jobs, the default is pd-balanced.
  const newDiskType = 'pd-balanced';

  // Define what will be done as part of the job.
  const runnable = new batch.Runnable({
    script: new batch.Runnable.Script({
      commands: [
        '-c',
        'echo Hello world! This is task ${BATCH_TASK_INDEX}.' +
          '>> /mnt/disks/NEW_PERSISTENT_DISK_NAME/output_task_${BATCH_TASK_INDEX}.txt',
      ],
    }),
  });

  // Define volumes and their parameters to be mounted to a VM.
  const newVolume = new batch.Volume({
    deviceName: newPersistentDiskName,
    mountPath: `/mnt/disks/${newPersistentDiskName}`,
    mountOptions: ['rw', 'async'],
  });

  const existingVolume = new batch.Volume({
    deviceName: existingPersistentDiskName,
    mountPath: `/mnt/disks/${existingPersistentDiskName}`,
  });

  const task = new batch.TaskSpec({
    runnables: [runnable],
    volumes: [newVolume, existingVolume],
    maxRetryCount: 2,
    maxRunDuration: {seconds: 3600},
  });

  // Tasks are grouped inside a job using TaskGroups.
  const group = new batch.TaskGroup({
    taskCount: 3,
    taskSpec: task,
  });

  const newDisk = new batch.AllocationPolicy.Disk({
    type: newDiskType,
    sizeGb: diskSize,
  });

  // Policies are used to define on what kind of virtual machines the tasks will run on.
  // Read more about local disks here: https://cloud.google.com/compute/docs/disks/persistent-disks
  const instancePolicy = new batch.AllocationPolicy.InstancePolicy({
    disks: [
      // Create configuration for new disk
      new batch.AllocationPolicy.AttachedDisk({
        deviceName: newPersistentDiskName,
        newDisk,
      }),
      // Create link to existing disk
      new batch.AllocationPolicy.AttachedDisk({
        existingDisk: `projects/${projectId}/${location}/disks/${existingPersistentDiskName}`,
        deviceName: existingPersistentDiskName,
      }),
    ],
  });

  const locationPolicy = new batch.AllocationPolicy.LocationPolicy({
    allowedLocations: [location],
  });

  const allocationPolicy = new batch.AllocationPolicy.InstancePolicyOrTemplate({
    instances: [{policy: instancePolicy}],
    location: locationPolicy,
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

  async function callCreateBatchPersistentDiskJob() {
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

  await callCreateBatchPersistentDiskJob();
  // [END batch_create_persistent_disk_job]
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});

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

const assert = require('assert');
const {describe, it} = require('mocha');
const {BatchServiceClient} = require('@google-cloud/batch').v1;
const {callCreateBatchGPUJobN1} = require('../create/create_gpu_job_n1');
const {deleteJob, getJob} = require('./batchClient_operations');
const batchClient = new BatchServiceClient();

describe('Create batch GPU job on N1', async () => {
  const jobName = 'batch-gpu-job-n1';
  const region = 'europe-central2';
  const type = 'nvidia-tesla-t4';
  const count = 1;
  const installGpuDrivers = false;
  const machineType = 'n1-standard-16';
  let projectId;

  before(async () => {
    projectId = await batchClient.getProjectId();
  });

  after(async () => {
    await deleteJob(batchClient, projectId, region, jobName);
  });

  it('should create a new job with GPU on N1', async () => {
    const accelerators = [
      {
        type,
        count,
        installGpuDrivers,
        driverVersion: '',
      },
    ];

    await callCreateBatchGPUJobN1(
      projectId,
      region,
      jobName,
      type,
      count,
      installGpuDrivers,
      machineType
    );
    const createdJob = (
      await getJob(batchClient, projectId, region, jobName)
    )[0];

    assert.deepEqual(
      createdJob.allocationPolicy.instances[0].policy.accelerators,
      accelerators
    );
    assert.equal(
      createdJob.allocationPolicy.instances[0].policy.machineType,
      machineType
    );
    assert.equal(
      createdJob.allocationPolicy.instances[0].installGpuDrivers,
      installGpuDrivers
    );
  });
});

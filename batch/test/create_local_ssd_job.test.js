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
const {callCreateLocalSsdJob} = require('../create/create_local_ssd_job');
const {deleteJob, getJob} = require('./batchClient_operations');
const batchClient = new BatchServiceClient();

describe('Create batch local ssd job', async () => {
  const jobName = 'batch-local-ssd-job';
  const region = 'europe-central2';
  const localSsdName = 'ssd-name';
  const machineType = 'c3d-standard-8-lssd';
  const ssdSize = 375;
  let projectId;

  before(async () => {
    projectId = await batchClient.getProjectId();
  });

  after(async () => {
    await deleteJob(batchClient, projectId, region, jobName);
  });

  it('should create a new job with local ssd', async () => {
    const disks = [
      {
        deviceName: localSsdName,
        newDisk: {
          type: 'local-ssd',
          sizeGb: ssdSize,
          diskInterface: 'NVMe',
        },
        attached: 'newDisk',
      },
    ];

    await callCreateLocalSsdJob(
      projectId,
      region,
      jobName,
      localSsdName,
      machineType,
      ssdSize
    );
    const createdJob = (
      await getJob(batchClient, projectId, region, jobName)
    )[0];

    assert.deepEqual(
      createdJob.allocationPolicy.instances[0].policy.disks,
      disks
    );
    assert.equal(
      createdJob.allocationPolicy.instances[0].policy.machineType,
      machineType
    );
  });
});

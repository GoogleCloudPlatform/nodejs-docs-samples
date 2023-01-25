/**
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const {assert} = require('chai');
const {after, before, describe, it} = require('mocha');

const {BucketManager, TransferJobManager, runSample} = require('./utils');

describe('nearline-request', () => {
  const testBucketManager = new BucketManager();
  const testTransferJobManager = new TransferJobManager();

  let projectId;
  let description;
  let gcsSourceBucket;
  let gcsSinkBucket;

  before(async () => {
    projectId = await testBucketManager.getProjectId();
    gcsSourceBucket = (await testBucketManager.generateGCSBucket()).name;
    gcsSinkBucket = (await testBucketManager.generateGCSBucket()).name;
    description = `My transfer job from '${gcsSourceBucket}' -> '${gcsSinkBucket}'`;
  });

  after(async () => {
    await testBucketManager.deleteBuckets();
    await testTransferJobManager.cleanUp();
  });

  it('should create a daily transfer job from S3 to GCS', async () => {
    const output = await runSample('nearline-request', [
      projectId,
      description,
      gcsSourceBucket,
      gcsSinkBucket,
      new Date().toISOString(),
    ]);

    assert.include(output, 'Created transferJob: transferJobs/');

    // If it ran successfully and a job was created, delete it to clean up
    const [jobName] = output.match(/transferJobs.*/);

    testTransferJobManager.transferJobToCleanUp(jobName);
  });
});

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

describe('aws-request', () => {
  const testBucketManager = new BucketManager();
  const testTransferJobManager = new TransferJobManager();

  let projectId;
  let description;
  let awsSourceBucket;
  let gcsSinkBucket;

  before(async () => {
    testBucketManager.setupS3();

    projectId = await testBucketManager.getProjectId();
    awsSourceBucket = await testBucketManager.generateS3Bucket();
    gcsSinkBucket = (await testBucketManager.generateGCSBucket()).name;
    description = `My transfer job from '${awsSourceBucket}' -> '${gcsSinkBucket}'`;
  });

  after(async () => {
    await testBucketManager.deleteBuckets();
    await testTransferJobManager.cleanUp();
  });

  it('should create a transfer job from S3 to GCS', async () => {
    const output = await runSample('aws-request', [
      projectId,
      description,
      awsSourceBucket,
      gcsSinkBucket,
    ]);

    assert.include(output, 'Created and ran a transfer job');

    // If it ran successfully and a job was created, delete it to clean up
    const [jobName] = output.match(/transferJobs.*/);

    testTransferJobManager.transferJobToCleanUp(jobName);
  });
});

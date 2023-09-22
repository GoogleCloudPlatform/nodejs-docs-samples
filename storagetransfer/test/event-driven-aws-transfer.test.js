/**
 * Copyright 2023 Google LLC
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

const {
  BucketManager,
  TransferJobManager,
  QueueManager,
  runSample,
} = require('./utils');

describe('event-driven-aws-transfer', () => {
  const testBucketManager = new BucketManager();
  const testTransferJobManager = new TransferJobManager();
  const testQueueManager = new QueueManager();

  let projectId;
  let s3SourceBucket;
  let gcsSinkBucket;
  let sqsQueueArn;

  before(async () => {
    testBucketManager.setupS3();
    projectId = await testBucketManager.getProjectId();
    s3SourceBucket = await testBucketManager.generateS3Bucket();
    gcsSinkBucket = (await testBucketManager.generateGCSBucket()).name;
    sqsQueueArn = await testQueueManager.generateSqsQueueArn();
    console.log('Arn: ' + sqsQueueArn);
  });

  after(async () => {
    await testBucketManager.deleteBuckets();
    await testTransferJobManager.cleanUp();
    await testQueueManager.deleteSqsQueues();
  });

  it('should create an event driven aws transfer', async () => {
    const output = await runSample('event-driven-aws-transfer', [
      projectId,
      s3SourceBucket,
      gcsSinkBucket,
      sqsQueueArn,
    ]);

    assert.include(output, 'transferJobs/');

    // If it ran successfully and a job was created, delete it to clean up
    const [jobName] = output.match(/transferJobs.*/);

    testTransferJobManager.transferJobToCleanUp(jobName);
  });
});

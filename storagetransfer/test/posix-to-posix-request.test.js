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

const fs = require('fs').promises;
const os = require('os');
const path = require('path');

const {assert} = require('chai');
const {after, before, describe, it} = require('mocha');

const {BucketManager, TransferJobManager, runSample} = require('./utils');

describe('posix-to-posix-request', () => {
  const testBucketManager = new BucketManager();
  const testTransferJobManager = new TransferJobManager();

  let projectId;
  let sourceAgentPoolName;
  let sinkAgentPoolName;
  let rootDirectory;
  let destinationDirectory;
  let bucketName;

  let tempFile;

  before(async () => {
    projectId = await testTransferJobManager.client.getProjectId();

    // Use default pool
    sourceAgentPoolName = '';
    sinkAgentPoolName = '';

    rootDirectory = await fs.mkdtemp(
      path.join(os.tmpdir(), 'sts-posix-to-posix-request-test-src-')
    );

    destinationDirectory = await fs.mkdtemp(
      path.join(os.tmpdir(), 'sts-posix-to-posix-request-test-sink-')
    );

    bucketName = (await testBucketManager.generateGCSBucket()).name;

    tempFile = path.join(rootDirectory, 'text.txt');
    await fs.writeFile(tempFile, 'test data');
  });

  after(async () => {
    await testBucketManager.deleteBuckets();
    await testTransferJobManager.cleanUp();

    await fs.unlink(tempFile);
    await fs.rmdir(rootDirectory);
  });

  it('should create a transfer job from POSIX to POSIX', async () => {
    const output = await runSample('posix-to-posix-request', [
      projectId,
      sourceAgentPoolName,
      sinkAgentPoolName,
      rootDirectory,
      destinationDirectory,
      bucketName,
    ]);

    // If it ran successfully and a job was created, delete it to clean up
    const [jobName] = output.match(/transferJobs.*/);
    if (jobName) {
      testTransferJobManager.transferJobToCleanUp(jobName);
    }

    // Find at least 1 transfer operation from the transfer job in the output
    assert.include(output, 'Created and ran a transfer job');
  });
});

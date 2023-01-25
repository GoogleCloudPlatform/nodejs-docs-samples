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

describe('check-latest-transfer-operation', () => {
  const testBucketManager = new BucketManager();
  const testTransferJobManager = new TransferJobManager();

  let projectId;
  let transferJob;

  before(async () => {
    projectId = await testBucketManager.getProjectId();
    const result = await testTransferJobManager.createTestTransferJob();

    transferJob = result.transferJob;
  });

  after(async () => {
    await testBucketManager.deleteBuckets();
    await testTransferJobManager.cleanUp();
  });

  it('should check latest transfer operation', async () => {
    await testTransferJobManager.client.runTransferJob({
      projectId,
      jobName: transferJob.name,
    });

    const output = await runSample('check-latest-transfer-operation', [
      projectId,
      transferJob.name,
    ]);

    const formattedTransferJob = transferJob.name.replace('/', '-');

    // Find the transfer operation from the transfer job in the output
    assert.include(output, `transferOperations/${formattedTransferJob}-`);
  });
});

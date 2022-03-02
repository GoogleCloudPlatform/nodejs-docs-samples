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

describe('get-transfer-job-with-retries', () => {
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

  it('should get a transfer job with retries', async () => {
    const output = await runSample('get-transfer-job-with-retries', [
      projectId,
      transferJob.name,
    ]);

    assert.include(output, `Fetched transfer job: ${transferJob.name}`);
  });
});

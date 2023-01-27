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

describe('aws-s3-compatible-source-request', () => {
  const testBucketManager = new BucketManager();
  const testTransferJobManager = new TransferJobManager();
  const {NetworkProtocol, RequestModel, AuthMethod} =
    TransferJobManager.protos.storagetransfer.v1.S3CompatibleMetadata;

  let projectId;
  let sourceAgentPoolName;
  let sourceBucketName;
  let sourcePath;
  let gcsSinkBucket;
  let gcsPath;
  let region;
  let endpoint;
  let protocol;
  let requestModel;
  let authMethod;

  before(async () => {
    projectId = await testTransferJobManager.client.getProjectId();

    // Use default pool
    sourceAgentPoolName = '';

    const sourceBucket = await testBucketManager.generateGCSBucket();
    sourceBucketName = sourceBucket.name;
    sourcePath = 'path/to/data/';

    gcsSinkBucket = (await testBucketManager.generateGCSBucket()).name;
    gcsPath = 'path/to/data/';

    region = sourceBucket.getMetadata().location;
    endpoint = sourceBucket.baseUrl;
    protocol = NetworkProtocol.NETWORK_PROTOCOL_HTTPS;
    requestModel = RequestModel.REQUEST_MODEL_VIRTUAL_HOSTED_STYLE;
    authMethod = AuthMethod.AUTH_METHOD_AWS_SIGNATURE_V4;
  });

  after(async () => {
    await testBucketManager.deleteBuckets();
    await testTransferJobManager.cleanUp();
  });

  it('should create a transfer job from an AWS S3-compatible source to GCS', async () => {
    const output = await runSample('aws-s3-compatible-source-request', [
      projectId,
      sourceAgentPoolName,
      sourceBucketName,
      sourcePath,
      gcsSinkBucket,
      gcsPath,
      region,
      endpoint,
      protocol,
      requestModel,
      authMethod,
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

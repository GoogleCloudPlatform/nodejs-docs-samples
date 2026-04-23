// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const {Storage} = require('@google-cloud/storage');
const {assert} = require('chai');
const {before, after, afterEach, it} = require('mocha');
const cp = require('child_process');
const uuid = require('uuid');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const storage = new Storage();
const samplesTestBucketPrefix = `nodejs-storage-samples-${uuid.v4()}`;
const bucketName = `${samplesTestBucketPrefix}-a`;
const defaultKmsKeyName = process.env.GOOGLE_CLOUD_KMS_KEY_ASIA;
const bucket = storage.bucket(bucketName);

before(async () => {
  await storage.createBucket(bucketName);
});

async function deleteAllBucketsAsync() {
  const [buckets] = await storage.getBuckets({prefix: samplesTestBucketPrefix});

  for (const bucket of buckets) {
    await bucket.deleteFiles({force: true});
    await bucket.delete({ignoreNotFound: true});
  }
}

after(deleteAllBucketsAsync);
afterEach(async () => {
  await new Promise(res => setTimeout(res, 1000));
});

it('should set bucket encryption enforcement configuration', async () => {
  const output = execSync(
    `node setBucketEncryptionEnforcementConfig.js ${bucketName} ${defaultKmsKeyName}`
  );

  assert.include(
    output,
    `Encryption enforcement configuration updated for bucket ${bucketName}.`
  );

  assert.include(output, `Default KMS Key: ${defaultKmsKeyName}`);

  assert.include(output, 'Google Managed (GMEK) Enforcement:');
  assert.include(output, 'Mode: FullyRestricted');

  assert.include(output, 'Customer Managed (CMEK) Enforcement:');
  assert.include(output, 'Mode: NotRestricted');

  assert.include(output, 'Customer Supplied (CSEK) Enforcement:');
  assert.include(output, 'Mode: FullyRestricted');

  assert.match(output, new RegExp('Effective:'));

  const [metadata] = await bucket.getMetadata();
  assert.strictEqual(
    metadata.encryption.googleManagedEncryptionEnforcementConfig
      .restrictionMode,
    'FullyRestricted'
  );
});

it('should get bucket encryption enforcement configuration', async () => {
  const output = execSync(
    `node getBucketEncryptionEnforcementConfig.js ${bucketName}`
  );

  assert.include(
    output,
    `Encryption enforcement configuration for bucket ${bucketName}.`
  );
  assert.include(output, `Default KMS Key: ${defaultKmsKeyName}`);

  assert.include(output, 'Google Managed (GMEK) Enforcement:');
  assert.include(output, 'Mode: FullyRestricted');
  assert.match(output, /Effective:/);
});

it('should update and then remove bucket encryption enforcement configuration', async () => {
  const output = execSync(
    `node updateBucketEncryptionEnforcementConfig.js ${bucketName}`
  );

  assert.include(
    output,
    `Google-managed encryption enforcement set to FullyRestricted for ${bucketName}.`
  );
  assert.include(
    output,
    `All encryption enforcement configurations removed from bucket ${bucketName}.`
  );

  const [metadata] = await bucket.getMetadata();
  assert.ok(!metadata.encryption);
});

// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const {Storage, Bucket} = require('@google-cloud/storage');
const {StorageControlClient} = require('@google-cloud/storage-control').v2;
const cp = require('child_process');
const {assert} = require('chai');
const {describe, it, before, after} = require('mocha');
const uuid = require('uuid');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const bucketPrefix = `storage-control-samples-${uuid.v4()}`;
const bucketName = `${bucketPrefix}-a`;
const controlClient = new StorageControlClient();
const storage = new Storage({projectId: 'storage-sdk-vendor'});
const bucket = new Bucket(storage, bucketName);
const location = 'us-west1';
const cacheName = 'us-west1-c';
let anywhereCachePath;

describe('Anywhere Cache', () => {
  before(async () => {
    await storage.createBucket(bucketName, {
      iamConfiguration: {
        uniformBucketLevelAccess: {
          enabled: true,
        },
      },
      hierarchicalNamespace: {enabled: true},
      location: location,
    });

    anywhereCachePath = controlClient.anywhereCachePath(
      '_',
      bucketName,
      cacheName
    );
  });

  after(async function () {
    // Sets the timeout for the test to 3600000 milliseconds (1 hour).
    // This is necessary for long-running operations, such as waiting for a
    // cache to be disabled, to prevent the test from failing due to a timeout.
    this.timeout(3600000);
    let caches = false;
    // The `while` loop will continue to run as long as the `caches` flag is `false`.
    while (!caches) {
      await new Promise(resolve => setTimeout(resolve, 30000));
      const bucketPath = controlClient.bucketPath('_', bucketName);

      try {
        // Call the `listAnywhereCaches` method to check for any active caches.
        // The response is an array of caches.
        const [response] = await controlClient.listAnywhereCaches({
          parent: bucketPath,
        });
        // Check if the response array is empty. If so, it means there are no more caches, and we can exit the loop.
        if (response.length === 0) {
          // Set `caches` to `true` to break out of the `while` loop.
          caches = true;
        }
      } catch (err) {
        console.error('Error while polling:', err.message);
        break;
      }
    }
    // After the loop has finished (i.e., no more caches are found), we proceed with deleting the bucket.
    await bucket.delete();
  });

  it('should create an anywhere cache', async function () {
    // Sets the timeout for the test to 3600000 milliseconds (1 hour).
    // This is necessary for long-running operations, such as waiting for a
    // cache to be created, to prevent the test from failing due to a timeout.
    this.timeout(3600000);
    const output = execSync(
      `node createAnywhereCache.js ${bucketName} ${location} ${cacheName}`
    );
    assert.match(output, /Created anywhere cache:/);
    assert.match(output, new RegExp(anywhereCachePath));
  });

  it('should get an anywhere cache', async () => {
    const output = execSync(
      `node getAnywhereCache.js ${bucketName} ${cacheName}`
    );
    assert.match(output, /Got anywhere cache:/);
    assert.match(output, new RegExp(anywhereCachePath));
  });

  it('should list anywhere caches', async () => {
    const output = execSync(`node listAnywhereCaches.js ${bucketName}`);
    assert.match(output, new RegExp(anywhereCachePath));
  });

  it('should update an anywhere cache', async () => {
    const admissionPolicy = 'admit-on-second-miss';
    const output = execSync(
      `node updateAnywhereCache.js ${bucketName} ${cacheName} ${admissionPolicy}`
    );
    assert.match(output, /Updated anywhere cache:/);
    assert.match(output, new RegExp(anywhereCachePath));
  });

  it('should pause an anywhere cache', async () => {
    const output = execSync(
      `node pauseAnywhereCache.js ${bucketName} ${cacheName}`
    );
    assert.match(output, /Paused anywhere cache:/);
    assert.match(output, new RegExp(anywhereCachePath));
  });

  it('should resume an anywhere cache', async () => {
    const output = execSync(
      `node resumeAnywhereCache.js ${bucketName} ${cacheName}`
    );
    assert.match(output, /Resumed anywhere cache:/);
    assert.match(output, new RegExp(anywhereCachePath));
  });

  it('should disable an anywhere cache', async () => {
    const output = execSync(
      `node disableAnywhereCache.js ${bucketName} ${cacheName}`
    );
    assert.match(output, /Disabled anywhere cache:/);
    assert.match(output, new RegExp(anywhereCachePath));
  });
});

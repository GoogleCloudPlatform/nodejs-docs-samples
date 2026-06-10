// Copyright 2026 Google LLC
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
const cp = require('child_process');
const {assert} = require('chai');
const {describe, it, before, after} = require('mocha');
const uuid = require('uuid');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const bucketPrefix = `storage-control-samples-${uuid.v4()}`;
const bucketName = `${bucketPrefix}-a`;
const storage = new Storage();
const bucket = new Bucket(storage, bucketName);
const folderName = uuid.v4();

describe('deleteFolderRecursive', () => {
  before(async () => {
    await storage.createBucket(bucketName, {
      iamConfiguration: {
        uniformBucketLevelAccess: {
          enabled: true,
        },
      },
      hierarchicalNamespace: {enabled: true},
    });

    // Create a folder to delete
    execSync(`node createFolder.js ${bucketName} ${folderName}`);
  });

  after(async () => {
    try {
      await bucket.deleteFiles({force: true});
    } catch (e) {
      // ignore
    }
    await bucket.delete();
  });

  it('should delete a folder recursively', async () => {
    const output = execSync(
      `node deleteFolderRecursive.js ${bucketName} ${folderName}`
    );
    assert.match(output, /Deleted folder recursively:/);
    assert.match(output, new RegExp(folderName));
  });
});

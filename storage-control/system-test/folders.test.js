// Copyright 2024 Google LLC
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
const renamedFolderName = uuid.v4();

describe('Folders', () => {
  before(async () => {
    await storage.createBucket(bucketName, {
      iamConfiguration: {
        uniformBucketLevelAccess: {
          enabled: true,
        },
      },
      hierarchicalNamespace: {enabled: true},
    });
  });

  after(async () => {
    await bucket.delete();
  });

  it('should create a folder', async () => {
    const output = execSync(`node createFolder.js ${bucketName} ${folderName}`);
    assert.match(output, /Created folder:/);
    assert.match(output, new RegExp(folderName));
  });

  it('should get a folder', async () => {
    const output = execSync(`node getFolder.js ${bucketName} ${folderName}`);
    assert.match(output, /Got folder:/);
    assert.match(output, new RegExp(folderName));
  });

  it('should list folders', async () => {
    const output = execSync(`node listFolders.js ${bucketName}`);
    assert.match(output, new RegExp(folderName));
  });

  // Skipping for now due to operation not supporting custom billing projects.
  it.skip('should rename a folder', async () => {
    const output = execSync(
      `node renameFolder.js ${bucketName} ${folderName} ${renamedFolderName}`
    );
    assert.match(
      output,
      new RegExp(`Renamed folder ${folderName} ${renamedFolderName}.`)
    );
  });

  it('should delete a folder', async () => {
    // Change folderName to renamedFolderName once the previous test is enabled.
    const output = execSync(`node deleteFolder.js ${bucketName} ${folderName}`);
    assert.match(output, /Deleted folder:/);
    assert.match(output, new RegExp(folderName));
  });
});

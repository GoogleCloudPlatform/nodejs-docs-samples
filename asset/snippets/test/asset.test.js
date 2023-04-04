// Copyright 2023 Google LLC
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

const {assert} = require('chai');
const {after, before, describe, it} = require('mocha');
const sinon = require('sinon');
const uuid = require('uuid');

const {Storage} = require('@google-cloud/storage');

const cp = require('child_process');
const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('asset sample tests', () => {
  let bucket;
  let bucketName;
  let fileSuffix;
  const suffix = uuid.v4();

  before(async () => {
    const storage = new Storage();
    fileSuffix = `${suffix}`;

    bucketName = `asset-nodejs-${suffix}`;
    bucket = storage.bucket(bucketName);
    await bucket.create();
  });

  after(async () => {
    await bucket.delete();
  });

  const stubConsole = function () {
    sinon.stub(console, 'error');
    sinon.stub(console, 'log');
  };
  const restoreConsole = function () {
    console.log.restore();
    console.error.restore();
  };

  beforeEach(stubConsole);
  afterEach(restoreConsole);

  it('should export assets to specified path', async () => {
    const dumpFilePath = `gs://${bucketName}/my-assets-${fileSuffix}.txt`;
    execSync(`node exportAssets ${dumpFilePath}`);
    let waitMs = 4000;
    let exists = false;
    let file;
    for (let retry = 0; retry < 3 && !exists; ++retry) {
      await sleep((waitMs *= 2));
      file = await bucket.file(`my-assets-${fileSuffix}.txt`);
      exists = await file.exists();
    }
    assert.ok(exists);
    await file.delete();
  });

  it.skip('should export asset relationships to specified path', async () => {
    const dumpFilePath = `gs://${bucketName}/my-relationships-${fileSuffix}.txt`;
    const contentType = 'RELATIONSHIP';
    execSync(`node exportAssets ${dumpFilePath} ${contentType}`);
    let waitMs = 4000;
    let exists = false;
    let file;
    for (let retry = 0; retry < 3 && !exists; ++retry) {
      await sleep((waitMs *= 2));
      file = await bucket.file(`my-relationships-${fileSuffix}.txt`);
      exists = await file.exists();
    }
    assert.ok(exists);
    await file.delete();
  });

  // The assets returned within 'readTimeWindow' frequently do not include
  // the newly created bucket:
  it('should get assets history successfully', async () => {
    const assetName = `//storage.googleapis.com/${bucketName}`;
    let waitMs = 1000;
    let included = false;
    for (let retry = 0; retry < 3 && !included; ++retry) {
      await sleep((waitMs *= 2));
      const stdout = execSync(
        `node getBatchAssetHistory ${assetName} 'RESOURCE'`
      );
      included = stdout.includes(assetName);
    }
    assert.ok(included);
  });

  it('should list assets successfully', async () => {
    const assetType = 'storage.googleapis.com/Bucket';
    const stdout = execSync(`node listAssets ${assetType} 'RESOURCE'`);
    assert.include(stdout, assetType);
  });

  it.skip('should list asset relationship successfully', async () => {
    const assetType = '';
    const stdout = execSync(`node listAssets ${assetType} 'RELATIONSHIP'`);
    assert.include(stdout, 'relatedAsset');
  });
});

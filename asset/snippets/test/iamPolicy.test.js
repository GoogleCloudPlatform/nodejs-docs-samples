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

'use strict';

const {assert} = require('chai');
const {after, before, describe, it} = require('mocha');
const sinon = require('sinon');
const uuid = require('uuid');

const cp = require('child_process');
const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const {Storage} = require('@google-cloud/storage');

const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery();
const options = {
  location: 'US',
};
const datasetId = `asset_nodejs_${uuid.v4()}`.replace(/-/gi, '_');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('iam policy sample tests', () => {
  let bucket;
  let bucketName;

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

  before(async () => {
    bucketName = `asset-nodejs-${uuid.v4()}`;
    bucket = new Storage().bucket(bucketName);
    await bucket.create();
    await bigquery.createDataset(datasetId, options);
    await bigquery.dataset(datasetId).exists();
  });

  after(async () => {
    await bucket.delete();
    await bigquery.dataset(datasetId).delete({force: true}).catch(console.warn);
  });

  it('should search all iam policies successfully', async () => {
    const query = 'policy:roles/owner';
    const stdout = execSync(`node searchAllIamPolicies '' ${query}`);
    assert.include(stdout, 'roles/owner');
  });

  it('should analyze iam policy successfully', async () => {
    const stdout = execSync('node analyzeIamPolicy');
    assert.include(stdout, '//cloudresourcemanager.googleapis.com/projects');
  });

  it('should analyze iam policy and write analysis results to gcs successfully', async () => {
    const uri = `gs://${bucketName}/my-analysis.json`;
    execSync(`node analyzeIamPolicyLongrunningGcs ${uri}`);
    let waitMs = 1000;
    let exists = false;
    let file;
    for (let retry = 0; retry < 3 && !exists; ++retry) {
      await sleep((waitMs *= 2));
      file = await bucket.file('my-analysis.json');
      exists = await file.exists();
    }
    assert.ok(exists);
    await file.delete();
  });

  it('should analyze iam policy and write analysis results to bigquery successfully', async () => {
    const tablePrefix = 'analysis_nodejs';
    execSync(
      `node analyzeIamPolicyLongrunningBigquery ${datasetId} ${tablePrefix}`
    );
    let waitMs = 4000;
    let metadataTable;
    let metadataTable_exists = false;
    let resultsTable;
    let resultsTable_exists = false;

    for (
      let retry = 0;
      retry < 3 && !(metadataTable_exists || resultsTable_exists);
      ++retry
    ) {
      await sleep((waitMs *= 2));
      metadataTable = bigquery
        .dataset(datasetId)
        .table('analysis_nodejs_analysis');
      metadataTable_exists = await metadataTable.exists();
      resultsTable = bigquery
        .dataset(datasetId)
        .table('analysis_nodejs_analysis_result');
      resultsTable_exists = await resultsTable.exists();
    }

    assert.ok(metadataTable_exists);
    assert.ok(resultsTable_exists);
    await metadataTable.delete();
    await resultsTable.delete();
  });

  it('should get effective iam policies successfully', async () => {
    const assetName = `//storage.googleapis.com/${bucketName}`;
    const stdout = execSync(`node getBatchEffectiveIamPolicies ${assetName}`);
    assert.include(stdout, assetName);
  });
});

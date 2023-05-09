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

const orgId = 'organizations/474566717491'; // This is the id of ipa1.joonix.net, a test organization owned by mdb.cloud-asset-analysis-team@google.com

describe('org policy analyzer sample tests', () => {
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

  it('should analyze org policies successfully', async () => {
    const constraint =
      'constraints/iam.allowServiceAccountCredentialLifetimeExtension';
    const stdout = execSync(`node analyzeOrgPolicies ${orgId} ${constraint}`);
    assert.include(stdout, '//cloudresourcemanager.googleapis.com/' + orgId);
  });

  it('should analyze org policy governed assets successfully', async () => {
    const constraint = 'constraints/iam.allowedPolicyMemberDomains';
    const stdout = execSync(
      `node analyzeOrgPolicyGovernedAssets ${orgId} ${constraint}`
    );
    assert.include(stdout, '//cloudresourcemanager.googleapis.com/projects');
  });

  it('should should analyze org policy governed containers successfully', async () => {
    const constraint = 'constraints/iam.allowedPolicyMemberDomains';
    const stdout = execSync(
      `node analyzeOrgPolicyGovernedContainers ${orgId} ${constraint}`
    );
    assert.include(stdout, '//cloudresourcemanager.googleapis.com/' + orgId);
  });
});

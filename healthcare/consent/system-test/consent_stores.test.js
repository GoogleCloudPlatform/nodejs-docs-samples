// Copyright 2022 Google LLC
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

const path = require('path');
const assert = require('assert');
const uuid = require('uuid');
const {execSync} = require('child_process');
const healthcare = require('@googleapis/healthcare');

const cloudRegion = 'us-central1';
const defaultConsentTtl = '172800s';

const cwdDatasets = path.join(__dirname, '../../datasets');
const cwd = path.join(__dirname, '..');

const datasetId = `nodejs-docs-samples-test-${uuid.v4()}`.replace(/-/gi, '_');
const consentStoreId =
  `nodejs-docs-samples-test-consent-store${uuid.v4()}`.replace(/-/gi, '_');

const installDeps = 'npm install';

// Run npm install on datasets directory because modalities
// require bootstrapping datasets, and Kokoro needs to know
// to install dependencies from the datasets directory.
assert.ok(execSync(installDeps, {cwd: `${cwdDatasets}`, shell: true}));
let projectId;
before(async () => {
  projectId = await healthcare.auth.getProjectId();
  execSync(`node createDataset.js ${projectId} ${cloudRegion} ${datasetId}`, {
    cwd: cwdDatasets,
  });
});

after(async () => {
  try {
    execSync(`node deleteDataset.js ${projectId} ${cloudRegion} ${datasetId}`, {
      cwd: cwdDatasets,
    });
  } catch (err) {
    // ignore error
  }
});

it('should create a consent store', () => {
  const output = execSync(
    `node createConsentStore.js ${projectId} ${cloudRegion} ${datasetId} ${consentStoreId}`,
    {cwd}
  );
  assert.ok(output.includes('Created consent store'));
});

it('should get a consent store', () => {
  const output = execSync(
    `node getConsentStore.js ${projectId} ${cloudRegion} ${datasetId} ${consentStoreId}`,
    {cwd}
  );
  assert.ok(output.includes('name'));
});

it('should patch a consent store', () => {
  const output = execSync(
    `node patchConsentStore.js ${projectId} ${cloudRegion} ${datasetId} ${consentStoreId} ${defaultConsentTtl}`,
    {cwd}
  );
  assert.ok(output.includes('Patched consent store'));
});

it('should list consent stores', () => {
  const output = execSync(
    `node listConsentStores.js ${projectId} ${cloudRegion} ${datasetId}`,
    {cwd}
  );
  assert.ok(output.includes('consentStores'));
});

it('should create and get a consent store IAM policy', () => {
  const localMember = 'group:dpebot@google.com';
  const localRole = 'roles/viewer';

  let output = execSync(
    `node setConsentStoreIamPolicy.js ${projectId} ${cloudRegion} ${datasetId} ${consentStoreId} ${localMember} ${localRole}`,
    {cwd}
  );
  assert.ok(output.includes, 'ETAG');

  output = execSync(
    `node getConsentStoreIamPolicy.js ${projectId} ${cloudRegion} ${datasetId} ${consentStoreId}`
  );
  assert.ok(output.includes('dpebot'));
});

it('should delete a consent store', () => {
  const output = execSync(
    `node deleteConsentStore.js ${projectId} ${cloudRegion} ${datasetId} ${consentStoreId}`,
    {cwd}
  );
  assert.ok(output.includes('Deleted consent store'));
});

// Copyright 2018 Google LLC
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

const projectId = process.env.GCLOUD_PROJECT;
const datasetId = `dataset-${uuid.v4()}`.replace(/-/gi, '_');
const destinationDatasetId = `destination-${uuid.v4()}`.replace(/-/gi, '_');
const keeplistTags = 'PatientID';
const cloudRegion = 'us-central1';

before(() => {
  assert(
    process.env.GCLOUD_PROJECT,
    `Must set GCLOUD_PROJECT environment variable!`
  );
  assert(
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    `Must set GOOGLE_APPLICATION_CREDENTIALS environment variable!`
  );
});
after(() => {
  try {
    execSync(
      `node deleteDataset.js ${projectId} ${cloudRegion} ${destinationDatasetId}`
    );
    // eslint-disable-next-line no-empty
  } catch (err) {} // Ignore error
});

it('should create a dataset', () => {
  const output = execSync(
    `node createDataset.js ${projectId} ${cloudRegion} ${datasetId}`
  );
  assert.ok(output.includes('Created dataset'));
});

it('should get a dataset', () => {
  const output = execSync(
    `node getDataset.js ${projectId} ${cloudRegion} ${datasetId}`,
  );
  assert.ok(output.includes('name'));
});

it('should patch a dataset', () => {
  const timeZone = 'GMT';
  const output = execSync(
    `node patchDataset.js ${projectId} ${cloudRegion} ${datasetId} ${timeZone}`,
  );
  assert.ok(
    output.includes('patched with time zone')
  );
});

it('should list datasets', () => {
  const output = execSync(`node listDatasets.js ${projectId} ${cloudRegion}`, {
  });
  assert.ok(output.includes('datasets'));
});

it('should de-identify data in a dataset and write to a new dataset', () => {
  const output = execSync(
    `node deidentifyDataset.js ${projectId} ${cloudRegion} ${datasetId} ${destinationDatasetId} ${keeplistTags}`,
  );
  assert.ok(
    output.includes('De-identified data written')
  );
});

it('should create and get a dataset IAM policy', () => {
  const localMember = 'group:dpebot@google.com';
  const localRole = 'roles/viewer';

  let output = execSync(
    `node setDatasetIamPolicy.js ${projectId} ${cloudRegion} ${datasetId} ${localMember} ${localRole}`,
  );
  assert.ok(output.includes, 'ETAG');

  output = execSync(
    `node getDatasetIamPolicy.js ${projectId} ${cloudRegion} ${datasetId}`
  );
  assert.ok(output.includes('dpebot'));
});

it('should delete a dataset', () => {
  const output = execSync(
    `node deleteDataset.js ${projectId} ${cloudRegion} ${datasetId}`,
  );
  assert.ok(output.includes('Deleted dataset'));
});

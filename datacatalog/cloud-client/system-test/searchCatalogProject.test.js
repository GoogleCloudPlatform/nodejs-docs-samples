// Copyright 2020 Google LLC
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
const cwd = path.join(__dirname, '..');
const {exec} = require('child_process');
const uuid = require('uuid');
const generateUuid = () => `datacatalog-tests-${uuid.v4()}`.replace(/-/gi, '_');
const datasetId = generateUuid();
const {BigQuery} = require('@google-cloud/bigquery');

const bigquery = new BigQuery();

before(async () => {
  assert(
    process.env.GCLOUD_PROJECT,
    `Must set GCLOUD_PROJECT environment variable!`
  );
  assert(
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    `Must set GOOGLE_APPLICATION_CREDENTIALS environment variable!`
  );

  await bigquery.createDataset(datasetId);
});
after(async () => {
  await bigquery
    .dataset(datasetId)
    .delete({force: true})
    .catch(console.warn);
});

describe('searchCatalog project', () => {
  it('should return a dataset entry', (done) => {
    const projectId = process.env.GCLOUD_PROJECT;
    const query = 'type=dataset';
    const expectedLinkedResource = `//bigquery.googleapis.com/projects/${projectId}/datasets/${datasetId}`;
    exec(
      `node searchCatalogProject.js ${projectId} ${query}`,
      {cwd},
      (err, stdout) => {
        // ADD line to test return on kokoro build
        console.log(`search-project: ${stdout} ${err}`)
        assert.ok(stdout.includes(expectedLinkedResource));
        done();
      }
    );
  });
});

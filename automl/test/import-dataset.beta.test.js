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

const {assert} = require('chai');
const {describe, it} = require('mocha');
const {AutoMlClient} = require('@google-cloud/automl').v1beta1;

const cp = require('child_process');

const IMPORT_DATASET_REGION_TAG = 'beta/import-dataset';
const LOCATION = 'us-central1';

describe('Automl Import Dataset Test', () => {
  const client = new AutoMlClient();

  it('should import a dataset', async () => {
    // As importing a dataset can take a long time, instead try to import to a
    // nonexistent dataset and confirm that the dataset was not found, but
    // other elements of the request were valid.
    const projectId = await client.getProjectId();
    const data = `gs://${projectId}-automl-translate/en-ja-short.csv`;
    const args = [
      IMPORT_DATASET_REGION_TAG,
      projectId,
      LOCATION,
      'TEN0000000000000000000',
      data,
    ];
    const output = cp.spawnSync('node', args, {encoding: 'utf8'});

    assert.match(output.stderr, /NOT_FOUND/);
  });
});

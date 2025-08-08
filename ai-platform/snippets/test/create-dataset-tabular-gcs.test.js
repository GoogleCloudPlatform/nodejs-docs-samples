/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const path = require('path');
const {assert} = require('chai');
const {after, describe, it} = require('mocha');

const uuid = require('uuid').v4;
const cp = require('child_process');
const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

const datasetDisplayName = `temp_create_dataset_tables_gcs_test_${uuid()}`;
const gcsSourceUri = 'gs://cloud-ml-tables-data/bank-marketing.csv';
const project = process.env.CAIP_PROJECT_ID;
const location = 'us-central1';

let datasetId;

describe('AI platform create dataset tabular gcs', () => {
  it('should create a new gcs tabular dataset in the parent resource', async () => {
    const stdout = execSync(
      `node ./create-dataset-tabular-gcs.js ${datasetDisplayName} \
                                             ${gcsSourceUri} \
                                             ${project} ${location}`,
      {
        cwd,
      }
    );
    assert.match(stdout, /Create dataset tabular gcs response/);
    datasetId = stdout
      .split('/locations/us-central1/datasets/')[1]
      .split('/')[0]
      .split('/')[0];
  });
  after('should delete created dataset', async () => {
    execSync(`node ./delete-dataset.js ${datasetId} ${project} ${location}`, {
      cwd,
    });
  });
});

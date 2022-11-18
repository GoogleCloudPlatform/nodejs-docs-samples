// Copyright 2020 Google LLC
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

'use strict';

const {assert} = require('chai');
const {after, describe, it} = require('mocha');
const {AutoMlClient} = require('@google-cloud/automl').v1beta1;

const cp = require('child_process');
const uuid = require('uuid');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const CREATE_DATASET_REGION_TAG = 'beta/video-classification-create-dataset';
const LOCATION = 'us-central1';

describe('Automl Video Classification Create Dataset Test', () => {
  const client = new AutoMlClient();
  let datasetId;

  it('should create a dataset', async () => {
    const projectId = await client.getProjectId();
    const displayName = `test_${uuid.v4().replace(/-/g, '_').substring(0, 26)}`;

    // create
    const create_output = execSync(
      `node ${CREATE_DATASET_REGION_TAG}.js ${projectId} ${LOCATION} ${displayName}`
    );
    assert.match(create_output, /Dataset id:/);

    datasetId = create_output.split('Dataset id: ')[1].split('\n')[0];
  });

  after('delete created dataset', async () => {
    const projectId = await client.getProjectId();
    const request = {
      name: client.datasetPath(projectId, LOCATION, datasetId),
    };
    const [operation] = await client.deleteDataset(request);
    await operation.promise();
  });
});

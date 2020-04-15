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
const {describe, it, before} = require('mocha');
const {AutoMlClient} = require('@google-cloud/automl').v1beta1;

const cp = require('child_process');
const uuid = require('uuid');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const DELETE_DATASET_REGION_TAG = 'beta/delete-dataset';
const LOCATION = 'us-central1';

describe('Automl Translate Delete Dataset Tests', () => {
  const client = new AutoMlClient();
  let datasetId;

  before('should create a dataset', async () => {
    const projectId = await client.getProjectId();
    const displayName = `test_${uuid.v4().replace(/-/g, '_').substring(0, 26)}`;
    const request = {
      parent: client.locationPath(projectId, LOCATION),
      dataset: {
        displayName: displayName,
        translationDatasetMetadata: {
          sourceLanguageCode: 'en',
          targetLanguageCode: 'ja',
        },
      },
    };
    const [response] = await client.createDataset(request);
    datasetId = response.name
      .split('/')
      [response.name.split('/').length - 1].split('\n')[0];
  });

  it('should delete a dataset', async () => {
    const projectId = await client.getProjectId();
    const delete_output = execSync(
      `node ${DELETE_DATASET_REGION_TAG}.js ${projectId} ${LOCATION} ${datasetId}`
    );
    assert.match(delete_output, /Dataset deleted/);
  });
});

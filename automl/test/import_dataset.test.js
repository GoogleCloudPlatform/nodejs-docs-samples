// Copyright 2019 Google LLC
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
const {AutoMlClient} = require('@google-cloud/automl').v1;

const cp = require('child_process');
const uuid = require('uuid');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const IMPORT_DATASET_REGION_TAG = 'import_dataset';
const LOCATION = 'us-central1';
const TWENTY_MINUTES_IN_SECONDS = 60 * 20;
const {delay} = require('./util');

describe('Automl Import Dataset Test', () => {
  const client = new AutoMlClient();
  let datasetId;

  before(async () => {
    await cleanupOldDatasets();
  });

  async function cleanupOldDatasets() {
    const projectId = await client.getProjectId();
    let request = {
      parent: client.locationPath(projectId, LOCATION),
      filter: 'translation_dataset_metadata:*',
    };
    const [response] = await client.listDatasets(request);
    for (const dataset of response) {
      try {
        const id = dataset.name
          .split('/')
          [dataset.name.split('/').length - 1].split('\n')[0];
        console.info(`checking dataset ${id}`);
        if (id.match(/test_[0-9a-f]{8}/)) {
          console.info(`deleting dataset ${id}`);
          if (
            dataset.createTime.seconds - Date.now() / 1000 >
            TWENTY_MINUTES_IN_SECONDS
          ) {
            console.info(`dataset ${id} is greater than 20 minutes old`);
            request = {
              name: client.datasetPath(projectId, LOCATION, id),
            };
            const [operation] = await client.deleteDataset(request);
            await operation.promise();
          }
        }
      } catch (err) {
        console.warn(err);
      }
    }
  }

  it('should create a dataset', async function () {
    this.retries(5);
    await delay(this.test);
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
    const [operation] = await client.createDataset(request);
    const [response] = await operation.promise();
    datasetId = response.name
      .split('/')
      [response.name.split('/').length - 1].split('\n')[0];
  });

  it('should import dataset', async function () {
    this.retries(5);
    await delay(this.test);
    const projectId = await client.getProjectId();
    const data = `gs://${projectId}-automl-translate/en-ja-short.csv`;
    const import_output = execSync(
      `node ${IMPORT_DATASET_REGION_TAG}.js ${projectId} ${LOCATION} ${datasetId} ${data}`
    );
    assert.match(import_output, /Dataset imported/);
  });

  it('should delete created dataset', async function () {
    this.retries(5);
    await delay(this.test);
    const projectId = await client.getProjectId();
    const request = {
      name: client.datasetPath(projectId, LOCATION, datasetId),
    };
    const [operation] = await client.deleteDataset(request);
    await operation.promise();
  });
});

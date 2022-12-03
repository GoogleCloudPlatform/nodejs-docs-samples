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
const {describe, it, after} = require('mocha');
const {AutoMlClient} = require('@google-cloud/automl').v1;
const {Storage} = require('@google-cloud/storage');

const cp = require('child_process');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const DATASET_ID = 'TRL8522556519449886720';
const EXPORT_DATASET_REGION_TAG = 'export_dataset';
const LOCATION = 'us-central1';

const {delay} = require('./util');

describe('Automl Translate Dataset Tests', () => {
  const client = new AutoMlClient();
  const prefix = 'TEST_EXPORT_OUTPUT';

  it('should export a datset', async function () {
    this.retries(4);
    await delay(this.test);
    const projectId = await client.getProjectId();
    const bucketName = `${projectId}-automl-translate`;
    const export_output = execSync(
      `node ${EXPORT_DATASET_REGION_TAG}.js ${projectId} ${LOCATION} ${DATASET_ID} gs://${bucketName}/${prefix}/`
    );

    assert.match(export_output, /Dataset exported/);
  });

  after('delete created files', async () => {
    const projectId = await client.getProjectId();
    const bucketName = `${projectId}-automl-translate`;

    const storageClient = new Storage();
    const options = {
      prefix: prefix,
    };
    const [files] = await storageClient
      .bucket(`gs://${bucketName}`)
      .getFiles(options);

    for (const file of files) {
      await storageClient.bucket(`gs://${bucketName}`).file(file.name).delete();
    }
  });
});

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

const modelDisplayName = `temp_upload_model_test${uuid()}`;
const imageUri =
  'gcr.io/cloud-ml-service-public/cloud-ml-online-prediction-model-server-cpu:v1_15py3cmle_op_images_20200229_0210_RC00';
const artifactUri = 'gs://ucaip-samples-us-central1/model/explain/';
const project = process.env.CAIP_PROJECT_ID;
const location = 'us-central1';

let modelId;

describe('AI platform upload model', () => {
  it('should upload the specified model', async () => {
    const stdout = execSync(
      `node ./upload-model.js ${modelDisplayName} \
        ${imageUri} \
        ${artifactUri} \
        ${project} \
        ${location}`,
      {
        cwd,
      }
    );
    console.log(stdout);
    assert.match(stdout, /Upload model response/);
    modelId = stdout
      .split('/locations/us-central1/models/')[1]
      .split('\n')[0]
      .split('/')[0];
  });
  after('delete the model', async () => {
    execSync(`node ./delete-model.js ${modelId} ${project} ${location}`, {
      cwd,
    });
  });
});

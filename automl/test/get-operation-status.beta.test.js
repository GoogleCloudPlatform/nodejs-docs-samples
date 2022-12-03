// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      https://www.apache.org/licenses/LICENSE-2.0
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

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const GET_OPERATION_STATUS_REGION_TAG = 'beta/get-operation-status';
const LOCATION = 'us-central1';
const OPERATION_ID = 'TRL5980949629938696192';

describe('Automl Get Operation Status Tests', () => {
  const client = new AutoMlClient();

  it('should get operation status', async () => {
    const projectId = await client.getProjectId();

    const get_output = execSync(
      `node ${GET_OPERATION_STATUS_REGION_TAG}.js ${projectId} ${LOCATION} ${OPERATION_ID}`
    );
    assert.match(get_output, /Operation details/);
  });
});

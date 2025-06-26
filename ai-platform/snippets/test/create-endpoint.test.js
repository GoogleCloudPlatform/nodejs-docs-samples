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

const endpointDisplayName = `temp_create_endpoint_test_${uuid()}`;
const project = process.env.CAIP_PROJECT_ID;
const location = 'us-central1';
let endpointId;

describe('AI platform create endpoint', () => {
  it('should create a new endpoint', async () => {
    const stdout = execSync(
      `node ./create-endpoint.js ${endpointDisplayName} ${project} \
                                   ${location}`,
      {
        cwd,
      }
    );
    assert.match(stdout, /Create endpoint response/);
    endpointId = stdout
      .split('/locations/us-central1/endpoints/')[1]
      .split('\n')[0]
      .split('/')[0];
  });
  after('delete created endpoint', async () => {
    execSync(`node ./delete-endpoint.js ${endpointId} ${project} ${location}`, {
      cwd,
    });
  });
});

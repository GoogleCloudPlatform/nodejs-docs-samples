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

const customJobDisplayName = `temp_create_custom_job_test${uuid()}`;
const containerImageUri =
  'gcr.io/ucaip-sample-tests/ucaip-training-test:latest';
const project = process.env.CAIP_PROJECT_ID;
const location = 'us-central1';

function parseResponse(stdout) {
  let res = {};
  for (let i = 0; i < stdout.length; i++) {
    if (stdout[i] === '{') {
      res = JSON.parse(stdout.substr(i));
      break;
    }
  }
  return res;
}

let customJobId;

describe('AI platform create custom job', async function () {
  this.retries(2);
  it('should create a new custom job', async () => {
    const stdout = execSync(
      `node ./create-custom-job.js ${customJobDisplayName} \
                                     ${containerImageUri} \
                                     ${project} ${location}`,
      {
        cwd,
      }
    );
    assert.match(stdout, /Create custom job response/);
    customJobId = parseResponse(stdout).name.split('/').pop();
  });

  after('should cancel the customJob and delete it', async () => {
    execSync(
      `node ./cancel-custom-job.js ${customJobId} ${project} \
                                     ${location}`,
      {
        cwd,
      }
    );
    execSync(
      `node ./delete-custom-job.js ${customJobId} ${project} \
                                     ${location}`,
      {
        cwd,
      }
    );
  });
});

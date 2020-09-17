// Copyright 2018 Google LLC
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
const {describe, it} = require('mocha');
const cp = require('child_process');
const supertest = require('supertest');
const app = require('../app.js');
const request = supertest(app);

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const PROJECT_ID = process.env.GCLOUD_PROJECT;
const LOCATION_ID = process.env.LOCATION_ID || 'us-central1';
const SERVICE_ID = 'my-service';

describe('Cloud Scheduler Sample Tests', () => {
  let jobName;

  it('should create and delete a scheduler job', async () => {
    const stdout = execSync(
      `node createJob.js ${PROJECT_ID} ${LOCATION_ID} ${SERVICE_ID}`
    );
    assert.match(stdout, /Created job/);
    jobName = stdout.split('/').pop();
  });

  it('should update a scheduler job', async () => {
    const stdout = execSync(
      `node updateJob.js ${PROJECT_ID} ${LOCATION_ID} ${jobName}`
    );
    assert.match(stdout, /Updated job/);
  });

  it('should delete a scheduler job', async () => {
    const stdout = execSync(
      `node deleteJob.js ${PROJECT_ID} ${LOCATION_ID} ${jobName}`
    );
    assert.match(stdout, /Job deleted/);
  });
});

describe('Server should respond to /log_payload', () => {
  it('should log the payload', done => {
    const body = Buffer.from('test');
    request
      .post('/log_payload')
      .type('raw')
      .send(body)
      .expect(200, /Printed job/, done);
  });
});

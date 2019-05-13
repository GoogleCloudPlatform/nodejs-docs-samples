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
const cp = require('child_process');
const uuid = require('uuid');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const PROJECT_ID = process.env.GCLOUD_PROJECT;
const queueName = `gcloud-${uuid.v4().split('-')[0]}`;
const URL = `https://${PROJECT_ID}.appspot.com/log_payload`;
const SERVICE_ACCOUNT =
  'test-run-invoker@long-door-651.iam.gserviceaccount.com';

describe('Cloud Task Sample Tests', () => {
  it('should create a queue', () => {
    const stdout = execSync(`node createQueue ${PROJECT_ID} ${queueName}`);
    assert.match(stdout, /Created queue/);
  });

  it('should create a task', () => {
    const stdout = execSync(
      `node createTask ${PROJECT_ID} us-central1 ${queueName}`
    );
    assert.match(stdout, /Created task/);
  });

  it('quickstart sample should create a task', () => {
    const stdout = execSync(
      `node quickstart ${PROJECT_ID} us-central1 ${queueName}`
    );
    assert.match(stdout, /Created task/);
  });

  it('should create a HTTP task', () => {
    const stdout = execSync(
      `node createHttpTask ${PROJECT_ID} us-central1 my-appengine-queue ${URL}`
    );
    assert.match(stdout, /Created task/);
  });

  it('should create a HTTP task with token', () => {
    const stdout = execSync(
      `node createHttpTaskWithToken ${PROJECT_ID} us-central1 my-appengine-queue ${URL} ${SERVICE_ACCOUNT}`
    );
    assert.match(stdout, /Created task/);
  });

  it('should delete a queue', () => {
    const stdout = execSync(`node deleteQueue ${PROJECT_ID} ${queueName}`);
    assert.match(stdout, /Deleted queue/);
  });
});

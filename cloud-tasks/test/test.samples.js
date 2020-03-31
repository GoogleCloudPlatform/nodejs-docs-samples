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
const {describe, it, before} = require('mocha');
const {execSync} = require('child_process');
const uuid = require('uuid');
const {CloudTasksClient} = require('@google-cloud/tasks');

const exec = cmd => execSync(cmd, {encoding: 'utf-8'});
const queueName = `gcloud-${uuid.v4().split('-')[0]}`;
const SERVICE_ACCOUNT =
  'test-run-invoker@long-door-651.iam.gserviceaccount.com';

describe('Cloud Task Sample Tests', () => {
  let url;
  let projectId;

  before(async () => {
    const client = new CloudTasksClient();
    projectId = await client.getProjectId();
    url = 'https://example.com/taskhandler';
  });

  it('should create a queue', () => {
    const stdout = exec(`node createQueue ${projectId} ${queueName}`);
    assert.match(stdout, /Created queue/);
  });

  it('should create a task', () => {
    const stdout = exec(
      `node createTask ${projectId} ${queueName} us-central1`
    );
    assert.match(stdout, /Created task/);
  });

  it('quickstart sample should create a task', () => {
    const stdout = exec(
      `node quickstart ${projectId} us-central1 ${queueName}`
    );
    assert.match(stdout, /Created task/);
  });

  it('should create a HTTP task', () => {
    const stdout = exec(
      `node createHttpTask ${projectId} my-queue us-central1 ${url}`
    );
    assert.match(stdout, /Created task/);
  });

  it('should create a HTTP task with token', () => {
    const stdout = exec(
      `node createHttpTaskWithToken ${projectId} my-queue us-central1 ${url} ${SERVICE_ACCOUNT}`
    );
    assert.match(stdout, /Created task/);
  });

  it('should delete a queue', () => {
    const stdout = exec(`node deleteQueue ${projectId} ${queueName}`);
    assert.match(stdout, /Deleted queue/);
  });
});

// Copyright 2023 Google LLC
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

import {CloudSchedulerClient} from '@google-cloud/scheduler';
import {assert} from 'chai';
import {after, before, describe, it} from 'mocha';
import * as cp from 'child_process';

const client: CloudSchedulerClient = new CloudSchedulerClient();
const execSync = (cmd: string) => cp.execSync(cmd, {encoding: 'utf-8'});
const LOCATION_ID = process.env.LOCATION_ID || 'us-central1';
const SERVICE_ID = 'my-service';

describe('Cloud Scheduler Sample Tests', () => {
  let PROJECT_ID: string, stdout: string;

  before(async () => {
    PROJECT_ID = await client.getProjectId();
  });

  after(async () => {
    const jobName = (stdout && stdout.trim().split(' ').slice(-1))[0];
    if (jobName) {
      await client.deleteJob({name: jobName});
    }
  });

  it('should create a scheduler job', async () => {
    stdout = execSync(
      `node --loader ts-node/esm createJob.ts ${PROJECT_ID} ${LOCATION_ID} ${SERVICE_ID}`
    );
    assert.match(stdout, /Created job/);
  });
});

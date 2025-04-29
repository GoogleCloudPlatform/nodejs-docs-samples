// Copyright 2020 Google LLC
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
const {describe, it, before, after} = require('mocha');
const cp = require('child_process');
const {v4} = require('uuid');

const projectId = process.env.PROJECT_ID;
const region = 'us-central1';
const clusterName = `node-sj-test-${v4()}`;
const cluster = {
  projectId: projectId,
  region: region,
  cluster: {
    clusterName: clusterName,
    config: {
      masterConfig: {
        numInstances: 1,
        machineTypeUri: 'n1-standard-2',
      },
      workerConfig: {
        numInstances: 2,
        machineTypeUri: 'n1-standard-2',
      },
    },
  },
};

const dataproc = require('@google-cloud/dataproc');
const clusterClient = new dataproc.v1.ClusterControllerClient({
  apiEndpoint: `${region}-dataproc.googleapis.com`,
});

const execSync = cmd =>
  cp.execSync(cmd, {
    encoding: 'utf-8',
  });

describe('submit a Spark job to a Dataproc cluster', () => {
  before(async () => {
    const [operation] = await clusterClient.createCluster(cluster);
    await operation.promise();
  });

  it('should submit a job to a dataproc cluster', async () => {
    const stdout = execSync(
      `node submitJob.js "${projectId}" "${region}" "${clusterName}"`
    );
    assert.match(stdout, new RegExp('Job finished successfully'));
  });

  after(async () => {
    await clusterClient.deleteCluster({
      projectId: projectId,
      region: region,
      clusterName: clusterName,
    });
  });
});

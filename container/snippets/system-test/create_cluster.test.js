// Copyright 2022 Google LLC
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

const {assert, expect} = require('chai');
const {describe, it, before, after} = require('mocha');
const uuid = require('uuid');
const cp = require('child_process');
const container = require('@google-cloud/container');
const untilDone = require('./test_util.js');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const zones = [
  'us-central1-a',
  'us-central1-b',
  'us-central1-c',
  'us-central1-f',
];
const randomZone = zones[Math.floor(Math.random() * zones.length)];
const randomUUID = uuid.v1().substring(0, 8);
const randomClusterName = `nodejs-container-test-${randomUUID}`;
const client = new container.v1.ClusterManagerClient();
const ciNetwork = 'default-compute';
let projectId;
let clusterLocation;

// create a new cluster to test the delete sample on
before(async () => {
  projectId = await client.getProjectId();
  clusterLocation = `projects/${projectId}/locations/${randomZone}`;
});

// clean up the cluster regardless of whether the test passed or not
after(async () => {
  const request = {name: `${clusterLocation}/clusters/${randomClusterName}`};
  const [deleteOperation] = await client.deleteCluster(request);
  const opIdentifier = `${clusterLocation}/operations/${deleteOperation.name}`;
  await untilDone(client, opIdentifier);
});

describe('container samples - create cluster long running op', () => {
  it('should create cluster and wait for completion', async () => {
    const stdout = execSync(
      `node create_cluster.js ${randomClusterName} ${randomZone} ${ciNetwork}`
    );
    assert.match(
      stdout,
      /Cluster creation not complete. will try after .* delay/
    );
    assert.match(stdout, /Cluster creation completed./);
  });

  it('should contain the created cluster in list', async () => {
    const [response] = await client.listClusters({
      projectId: projectId,
      zone: randomZone,
    });
    const clustersList = response.clusters.reduce(
      (acc, curr) => [curr.name, ...acc],
      []
    );
    expect(clustersList).to.include(randomClusterName);
  });
});

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
const {describe, it, after, before} = require('mocha');
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
let test = true;

// create a new cluster to test the delete sample on
before(async () => {
  projectId = await client.getProjectId();
  clusterLocation = `projects/${projectId}/locations/${randomZone}`;
  const request = {
    parent: clusterLocation,
    cluster: {
      name: randomClusterName,
      network: ciNetwork,
      initialNodeCount: 2,
      nodeConfig: {machineType: 'e2-standard-2'},
    },
  };
  let createOperation;
  let opIdentifier;
  try {
    [createOperation] = await client.createCluster(request);
    opIdentifier = `${clusterLocation}/operations/${createOperation.name}`;
    await untilDone(client, opIdentifier);
  } catch (err) {
    if (
      err
        .toString()
        .includes('7 PERMISSION_DENIED: Insufficient regional quota')
    ) {
      test = false;
    } else {
      throw err;
    }
  }
});

// clean up the cluster regardless of whether the test passed or not
after(async () => {
  const request = {name: `${clusterLocation}/clusters/${randomClusterName}`};
  try {
    const [deleteOperation] = await client.deleteCluster(request);
    const opIdentifier = `${clusterLocation}/operations/${deleteOperation.name}`;
    await untilDone(client, opIdentifier);
  } catch (ex) {
    // Error code 5 is NOT_FOUND meaning the cluster was deleted during the test
    if (ex.code === 5) {
      return;
    }
  }
});

// run the tests
describe('container samples - delete cluster long running op', () => {
  it('should delete cluster and wait for completion', async () => {
    if (test) {
      const stdout = execSync(
        `node delete_cluster.js ${randomClusterName} ${randomZone}`
      );
      assert.match(
        stdout,
        /Cluster deletion not complete. will try after .* delay/
      );
      assert.match(stdout, /Cluster deletion completed./);
    }
  });

  it('should not see the deleted cluster in the list', async () => {
    if (test) {
      const [response] = await client.listClusters({
        projectId: projectId,
        zone: randomZone,
      });
      const clustersList = response.clusters.reduce(
        (acc, curr) => [curr.name, ...acc],
        []
      );
      expect(clustersList).to.not.include(randomClusterName);
    }
  });
});

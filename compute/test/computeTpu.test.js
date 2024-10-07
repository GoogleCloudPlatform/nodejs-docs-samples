/*
 * Copyright 2024 Google LLC
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
const assert = require('node:assert/strict');
const {before, after, describe, it} = require('mocha');
const cp = require('child_process');
const {NetworksClient, GlobalOperationsClient} =
  require('@google-cloud/compute').v1;
const {getStaleNodes, deleteNode} = require('./util');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

async function createNetwork(networkName, region) {
  const networksClient = new NetworksClient();
  const globalOperationsClient = new GlobalOperationsClient();
  const projectId = await networksClient.getProjectId();

  // Create the network
  const network = {
    name: networkName,
    autoCreateSubnetworks: true,
    routingMode: 'REGIONAL',
  };

  const [networkResponse] = await networksClient.insert({
    project: projectId,
    region: region,
    networkResource: network,
  });

  let networkOperation = networkResponse.latestResponse;

  // Wait for the create operation to complete.
  while (networkOperation.status !== 'DONE') {
    [networkOperation] = await globalOperationsClient.wait({
      operation: networkOperation.name,
      project: projectId,
    });
  }

  console.log(`Network ${networkName} created in region ${region}.`);
}

async function deleteNetwork(networkName) {
  const networksClient = new NetworksClient();
  const globalOperationsClient = new GlobalOperationsClient();
  const projectId = await networksClient.getProjectId();

  const [networkResponse] = await networksClient.delete({
    project: projectId,
    network: networkName,
  });

  let networkOperation = networkResponse.latestResponse;

  // Wait for the operation to complete.
  while (networkOperation.status !== 'DONE') {
    [networkOperation] = await globalOperationsClient.wait({
      operation: networkOperation.name,
      project: projectId,
    });
  }
}

describe('Compute tpu', async () => {
  const nodePrefix = 'node-name-2a2b3c';
  const nodeName = `${nodePrefix}${Math.floor(Math.random() * 1000 + 1)}`;
  const networkName = 'compute-tpu-network';
  const region = 'europe-west4';
  const zone = `${region}-a`;
  const tpuType = 'v2-8';
  const tpuSoftwareVersion = 'tpu-vm-tf-2.14.1';

  before(async () => {
    // Cleanup resources
    const nodes = await getStaleNodes(nodePrefix, zone);
    await Promise.all(nodes.map(node => deleteNode(zone, node.nodeName)));
    // Create network
    await createNetwork(networkName, region);
  });

  after(async () => {
    // Delete network
    await deleteNetwork(networkName);
  });

  it('should create a new tpu node', () => {
    const response = execSync(
      `node ./tpu/vmCreate.js ${nodeName} ${zone} ${tpuType} ${tpuSoftwareVersion}`,
      {
        cwd,
      }
    );
    assert(response.includes(`TPU VM: ${nodeName} created.`));
  });

  it('should return tpu node', () => {
    const response = execSync(`node ./tpu/vmGet.js ${nodeName} ${zone}`, {
      cwd,
    });

    assert(response.includes(`Node: ${nodeName} retrived.`));
  });

  it('should return list of tpu nodes', () => {
    const response = JSON.parse(
      execSync(`node ./tpu/vmList.js ${zone}`, {
        cwd,
      })
    );

    assert(Array.isArray(response));
  });

  it('should delete tpu node', () => {
    const response = execSync(`node ./tpu/vmDelete.js ${nodeName} ${zone}`, {
      cwd,
    });

    assert(response.includes(`Node: ${nodeName} deleted.`));
  });
});

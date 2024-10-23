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
const {describe, it} = require('mocha');
const cp = require('child_process');
const {TpuClient} = require('@google-cloud/tpu').v2alpha1;

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

async function waitForTPUCreation(nodeName, zone) {
  const tpuClient = new TpuClient();
  const projectId = await tpuClient.getProjectId();

  // Give a time to start process of creating TPU Node
  await new Promise(resolve => setTimeout(resolve, 60000));

  const getNodeRequest = {
    name: `projects/${projectId}/locations/${zone}/nodes/${nodeName}`,
  };

  console.log(`Waiting for TPU node ${nodeName} to become ready...`);

  let state;

  while (state !== 'READY') {
    try {
      state = (await tpuClient.getNode(getNodeRequest))[0].state;
      // Wait another minute to try
      await new Promise(resolve => setTimeout(resolve, 60000));
    } catch (err) {
      console.log('TPU node not ready');
      // Wait another minute to try
      await new Promise(resolve => setTimeout(resolve, 60000));
    }
  }
}

describe('TPU queued resource', () => {
  const queuedResourceName = `queued-resource-name-1a2sdf${Math.floor(Math.random() * 1000 + 1)}`;
  const nodePrefix = 'node-name-2a2b3c';
  const nodeName = `${nodePrefix}${Math.floor(Math.random() * 1000 + 1)}`;
  const zone = 'us-central1-f';
  const tpuType = 'v2-8';
  const tpuSoftwareVersion = 'tpu-vm-tf-2.14.1';

  it('should create a new queued resource', async () => {
    const response = execSync(
      `node ./queuedResources/createQueuedResource.js ${nodeName} ${queuedResourceName} ${zone} ${tpuType} ${tpuSoftwareVersion}`,
      {
        cwd,
      }
    );
    assert(response.includes(`Queued resource ${queuedResourceName} created.`));
  });

  it('should return requested queued resource', () => {
    const response = execSync(
      `node ./queuedResources/getQueuedResource.js ${queuedResourceName} ${zone}`,
      {
        cwd,
      }
    );

    assert(
      response.includes(`Queued resource ${queuedResourceName} retrived.`)
    );
  });

  it('should return list of queued resources', () => {
    const response = JSON.parse(
      execSync(`node ./queuedResources/getQueuedResourcesList.js ${zone}`, {
        cwd,
      })
    );

    assert(Array.isArray(response));
  });

  it('should delete queued resource', async () => {
    // Wait until queued resource is ready to delete.
    await waitForTPUCreation(nodeName, zone);
    const response = execSync(
      `node ./queuedResources/deleteQueuedResource.js ${queuedResourceName} ${zone}`,
      {
        cwd,
      }
    );
    assert(response.includes(`Queued resource ${queuedResourceName} deleted.`));
  });
});

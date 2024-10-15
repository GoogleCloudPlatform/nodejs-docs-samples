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
const {after, describe, it} = require('mocha');
const cp = require('child_process');
const {getStaleNodes, deleteNode} = require('./util');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

describe('Compute tpu with topology', async () => {
  const nodePrefix = 'topology-node-name-2a2b3c';
  const nodeName = `${nodePrefix}${Math.floor(Math.random() * 1000 + 1)}`;
  const zone = 'asia-east1-c';
  const tpuSoftwareVersion = 'tpu-vm-tf-2.12.1';

  after(async () => {
    // Clean-up resources
    const nodes = await getStaleNodes(nodePrefix);
    await Promise.all(nodes.map(node => deleteNode(node.zone, node.nodeName)));
  });

  it('should create a new tpu with topology', () => {
    const acceleratorConfig = {type: 'V2', topology: '2x2'};

    const response = JSON.parse(
      execSync(
        `node ./createTopologyVM.js ${nodeName} ${zone} ${tpuSoftwareVersion}`,
        {
          cwd,
        }
      )
    );

    assert.deepEqual(response.acceleratorConfig, acceleratorConfig);
  });
});

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

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

describe('TPU time bound queued resource', async () => {
  const queuedResourceName = `queued-resource-time-bound-${Math.floor(Math.random() * 1000 + 1)}`;
  const nodeName = `node-time-bound-2a2b3c${Math.floor(Math.random() * 1000 + 1)}`;
  const zone = 'us-west4-a';
  const tpuType = 'v5litepod-1';
  const tpuSoftwareVersion = 'tpu-vm-tf-2.14.1';

  after(() => {
    // Delete queued resource
    execSync(
      `node ./queuedResources/forceDeleteQueuedResource.js ${queuedResourceName} ${zone}`,
      {
        cwd,
      }
    );
  });

  it('should create queued resource', () => {
    const response = JSON.parse(
      execSync(
        `node ./queuedResources/createQueuedResourceTimeBound.js ${nodeName} ${queuedResourceName} ${zone} ${tpuType} ${tpuSoftwareVersion}`,
        {
          cwd,
        }
      )
    );

    assert.ok(response.queueingPolicy);
    assert.ok(response.queueingPolicy.validAfterTime);
    assert(typeof response.queueingPolicy.validAfterTime.seconds, 'string');
    assert(typeof response.queueingPolicy.validAfterTime.nano, 'number');
  });
});

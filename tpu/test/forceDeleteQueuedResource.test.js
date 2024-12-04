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

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

describe('TPU queued resource force deletion', async () => {
  const queuedResourceName = `queued-resource-force-delete-${Math.floor(Math.random() * 1000 + 1)}`;
  const nodePrefix = 'node-force-delete-2a2b3c';
  const nodeName = `${nodePrefix}${Math.floor(Math.random() * 1000 + 1)}`;
  const zone = 'us-central1-c';
  const tpuType = 'v2-8';
  const tpuSoftwareVersion = 'tpu-vm-tf-2.14.1';

  it('should force queued resource deletion', () => {
    // Create queued resource
    execSync(
      `node ./queuedResources/createQueuedResource.js ${nodeName} ${queuedResourceName} ${zone} ${tpuType} ${tpuSoftwareVersion}`,
      {
        cwd,
      }
    );

    const response = execSync(
      `node ./queuedResources/forceDeleteQueuedResource.js ${queuedResourceName} ${zone}`,
      {
        cwd,
      }
    );

    assert(
      response.includes(
        `Queued resource ${queuedResourceName} deletion forced.`
      )
    );
  });
});

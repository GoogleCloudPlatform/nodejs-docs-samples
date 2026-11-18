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

const compute = require('@google-cloud/compute');

const {after, before, describe, it} = require('mocha');
const cp = require('child_process');
const {assert} = require('chai');

const {
  generateTestId,
  deleteInstance,
  cleanupStaleResources,
} = require('./util');

const instancesClient = new compute.InstancesClient();

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

describe('creating managing windows instances tests', () => {
  const externalInstanceName = generateTestId();
  const internalInstanceName = generateTestId();
  const networkName = 'global/networks/default';
  const subnetworkName = 'regions/europe-central2/subnetworks/default';
  const zone = 'europe-central2-b';
  const machineType = 'n1-standard-1';
  const sourceImageFamily = 'windows-2022';

  before(async () => {
    await cleanupStaleResources();
  });

  after(async () => {
    await Promise.all([
      deleteInstance(zone, externalInstanceName),
      deleteInstance(zone, internalInstanceName),
    ]);
  });

  it('should create windows server instance with external IP', async () => {
    const projectId = await instancesClient.getProjectId();

    const output = execSync(
      `node instances/windows/creating-managing-windows-instances/createWindowsServerInstanceExternalIP ${projectId} ${zone} ${externalInstanceName}`
    );
    assert.match(output, /Instance created./);

    execSync(
      `node deleteInstance ${projectId} ${zone} ${externalInstanceName}`
    );
  });

  // eslint-disable-next-line prefer-arrow-callback
  it('should create windows server instance with internal IP and firewall rule', async function () {
    try {
      const projectId = await instancesClient.getProjectId();

      const output = execSync(
        `node instances/windows/creating-managing-windows-instances/createWindowsServerInstanceInternalIP ${projectId} ${zone} ${internalInstanceName} ${machineType} ${sourceImageFamily} ${networkName} ${subnetworkName}`
      );

      assert.match(output, /Instance created./);

      execSync(
        `node deleteInstance ${projectId} ${zone} ${internalInstanceName}`
      );
    } catch (err) {
      if (
        err.message &&
        err.message.includes('subnetwork resource cannot be found')
      ) {
        console.warn(
          `Skipping test: Default subnetwork not found in region ${zone}. Reason: ${err.message}`
        );
        this.skip();
      } else {
        throw err;
      }
    }
  });
});

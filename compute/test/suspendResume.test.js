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

const {describe, it} = require('mocha');
const cp = require('child_process');
const {assert} = require('chai');

const {generateTestId, getStaleVMInstances, deleteInstance} = require('./util');

const instancesClient = new compute.InstancesClient();
const zoneOperationsClient = new compute.ZoneOperationsClient();

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

describe('suspend/resume instance tests', () => {
  const instanceName = generateTestId();
  const zone = 'europe-central2-b';

  const delay = ms => new Promise(res => setTimeout(res, ms));

  const getInstance = async (projectId, zone, instanceName) => {
    const [instance] = await instancesClient.get({
      project: projectId,
      zone,
      instance: instanceName,
    });
    return instance;
  };

  after(async () => {
    const instances = await getStaleVMInstances();
    await Promise.all(
      instances.map(instance =>
        deleteInstance(instance.zone, instance.instanceName)
      )
    );
  });

  it('should suspend and resume instance', async () => {
    const projectId = await instancesClient.getProjectId();

    const [insertResponse] = await instancesClient.insert({
      instanceResource: {
        name: instanceName,
        disks: [
          {
            initializeParams: {
              diskSizeGb: '64',
              sourceImage:
                'projects/ubuntu-os-cloud/global/images/family/ubuntu-2004-lts',
            },
            autoDelete: true,
            boot: true,
          },
        ],
        machineType: `zones/${zone}/machineTypes/n1-standard-1`,
        networkInterfaces: [
          {
            name: 'global/networks/default',
          },
        ],
      },
      project: projectId,
      zone,
    });
    let operation = insertResponse.latestResponse;

    while (operation.status !== 'DONE') {
      [operation] = await zoneOperationsClient.wait({
        operation: operation.name,
        project: projectId,
        zone: operation.zone.split('/').pop(),
      });
    }

    // Once the machine is running, give it some time to fully start all processes
    // before trying to suspend it.
    await delay(45 * 1000);

    let output = execSync(
      `node instances/suspend-resume/suspend ${projectId} ${zone} ${instanceName}`
    );
    assert.match(output, /Instance suspended./);

    let instance = await getInstance(projectId, zone, instanceName);

    while (instance.status === 'SUSPENDING') {
      [instance] = await instancesClient.get({
        project: projectId,
        zone,
        instance: instanceName,
      });

      await delay(5 * 1000);
    }

    instance = await getInstance(projectId, zone, instanceName);

    assert.equal(instance.status, 'SUSPENDED');

    output = execSync(
      `node instances/suspend-resume/resume ${projectId} ${zone} ${instanceName}`
    );
    assert.match(output, /Instance resumed./);

    instance = await getInstance(projectId, zone, instanceName);

    assert.equal(instance.status, 'RUNNING');

    execSync(`node deleteInstance ${projectId} ${zone} ${instanceName}`);
  });
});
